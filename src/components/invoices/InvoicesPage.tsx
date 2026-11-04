import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { Invoice, InvoiceStatus, PaymentSubmission } from '../../types';
import { formatRupiah, formatDate, formatMonthPeriod } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { PaymentModal } from './PaymentModal';
import { VerificationModal } from './VerificationModal';
import { ProofViewerModal } from '../common/ProofViewerModal';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CreditCard,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  Trash2,
  X,
  FileText
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const {
    invoices,
    tenants,
    rooms,
    submissions,
    createInvoice,
    batchGenerateInvoices,
    deleteInvoice,
    currentUser,
    settings,
  } = useKost();

  const [activeTab, setActiveTab] = useState<'all' | 'verification'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [verifyingSubmission, setVerifyingSubmission] = useState<{
    sub: PaymentSubmission;
    invoice: Invoice;
  } | null>(null);
  const [viewingProofSubmission, setViewingProofSubmission] = useState<{
    sub: PaymentSubmission;
    invoice: Invoice;
  } | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [batchNotice, setBatchNotice] = useState('');

  // Create single invoice form
  const activeTenants = tenants.filter((t) => t.status === 'active');
  const [selectedTenantId, setSelectedTenantId] = useState<string>(activeTenants[0]?.id || '');
  const [invoicePeriod, setInvoicePeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [invoiceAmount, setInvoiceAmount] = useState<number>(() => {
    const firstTenant = activeTenants[0];
    const room = rooms.find((r) => r.id === firstTenant?.roomId);
    return room?.monthlyPrice || 1500000;
  });
  const [invoiceDueDate, setInvoiceDueDate] = useState<string>(() => {
    const now = new Date();
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return `${period}-${String(settings.defaultDueDay).padStart(2, '0')}`;
  });
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Batch generate form state
  const [batchPeriod, setBatchPeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [batchDueDay, setBatchDueDay] = useState<number>(settings.defaultDueDay);

  // When tenant changes in single create form, auto-fill room price
  const handleTenantChange = (tId: string) => {
    setSelectedTenantId(tId);
    const tenant = tenants.find((t) => t.id === tId);
    if (tenant) {
      const room = rooms.find((r) => r.id === tenant.roomId);
      if (room) {
        setInvoiceAmount(room.monthlyPrice);
      }
    }
  };

  // If role is tenant, only show their own invoices
  const visibleInvoices = currentUser.role === 'tenant'
    ? invoices.filter((inv) => inv.tenantId === currentUser.tenantId)
    : invoices;

  // Periods list for filter dropdown
  const uniquePeriods = Array.from(new Set(visibleInvoices.map((inv) => inv.periodMonth))).sort().reverse();

  // Pending verification submissions
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');

  const filteredInvoices = visibleInvoices.filter((inv) => {
    const tenant = tenants.find((t) => t.id === inv.tenantId);
    const room = rooms.find((r) => r.id === inv.roomId);

    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tenant && tenant.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (room && room.number.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesPeriod = periodFilter === 'all' || inv.periodMonth === periodFilter;

    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find((t) => t.id === selectedTenantId);
    if (!tenant) {
      setErrorMessage('Pilih penghuni terlebih dahulu.');
      return;
    }

    const res = createInvoice({
      tenantId: tenant.id,
      roomId: tenant.roomId,
      periodMonth: invoicePeriod,
      amount: Number(invoiceAmount),
      dueDate: invoiceDueDate,
      notes: invoiceNotes.trim() || undefined,
    });

    if (res.success) {
      setIsCreateModalOpen(false);
      setErrorMessage('');
    } else {
      setErrorMessage(res.error || 'Gagal membuat tagihan.');
    }
  };

  const handleBatchGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const res = batchGenerateInvoices(batchPeriod, batchDueDay);
    setBatchNotice(res.message);
    setTimeout(() => setBatchNotice(''), 5000);
    setIsBatchModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteInvoice(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {currentUser.role === 'tenant' ? 'Tagihan Sewa Saya' : 'Tagihan & Pembayaran'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentUser.role === 'tenant'
              ? 'Pantau status pembayaran sewa kamar Anda dan kirimkan bukti transfer'
              : 'Kelola faktur sewa bulanan dan verifikasi pengajuan pembayaran penghuni'}
          </p>
        </div>

        {currentUser.role !== 'tenant' && (
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setIsBatchModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors shadow-xs"
              title="Buat tagihan serentak untuk semua penghuni aktif"
            >
              <Layers className="w-4 h-4 text-slate-500" />
              <span>Generate Rutin Bulanan</span>
            </button>
            <button
              onClick={() => {
                setErrorMessage('');
                setIsCreateModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Tagihan Baru</span>
            </button>
          </div>
        )}
      </div>

      {batchNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{batchNotice}</span>
        </div>
      )}

      {/* Tabs (Owner/Manager view) */}
      {currentUser.role !== 'tenant' && (
        <div className="flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'all'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Semua Tagihan ({visibleInvoices.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'verification'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Antrean Verifikasi</span>
            {pendingSubmissions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {pendingSubmissions.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* If Active Tab is Verification Queue */}
      {currentUser.role !== 'tenant' && activeTab === 'verification' ? (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daftar Pembayaran Menunggu Verifikasi
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Pastikan mutasi dana telah masuk ke rekening sebelum menyetujui status lunas
              </p>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {pendingSubmissions.length} Permintaan
            </span>
          </div>

          {pendingSubmissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <p className="text-slate-700 font-medium">Semua pembayaran telah diverifikasi</p>
              <p className="text-slate-400 mt-0.5">Tidak ada antrean bukti pembayaran yang menunggu persetujuan.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingSubmissions.map((sub) => {
                const inv = invoices.find((i) => i.id === sub.invoiceId);
                const ten = tenants.find((t) => t.id === sub.tenantId);
                const rm = rooms.find((r) => r.id === inv?.roomId);

                if (!inv) return null;

                return (
                  <div
                    key={sub.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden shrink-0 flex items-center justify-center cursor-pointer"
                        onClick={() => setViewingProofSubmission({ sub, invoice: inv })}
                        title="Klik untuk memperbesar resi"
                      >
                        <img
                          src={sub.proofImageUrl}
                          alt="Resi"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">
                            {ten?.name || 'Penghuni'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                            Kamar {rm?.number}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 mt-1 font-mono tabular-nums">
                          Tagihan: <strong className="text-slate-900">{formatRupiah(sub.amount)}</strong> · {sub.method === 'bank_transfer' ? `Transfer ${sub.senderBank || 'Bank'}` : 'QRIS'}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Dikirim pada: {formatDate(sub.submittedAt)} · Nama Rekening: {sub.senderName || '-'}
                        </div>
                        {sub.notes && (
                          <div className="text-[11px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded mt-1.5 inline-block">
                            Catatan: {sub.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => setViewingProofSubmission({ sub, invoice: inv })}
                        className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Bukti</span>
                      </button>
                      <button
                        onClick={() => setVerifyingSubmission({ sub, invoice: inv })}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verifikasi Pembayaran</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* All Invoices View */
        <>
          {/* Filters Bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor tagihan, nama penghuni, atau kamar..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Status Segmented Filter */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setStatusFilter('unpaid')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'unpaid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum Bayar
                </button>
                <button
                  onClick={() => setStatusFilter('pending_verification')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'pending_verification'
                      ? 'bg-white text-amber-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Menunggu
                </button>
                <button
                  onClick={() => setStatusFilter('paid')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'paid'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Lunas
                </button>
                <button
                  onClick={() => setStatusFilter('overdue')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                    statusFilter === 'overdue'
                      ? 'bg-white text-rose-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Jatuh Tempo
                </button>
              </div>

              {/* Period Dropdown */}
              <select
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-hidden"
              >
                <option value="all">Semua Periode</option>
                {uniquePeriods.map((period) => (
                  <option key={period} value={period}>
                    {formatMonthPeriod(period)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoices Data Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-5 py-3.5 font-semibold">No. Faktur</th>
                    <th className="px-5 py-3.5 font-semibold">Penghuni & Kamar</th>
                    <th className="px-5 py-3.5 font-semibold">Periode Sewa</th>
                    <th className="px-5 py-3.5 font-semibold">Jumlah Tagihan</th>
                    <th className="px-5 py-3.5 font-semibold">Batas Jatuh Tempo</th>
                    <th className="px-5 py-3.5 font-semibold">Status Pembayaran</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                        Tidak ada tagihan yang sesuai dengan filter.
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const tenant = tenants.find((t) => t.id === inv.tenantId);
                      const room = rooms.find((r) => r.id === inv.roomId);
                      const latestSub = submissions.find((s) => s.id === inv.latestSubmissionId);

                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            {inv.invoiceNumber}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-slate-900">{tenant?.name || 'Penghuni'}</div>
                            <div className="text-[11px] text-slate-500">Kamar {room?.number}</div>
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatMonthPeriod(inv.periodMonth)}
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-900 font-mono tabular-nums">
                            {formatRupiah(inv.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-600">
                            {formatDate(inv.dueDate)}
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge type="invoice" status={inv.status} />
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Tenant Pay Button */}
                              {currentUser.role === 'tenant' && (inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'rejected') && (
                                <button
                                  onClick={() => setPayingInvoice(inv)}
                                  className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
                                >
                                  Bayar Sekarang
                                </button>
                              )}

                              {/* Owner / Manager Review Button if Pending */}
                              {currentUser.role !== 'tenant' && inv.status === 'pending_verification' && latestSub && (
                                <button
                                  onClick={() => setVerifyingSubmission({ sub: latestSub, invoice: inv })}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-xs"
                                  title="Verifikasi Pembayaran"
                                >
                                  Verifikasi
                                </button>
                              )}

                              {/* View Receipt Proof button if available */}
                              {latestSub && (
                                <button
                                  onClick={() => setViewingProofSubmission({ sub: latestSub, invoice: inv })}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                                  title="Lihat Bukti Resi"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}

                              {/* Owner Delete Invoice */}
                              {currentUser.role === 'owner' && inv.status !== 'paid' && (
                                <button
                                  onClick={() => setDeleteTargetId(inv.id)}
                                  className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Hapus Tagihan"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal: Create Single Invoice */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Buat Tagihan Sewa Baru</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Penghuni <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => handleTenantChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                >
                  {activeTenants.map((t) => {
                    const rm = rooms.find((r) => r.id === t.roomId);
                    return (
                      <option key={t.id} value={t.id}>
                        {t.name} (Kamar {rm?.number})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bulan Periode <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={invoicePeriod}
                    onChange={(e) => {
                      setInvoicePeriod(e.target.value);
                      const padDay = String(settings.defaultDueDay).padStart(2, '0');
                      setInvoiceDueDate(`${e.target.value}-${padDay}`);
                    }}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Jatuh Tempo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={invoiceDueDate}
                    onChange={(e) => setInvoiceDueDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nominal Tagihan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={invoiceAmount}
                  onChange={(e) => setInvoiceAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tagihan</label>
                <input
                  type="text"
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  placeholder="Contoh: Termasuk biaya listrik & parkir motor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {errorMessage}
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  Buat Tagihan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Batch Generate Invoices */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Generate Tagihan Rutin Bulanan
                </h3>
              </div>
              <button
                onClick={() => setIsBatchModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBatchGenerate} className="p-5 space-y-3.5 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Sistem akan secara otomatis membuat tagihan baru untuk <strong>seluruh {activeTenants.length} penghuni aktif</strong> yang belum memiliki tagihan pada bulan yang dipilih sesuai harga sewa kamar masing-masing.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pilih Bulan Tagihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  value={batchPeriod}
                  onChange={(e) => setBatchPeriod(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tanggal Jatuh Tempo (Hari ke-n)
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={batchDueDay}
                  onChange={(e) => setBatchDueDay(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Tagihan akan jatuh tempo pada tanggal {batchDueDay} {formatMonthPeriod(batchPeriod)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  Generate Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payingInvoice && (
        <PaymentModal
          isOpen={!!payingInvoice}
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onSuccess={() => setPayingInvoice(null)}
        />
      )}

      {/* Verification Modal */}
      {verifyingSubmission && (
        <VerificationModal
          isOpen={!!verifyingSubmission}
          submission={verifyingSubmission.sub}
          invoice={verifyingSubmission.invoice}
          onClose={() => setVerifyingSubmission(null)}
          onSuccess={() => setVerifyingSubmission(null)}
        />
      )}

      {/* Proof Viewer Modal */}
      {viewingProofSubmission && (
        <ProofViewerModal
          isOpen={!!viewingProofSubmission}
          submission={viewingProofSubmission.sub}
          invoice={viewingProofSubmission.invoice}
          tenantName={tenants.find((t) => t.id === viewingProofSubmission.sub.tenantId)?.name}
          roomNumber={rooms.find((r) => r.id === viewingProofSubmission.invoice.roomId)?.number}
          onClose={() => setViewingProofSubmission(null)}
        />
      )}

      {/* Delete Invoice Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Hapus Tagihan?"
        message="Apakah Anda yakin ingin membatalkan dan menghapus data tagihan ini?"
        confirmLabel="Hapus Tagihan"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
