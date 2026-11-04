# KostFlow — Sistem Manajemen Rumah Kost (Next.js & React Ready)

KostFlow adalah aplikasi web modern, konsisten, dan fungsional untuk manajemen operasional dan keuangan rumah kost.

---

## Arsitektur & Dukungan Next.js

Seluruh kode sumber KostFlow telah dirancang dan dioptimalkan agar **kompatibel 100% dengan Next.js App Router (Next.js 14 / 15)**:

### 1. Struktur Next.js App Router yang Telah Disediakan
- `src/app/layout.tsx` — Root layout dengan deklarasi `metadata` (SEO, OpenGraph, Twitter Card) dan Google Fonts (Plus Jakarta Sans & JetBrains Mono).
- `src/app/page.tsx` — Halaman utama App Router (`'use client'`) dengan proteksi SSR hydration-safe.
- `src/app/globals.css` — Global styling dan konfigurasi tema Tailwind CSS.
- `next.config.mjs` — Konfigurasi resmi Next.js (optimasi gambar & StrictMode).
- `src/context/KostContext.tsx` — State store reaktif dengan direktif `'use client'` dan pengecekan aman `typeof window !== 'undefined'` untuk akses `localStorage`.
- `src/components/` — Komponen modular murni React yang dapat langsung digunakan pada Next.js App Router.

---

## Menjalankan di Next.js Mandiri / Vercel

Jika Anda ingin menjalankan atau men-deploy proyek ini ke Next.js (misalnya di Vercel atau VPS pribadi):

1. **Pasang dependensi Next.js:**
   ```bash
   npm install next react react-dom lucide-react
   npm install -D @tailwindcss/postcss postcss
   ```

2. **Perbarui skrip di `package.json`:**
   ```json
   "scripts": {
     "dev": "next dev",
     "build": "next build",
     "start": "next start",
     "lint": "next lint"
   }
   ```

3. **Jalankan server pengembangan:**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

---

## Fitur Utama KostFlow

1. **Dashboard Adaptif Berdasarkan Peran:**
   - 4 Kartu ringkasan utama: Total Kamar & Okupansi, Kamar Terisi vs Kosong, Tagihan Belum Lunas, Pembayaran Menunggu Verifikasi.
   - Antrean cepat verifikasi bukti bayar.
   - Peta status keterisian kamar dan riwayat transaksi kas terkini.
2. **Kamar:** CRUD data kamar, penentuan harga bulanan, status *Tersedia*, *Terisi*, atau *Pemeliharaan*.
3. **Penghuni:** Pendaftaran penghuni baru, penetapan kamar, kontak darurat, dan alur check-out otomatis.
4. **Tagihan & Pembayaran:**
   - Pembuatan faktur tunggal atau *Generate Rutin Bulanan* untuk seluruh penghuni aktif dalam 1 klik.
   - Dukungan Transfer Bank (BCA) dan QRIS.
   - Alur verifikasi resi: penghuni mengunggah bukti bayar -> pengelola meninjau dan menyetujui/menolak dengan alasan.
5. **Pengeluaran Operasional:** Pencatatan biaya utilitas (listrik/air), pemeliharaan, kebersihan, dan operasional lainnya.
6. **Laporan Keuangan & Integritas Kas:**
   - Memisahkan pendapatan kas terkonfirmasi, piutang, pending verifikasi, dan arus kas bersih.
   - Filter bulanan dan tahunan.
   - Tombol **Unduh Laporan CSV** berfungsi nyata.
7. **Pengaturan:** Konfigurasi rekening, QRIS, dan peralihan akun demo instan.
