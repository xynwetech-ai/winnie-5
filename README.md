# Winnie 5 — Deploy ke Vercel

## Struktur folder
```
index.html      <- halaman app (sudah di-obfuscate)
api/chat.js     <- serverless proxy ke Groq (nyimpen API key di server)
```

## Langkah deploy

1. Push folder ini ke repo GitHub (atau langsung drag-drop / `vercel` CLI).
2. Di dashboard Vercel, buka project > **Settings > Environment Variables**.
3. Tambahkan variable:
   - **Name:** `GROQ_API_KEY`
   - **Value:** API key Groq kamu (yang lama sudah kepakai/bocor di source code lama — sebaiknya kamu **generate key baru** di console.groq.com dan cabut/revoke yang lama, karena yang lama sempat ada di client-side code publik).
4. Deploy seperti biasa (`vercel --prod` atau lewat GitHub integration).

Setelah itu, semua request AI dari browser akan lewat `/api/chat` (domain kamu sendiri), bukan langsung ke Groq. Key-nya cuma ada di environment variable server, nggak pernah dikirim ke browser pengguna.

## Soal "orang nggak bisa ambil kodenya"

Penting untuk kamu tahu batasannya:

- **View-source akan menampilkan teks acak/gibberish**, bukan HTML/JS yang gampang dibaca-copas. Ini bikin orang iseng nggak bisa langsung "save as" dan pakai ulang.
- **Ini bukan enkripsi yang tidak bisa dipecahkan.** Browser tetap harus menjalankan kode aslinya supaya app-nya jalan, jadi teknik decode-nya (XOR + base64, ada di dalam `<script>` stub) tetap ada di halaman itu sendiri. Orang yang cukup ngerti JS & mau meluangkan waktu tetap bisa reverse-engineer.
- **API key sekarang aman** bahkan kalau orang berhasil reverse HTML-nya, karena key-nya sudah tidak ada di file ini sama sekali — hanya ada di server Vercel.
- Sudah disiapkan opsi environment variable `ALLOWED_ORIGIN` di `api/chat.js` — kalau kamu set ini ke domain final kamu (misal `https://winnie5.vercel.app`), proxy-nya akan **menolak** request yang datang dari domain lain. Jadi walaupun orang berhasil copy tampilan/frontend-nya, backend-mu tetap nggak bisa dipakai dari domain mereka.

## Yang sudah diubah dari versi lama
- Brand "VosixXS AI" → **"Winnie 5"** (title, sidebar, placeholder, system prompt, nama-nama tier model, key localStorage)
- API key Groq dipindah dari client-side ke server (`api/chat.js`), key lama di kode sumbernya dihapus total
- Halaman dibungkus obfuscation XOR+base64 (sudah dicek round-trip 100% identik dengan versi asli, jadi fungsinya tidak berubah)
