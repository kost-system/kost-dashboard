# Kost Dashboard

Dashboard manajemen operasional kos modern berbasis web untuk pemilik (owner) dan pengelola kos. Terhubung langsung dengan **Kost Backend API**.

## 🚀 Fitur Utama
- **Overview & Metrik Finansial**: Ringkasan kamar terisi, pendapatan bulanan, tagihan tertunggak, dan rasio okupansi.
- **Manajemen Kamar**: Pemantauan status kamar (Tersedia, Terisi, Perbaikan), penambahan, serta pengubahan tarif sewa.
- **Manajemen Penghuni**: Data penyewa aktif, riwayat kamar, kontak darurat, dan proses check-out.
- **Pusat Tagihan & Pembayaran**: 
  - Pembuatan tagihan satuan atau otomatis massal per bulan.
  - Review bukti transfer / QRIS dari penyewa dengan modal verifikasi dan alasan penolakan.
- **Pencatatan Biaya & Laporan**: Pembukuan pengeluaran operasional (listrik, air, wifi, pemeliharaan) beserta ringkasan laba/rugi.
- **Pengaturan Kos**: Pengaturan data rekening bank pemilik dan QRIS usaha.

## 🛠️ Tech Stack
- **Framework**: Next.js 15 / React 19
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icon**: Lucide React
- **Komunikasi Data**: REST API Client terhubung ke `http://localhost:5000/api`

## 📦 Menjalankan Proyek

### 1. Instalasi Dependensi
```bash
npm install --legacy-peer-deps
```

### 2. Konfigurasi Backend
Pastikan `kost_backend` telah aktif di `http://localhost:5000`.

### 3. Jalankan Mode Development
```bash
npm run dev
```
Buka browser di: `http://localhost:3000`

### 4. Build Production
```bash
npm run build
npm start
```
