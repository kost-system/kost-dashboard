import { InvoiceStatus, RoomStatus, ExpenseCategory, VerificationStatus } from '../types';

/**
 * Format numbers as Indonesian Rupiah (e.g. Rp 1.500.000)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format standard YYYY-MM-DD or ISO dates into Indonesian human format (e.g. 20 Okt 2026)
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

/**
 * Format YYYY-MM into Month Year in Indonesian (e.g. 2026-10 -> Oktober 2026)
 */
export function formatMonthPeriod(periodStr: string): string {
  if (!periodStr) return '-';
  const parts = periodStr.split('-');
  if (parts.length < 2) return periodStr;
  const year = parts[0];
  const month = parseInt(parts[1], 10);
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  if (month >= 1 && month <= 12) {
    return `${monthNames[month - 1]} ${year}`;
  }
  return periodStr;
}

/**
 * Invoice status UI config
 */
export function getInvoiceStatusConfig(status: InvoiceStatus): { label: string; bg: string; text: string; border: string } {
  switch (status) {
    case 'paid':
      return {
        label: 'Lunas',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200'
      };
    case 'pending_verification':
      return {
        label: 'Menunggu Verifikasi',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200'
      };
    case 'overdue':
      return {
        label: 'Jatuh Tempo',
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200'
      };
    case 'rejected':
      return {
        label: 'Ditolak',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200'
      };
    case 'unpaid':
    default:
      return {
        label: 'Belum Bayar',
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200'
      };
  }
}

/**
 * Room status UI config
 */
export function getRoomStatusConfig(status: RoomStatus): { label: string; bg: string; text: string; dot: string } {
  switch (status) {
    case 'occupied':
      return {
        label: 'Terisi',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        text: 'text-blue-700',
        dot: 'bg-blue-600'
      };
    case 'available':
      return {
        label: 'Tersedia',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        text: 'text-emerald-700',
        dot: 'bg-emerald-600'
      };
    case 'maintenance':
    default:
      return {
        label: 'Pemeliharaan',
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        text: 'text-slate-600',
        dot: 'bg-slate-400'
      };
  }
}

/**
 * Expense category labels
 */
export function getExpenseCategoryLabel(category: ExpenseCategory): string {
  switch (category) {
    case 'maintenance':
      return 'Pemeliharaan & Servis';
    case 'utilities':
      return 'Utilitas (Listrik & Air)';
    case 'cleaning':
      return 'Kebersihan & Sampah';
    case 'security':
      return 'Keamanan';
    case 'operational':
    default:
      return 'Operasional Lainnya';
  }
}

/**
 * Export data to real downloadable CSV file
 */
export function downloadCSV(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\r\n');

  // Add UTF-8 BOM so Excel opens it with correct encoding
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
