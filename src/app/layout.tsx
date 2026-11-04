import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: 'KostFlow - Dashboard Manajemen Kost',
  description:
    'Sistem manajemen operasional dan keuangan rumah kost modern: kelola kamar, penghuni, tagihan, verifikasi pembayaran transfer & QRIS, pengeluaran, dan laporan keuangan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* Midtrans Snap JS (Sandbox mode default) */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js"
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="lazyOnload"
        />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased font-sans selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}
