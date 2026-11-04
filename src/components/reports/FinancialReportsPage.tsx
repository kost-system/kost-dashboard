import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import {
  formatRupiah,
  formatDate,
  formatMonthPeriod,
  getExpenseCategoryLabel,
  downloadCSV,
} from '../../utils/formatters';
import {
  BarChart3,
  Download,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingDown,
  TrendingUp,
  Receipt,
  FileSpreadsheet,
  Info
} from 'lucide-react';

export const FinancialReportsPage: React.FC = () => {
  const { invoices, submissions, expenses, tenants, rooms, settings } = useKost();

  const [periodType, setPeriodType] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-10');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Available unique periods
  const allMonths = Array.from(
    new Set([
      ...invoices.map((i) => i.periodMonth),
      ...expenses.map((e) => e.date.substring(0, 7)),
    ])
  ).sort().reverse();

  const allYears = Array.from(
    new Set([
      ...invoices.map((i) => i.periodMonth.substring(0, 4)),
      ...expenses.map((e) => e.date.substring(0, 4)),
    ])
  ).sort().reverse();

  // Filter criteria
  const isTargetPeriod = (dateOrPeriod: string) => {
    if (periodType === 'monthly') {
      return dateOrPeriod.startsWith(selectedMonth);
    } else {
      return dateOrPeriod.startsWith(selectedYear);
    }
  };

  // 1. Confirmed Cash Income (ONLY invoices with status 'paid' that were paid during this period)
  const confirmedInvoices = invoices.filter(
    (inv) => inv.status === 'paid' && isTargetPeriod(inv.periodMonth)
  );
  const confirmedCashIncome = confirmedInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // 2. Outstanding Receivables (unpaid & overdue invoices for this period)
  const outstandingInvoices = invoices.filter(
    (inv) => (inv.status === 'unpaid' || inv.status === 'overdue') && isTargetPeriod(inv.periodMonth)
  );
  const totalOutstandingReceivables = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // 3. Pending Payments awaiting verification
  const pendingInvoices = invoices.filter(
    (inv) => inv.status === 'pending_verification' && isTargetPeriod(inv.periodMonth)
  );
  const totalPendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // 4. Rejected Payments
  const rejectedInvoices = invoices.filter(
    (inv) => inv.status === 'rejected' && isTargetPeriod(inv.periodMonth)
  );
  const totalRejectedAmount = rejectedInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // 5. Operating Expenses
  const periodExpenses = expenses.filter((e) => isTargetPeriod(e.date));
  const totalOperatingExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 6. Net Cash Flow = Confirmed Income - Recorded Expenses
  // (Strict rule: Never counts receivables or pending as cash!)
  const netCashFlow = confirmedCashIncome - totalOperatingExpenses;

  // Breakdown of expenses by category
  const expensesByCategory: Record<string, number> = {};
  periodExpenses.forEach((e) => {
    expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
  });

  // Export real CSV function
  const handleExportCSV = () => {
    const periodLabel = periodType === 'monthly' ? formatMonthPeriod(selectedMonth) : `Tahun ${selectedYear}`;
    const filename = `Laporan-Keuangan-KostFlow-${periodType === 'monthly' ? selectedMonth : selectedYear}.csv`;

    const headers = ['Kategori / Tipe', 'Uraian / Nomor Referensi', 'Pihak Terkait', 'Tanggal', 'Status', 'Jumlah (IDR)'];
    const rows: (string | number)[][] = [];

    // Header summary info
    rows.push(['RINGKASAN LAPORAN KEUANGAN KOSTFLOW', periodLabel, '', '', '', '']);
    rows.push(['Properti', settings.kostName, '', '', '', '']);
    rows.push(['Dicetak Pada', new Date().toLocaleString('id-ID'), '', '', '', '']);
    rows.push(['----------------------------', '----------------------------', '----------------------------', '----------------------------', '----------------------------', '----------------------------']);

    // 1. Confirmed Cash Incomes
    rows.push(['PEMASUKAN KAS TERKONFIRMASI (LUNAS)', '', '', '', '', '']);
    confirmedInvoices.forEach((inv) => {
      const ten = tenants.find((t) => t.id === inv.tenantId);
      const rm = rooms.find((r) => r.id === inv.roomId);
      rows.push([
        'Pemasukan Sewa',
        inv.invoiceNumber,
        `${ten?.name || 'Penghuni'} (Kamar ${rm?.number || '-'})`,
        inv.paidAt ? formatDate(inv.paidAt) : formatDate(inv.dueDate),
        'Lunas Terverifikasi',
        inv.amount,
      ]);
    });
    rows.push(['Subtotal Pemasukan Kas', '', '', '', '', confirmedCashIncome]);
    rows.push(['', '', '', '', '', '']);

    // 2. Operating Expenses
    rows.push(['PENGELUARAN OPERASIONAL', '', '', '', '', '']);
    periodExpenses.forEach((exp) => {
      rows.push([
        `Pengeluaran (${getExpenseCategoryLabel(exp.category)})`,
        exp.description,
        exp.recordedBy,
        formatDate(exp.date),
        'Tercatat',
        -exp.amount,
      ]);
    });
    rows.push(['Subtotal Pengeluaran Kas', '', '', '', '', -totalOperatingExpenses]);
    rows.push(['', '', '', '', '', '']);

    // 3. Net Cash Flow
    rows.push(['ARUS KAS BERSIH (NET CASH FLOW)', 'Pemasukan Kas - Pengeluaran Kas', '', '', '', netCashFlow]);
    rows.push(['', '', '', '', '', '']);

    // 4. Receivables & Pending for Integrity
    rows.push(['INFORMASI PIUTANG & STATUS MENUNGGU (BUKAN KAS)', '', '', '', '', '']);
    outstandingInvoices.forEach((inv) => {
      const ten = tenants.find((t) => t.id === inv.tenantId);
      const rm = rooms.find((r) => r.id === inv.roomId);
      rows.push([
        'Piutang Tertunggak',
        inv.invoiceNumber,
        `${ten?.name || 'Penghuni'} (Kamar ${rm?.number || '-'})`,
        formatDate(inv.dueDate),
        inv.status === 'overdue' ? 'Jatuh Tempo' : 'Belum Bayar',
        inv.amount,
      ]);
    });
    rows.push(['Total Piutang Belum Lunas', '', '', '', '', totalOutstandingReceivables]);
    rows.push(['Total Pembayaran Menunggu Verifikasi', '', '', '', '', totalPendingAmount]);
    rows.push(['Total Pengajuan Ditolak', '', '', '', '', totalRejectedAmount]);

    downloadCSV(filename, headers, rows);
  };

  const periodDisplayName = periodType === 'monthly' ? formatMonthPeriod(selectedMonth) : `Tahun ${selectedYear}`;

  return (
    <div className="space-y-6">
      {/* Header and Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Laporan Keuangan
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Rekapitulasi pendapatan kas masuk, beban operasional, dan arus kas bersih
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Period Type Segmented */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setPeriodType('monthly')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                periodType === 'monthly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bulanan
            </button>
            <button
              onClick={() => setPeriodType('yearly')}
              className={`px-3 py-1 font-medium rounded-md transition-colors ${
                periodType === 'yearly'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tahunan
            </button>
          </div>

          {/* Period Selector */}
          {periodType === 'monthly' ? (
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-hidden"
            >
              {allMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthPeriod(m)}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-hidden"
            >
              {allYears.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
          )}

          {/* Export to CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
            title="Download file CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Unduh Laporan CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Integrity Banner */}
      <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-semibold">Prinsip Integritas Keuangan KostFlow: </span>
          <span>
            Arus kas bersih hanya menghitung pendapatan kas yang <strong>telah diverifikasi (Lunas)</strong> dikurangi beban operasional yang dicatat. Tagihan belum bayar dan bukti pembayaran yang masih menunggu verifikasi dikelompokkan secara terpisah dan tidak diakui sebagai uang kas masuk.
          </span>
        </div>
      </div>

      {/* 6 Key Financial Integrity Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Metric 1: Confirmed Cash Income */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pendapatan Kas Terkonfirmasi
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {formatRupiah(confirmedCashIncome)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Dari {confirmedInvoices.length} tagihan sewa lunas terverifikasi
          </p>
        </div>

        {/* Metric 2: Recorded Operating Expenses */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pengeluaran Operasional
            </span>
            <TrendingDown className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
            {formatRupiah(totalOperatingExpenses)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {periodExpenses.length} transaksi pengeluaran operasional
          </p>
        </div>

        {/* Metric 3: Net Cash Flow */}
        <div className="p-5 bg-slate-900 text-white rounded-xl border border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Arus Kas Bersih (Net Cash Flow)
            </span>
            <TrendingUp className={`w-4 h-4 ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
          </div>
          <div className={`text-2xl font-bold font-mono tabular-nums ${netCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatRupiah(netCashFlow)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Pemasukan terkonfirmasi dikurangi pengeluaran riil
          </p>
        </div>

        {/* Metric 4: Outstanding Receivables */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Piutang Belum Lunas
            </span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRupiah(totalOutstandingReceivables)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {outstandingInvoices.length} tagihan belum dibayarkan oleh penghuni
          </p>
        </div>

        {/* Metric 5: Pending Verification */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menunggu Verifikasi
            </span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums">
            {formatRupiah(totalPendingAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {pendingInvoices.length} pembayaran belum disetujui di rekening
          </p>
        </div>

        {/* Metric 6: Rejected Submissions */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pembayaran Ditolak
            </span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold text-slate-700 font-mono tabular-nums">
            {formatRupiah(totalRejectedAmount)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {rejectedInvoices.length} bukti transfer tidak sah atau ditolak
          </p>
        </div>
      </div>

      {/* Detailed Tables Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Confirmed Incomes List */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Pemasukan Kas Terkonfirmasi ({periodDisplayName})
              </h3>
              <p className="text-xs text-slate-500">Rincian sewa kamar yang telah lunas</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums">
              {formatRupiah(confirmedCashIncome)}
            </span>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Faktur / Kamar</th>
                  <th className="px-4 py-2.5 font-semibold">Penghuni</th>
                  <th className="px-4 py-2.5 font-semibold">Tgl Lunas</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {confirmedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada pemasukan kas lunas pada periode ini.
                    </td>
                  </tr>
                ) : (
                  confirmedInvoices.map((inv) => {
                    const ten = tenants.find((t) => t.id === inv.tenantId);
                    const rm = rooms.find((r) => r.id === inv.roomId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60">
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-900 block">{inv.invoiceNumber}</span>
                          <span className="text-[11px] text-slate-500">Kamar {rm?.number}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {ten?.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(inv.paidAt || inv.dueDate)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-emerald-700 font-mono tabular-nums">
                          {formatRupiah(inv.amount)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2: Operating Expenses Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Rincian Beban Operasional ({periodDisplayName})
              </h3>
              <p className="text-xs text-slate-500">Pengeluaran listrik, air, servis & kebersihan</p>
            </div>
            <span className="text-xs font-bold text-rose-600 font-mono tabular-nums">
              {formatRupiah(totalOperatingExpenses)}
            </span>
          </div>

          <div className="overflow-x-auto max-h-80">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5 font-semibold">Tanggal</th>
                  <th className="px-4 py-2.5 font-semibold">Uraian / Kategori</th>
                  <th className="px-4 py-2.5 font-semibold">Pencatat</th>
                  <th className="px-4 py-2.5 font-semibold text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {periodExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada pengeluaran operasional pada periode ini.
                    </td>
                  </tr>
                ) : (
                  periodExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-slate-600">
                        {formatDate(exp.date)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-semibold text-slate-900 block">{exp.description}</span>
                        <span className="text-[11px] text-slate-500">{getExpenseCategoryLabel(exp.category)}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-[11px]">
                        {exp.recordedBy.split(' ')[0]}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-rose-600 font-mono tabular-nums">
                        -{formatRupiah(exp.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
