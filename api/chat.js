// Vercel Edge Function — proxy ke Groq.
// API key HANYA hidup di sini (server), diambil dari Environment Variable
// GROQ_API_KEY di dashboard Vercel. Tidak pernah dikirim ke browser.

export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'GROQ_API_KEY belum di-set di Environment Variables Vercel' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Opsional: kunci proxy ini biar cuma domain kamu sendiri yang boleh manggil.
  // Set ALLOWED_ORIGIN di Environment Variables Vercel, misalnya:
  //   https://winnie5.vercel.app
  // Kalau ALLOWED_ORIGIN tidak di-set, pengecekan ini dilewati (default: bebas).
  const allowedOrigin = process.env.ALLOWED_ORIGIN;
  if (allowedOrigin) {
    const origin = req.headers.get('origin') || req.headers.get('referer') || '';
    if (!origin.startsWith(allowedOrigin)) {
      return new Response(JSON.stringify({ error: 'Origin tidak diizinkan' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  let payload;
  try {
    payload = await req.text();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Body tidak valid' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
    body: payload,
  });

  // Teruskan response Groq apa adanya (termasuk stream SSE) ke client,
  // tanpa pernah menyisipkan/menyingkap API key.
  return new Response(groqRes.body, {
    status: groqRes.status,
    headers: {
      'Content-Type': groqRes.headers.get('Content-Type') || 'application/json',
    },
  });
}
