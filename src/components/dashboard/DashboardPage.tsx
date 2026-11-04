import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { formatRupiah, formatDate, formatMonthPeriod } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { VerificationModal } from '../invoices/VerificationModal';
import { PaymentModal } from '../invoices/PaymentModal';
import { ProofViewerModal } from '../common/ProofViewerModal';
import { Invoice, PaymentSubmission } from '../../types';
import {
  DoorClosed,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  CreditCard,
  Eye,
  Check,
  XCircle,
  Building,
  UserCheck
} from 'lucide-react';

interface DashboardPageProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { rooms, tenants, invoices, submissions, expenses, currentUser, settings } = useKost();

  const [selectedSub, setSelectedSub] = useState<PaymentSubmission | null>(null);
  const [selectedSubInvoice, setSelectedSubInvoice] = useState<Invoice | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isViewingProof, setIsViewingProof] = useState(false);
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);

  // If role is tenant, render the personalized Tenant Dashboard view
  if (currentUser.role === 'tenant') {
    const currentTenant = tenants.find((t) => t.id === currentUser.tenantId);
    const tenantRoom = rooms.find((r) => r.id === currentTenant?.roomId);
    const tenantInvoices = invoices.filter((inv) => inv.tenantId === currentTenant?.id);
    const outstandingInvoices = tenantInvoices.filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'rejected');
    const totalOutstanding = outstandingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = tenantInvoices.filter((inv) => inv.status === 'pending_verification');

    return (
      <div className="space-y-6">
        {/* Tenant Welcome Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-blue-300 font-medium tracking-wide uppercase">
                Portal Penghuni Kost
              </span>
              <h1 className="text-xl sm:text-2xl font-bold mt-1">
                Halo, {currentUser.name}
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Kamar: <span className="font-semibold text-white">{tenantRoom?.number || '-'}</span> ({tenantRoom?.type || 'Standard'}) · {settings.kostName}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-slate-400 block">Biaya Sewa Bulanan</span>
              <span className="text-lg sm:text-xl font-bold text-white font-mono tabular-nums">
                {formatRupiah(tenantRoom?.monthlyPrice || 0)}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Tenant Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Status Kamar</span>
              <DoorClosed className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              Kamar {tenantRoom?.number || '-'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Lantai {tenantRoom?.floor || 1}
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Tagihan Tertunggak</span>
              <Receipt className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {formatRupiah(totalOutstanding)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {outstandingInvoices.length} tagihan belum lunas
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Menunggu Verifikasi</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              {pendingInvoices.length} Tagihan
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Bukti sudah dikirim ke pengelola
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500">Jatuh Tempo Rutin</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-xl font-bold text-slate-900">
              Tgl {settings.defaultDueDay}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Setiap bulannya
            </div>
          </div>
        </div>

        {/* Action Alert if Outstanding */}
        {outstandingInvoices.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-amber-900">
                  Anda memiliki {outstandingInvoices.length} tagihan yang perlu dibayar
                </h4>
                <p className="text-xs text-amber-700 mt-0.5">
                  Lakukan pembayaran via Transfer Bank atau QRIS dan unggah buktinya agar status tagihan menjadi lunas.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto shrink-0"
            >
              Bayar Sekarang
            </button>
          </div>
        )}

        {/* Tenant Invoices Table */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Riwayat Tagihan & Pembayaran Saya</h3>
              <p className="text-xs text-slate-500 mt-0.5">Daftar seluruh tagihan sewa kamar Anda</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Lihat Detail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-5 py-3 font-semibold">No. Tagihan</th>
                  <th className="px-5 py-3 font-semibold">Periode</th>
                  <th className="px-5 py-3 font-semibold">Jumlah</th>
                  <th className="px-5 py-3 font-semibold">Jatuh Tempo</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tenantInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                      Belum ada catatan tagihan untuk akun Anda.
                    </td>
                  </tr>
                ) : (
                  tenantInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900">{inv.invoiceNumber}</td>
                      <td className="px-5 py-3.5 text-slate-600">{formatMonthPeriod(inv.periodMonth)}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono tabular-nums">
                        {formatRupiah(inv.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">{formatDate(inv.dueDate)}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge type="invoice" status={inv.status} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'rejected' ? (
                          <button
                            onClick={() => setPayingInvoice(inv)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                          >
                            Bayar
                          </button>
                        ) : inv.status === 'pending_verification' ? (
                          <span className="text-xs text-amber-600 font-medium">Sedang Ditinjau</span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-medium">Lunas</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Modal for Tenant */}
        {payingInvoice && (
          <PaymentModal
            isOpen={!!payingInvoice}
            invoice={payingInvoice}
            onClose={() => setPayingInvoice(null)}
            onSuccess={() => setPayingInvoice(null)}
          />
        )}
      </div>
    );
  }

  // OWNER & MANAGER DASHBOARD CALCULATIONS
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
  const availableRooms = rooms.filter((r) => r.status === 'available').length;
  const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0';

  // Outstanding Invoices
  const unpaidInvoices = invoices.filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'rejected');
  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Pending Verifications
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');

  // Recent transactions (paid invoices + recorded expenses)
  const recentPaidInvoices = invoices
    .filter((inv) => inv.status === 'paid' && inv.paidAt)
    .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime())
    .slice(0, 5);

  const upcomingOverdueInvoices = invoices
    .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'rejected')
    .slice(0, 5);

  const handleOpenVerification = (sub: PaymentSubmission) => {
    const inv = invoices.find((i) => i.id === sub.invoiceId) || null;
    setSelectedSub(sub);
    setSelectedSubInvoice(inv);
    setIsVerifying(true);
  };

  const handleOpenProof = (sub: PaymentSubmission) => {
    const inv = invoices.find((i) => i.id === sub.invoiceId) || null;
    setSelectedSub(sub);
    setSelectedSubInvoice(inv);
    setIsViewingProof(true);
  };

  return (
    <div className="space-y-6">
      {/* 4 Primary Summary Cards Required by Section 6 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total rooms and occupancy */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Kamar & Okupansi
            </span>
            <DoorClosed className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{totalRooms} Kamar</span>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
              {occupancyRate}%
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Tingkat keterisian properti saat ini
          </p>
        </div>

        {/* Card 2: Occupied versus available rooms */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Terisi vs Tersedia
            </span>
            <Building className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-700">{occupiedRooms} Terisi</span>
            <span className="text-sm font-medium text-slate-400">/</span>
            <span className="text-lg font-bold text-emerald-600">{availableRooms} Kosong</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {maintenanceRooms > 0 ? `${maintenanceRooms} kamar dalam pemeliharaan` : 'Semua kamar siap pakai'}
          </p>
        </div>

        {/* Card 3: Outstanding invoices */}
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Tagihan Belum Lunas
            </span>
            <Receipt className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRupiah(totalOutstanding)}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {unpaidInvoices.length} tagihan belum dibayarkan
          </p>
        </div>

        {/* Card 4: Payments awaiting verification */}
        <div className={`p-5 rounded-xl border transition-colors ${
          pendingSubmissions.length > 0
            ? 'bg-amber-50/50 border-amber-200'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Menunggu Verifikasi
            </span>
            <Clock className={`w-4 h-4 ${pendingSubmissions.length > 0 ? 'text-amber-600' : 'text-slate-400'}`} />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {pendingSubmissions.length} Pengajuan
          </div>
          <p className={`text-xs mt-2 ${pendingSubmissions.length > 0 ? 'text-amber-700 font-medium' : 'text-slate-500'}`}>
            {pendingSubmissions.length > 0 ? 'Memerlukan persetujuan pemilik' : 'Semua bukti telah diproses'}
          </p>
        </div>
      </div>

      {/* Verification Queue Section (if any pending) */}
      {pendingSubmissions.length > 0 && (
        <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <h3 className="text-sm font-bold text-amber-950">
                  Pembayaran Menunggu Verifikasi ({pendingSubmissions.length})
                </h3>
                <p className="text-xs text-amber-800">
                  Penghuni telah mengunggah bukti transfer. Periksa kesesuaian mutasi sebelum menyetujui.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-semibold text-amber-900 hover:underline flex items-center gap-1"
            >
              Lihat Semua di Menu Tagihan
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {pendingSubmissions.map((sub) => {
              const inv = invoices.find((i) => i.id === sub.invoiceId);
              const ten = tenants.find((t) => t.id === sub.tenantId);
              const rm = rooms.find((r) => r.id === inv?.roomId);
              return (
                <div
                  key={sub.id}
                  className="bg-white p-3.5 rounded-lg border border-amber-200/80 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{ten?.name || 'Penghuni'}</span>
                      <span className="text-[11px] px-1.5 py-0.2 rounded bg-slate-100 font-semibold text-slate-700">
                        Kamar {rm?.number}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-mono font-medium mt-0.5 tabular-nums">
                      {formatRupiah(sub.amount)} · {sub.method === 'bank_transfer' ? 'Transfer Bank' : 'QRIS'}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {formatDate(sub.submittedAt)}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleOpenProof(sub)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                      title="Lihat Resi"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenVerification(sub)}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verifikasi</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Operational Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Confirmed Transactions */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Transaksi Penerimaan Terkini</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pembayaran sewa yang telah diverifikasi</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentPaidInvoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada transaksi pembayaran terverifikasi.
              </div>
            ) : (
              recentPaidInvoices.map((inv) => {
                const ten = tenants.find((t) => t.id === inv.tenantId);
                const rm = rooms.find((r) => r.id === inv.roomId);
                return (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {ten?.name} · Kamar {rm?.number}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {formatMonthPeriod(inv.periodMonth)} · Diterima {formatDate(inv.paidAt || '')}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700 font-mono tabular-nums block">
                        +{formatRupiah(inv.amount)}
                      </span>
                      <StatusBadge type="invoice" status="paid" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Upcoming or Overdue Invoices */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Tagihan Belum Lunas & Jatuh Tempo</h3>
              <p className="text-xs text-slate-500 mt-0.5">Piutang sewa yang masih tertunggak</p>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {upcomingOverdueInvoices.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Seluruh tagihan telah lunas.
              </div>
            ) : (
              upcomingOverdueInvoices.map((inv) => {
                const ten = tenants.find((t) => t.id === inv.tenantId);
                const rm = rooms.find((r) => r.id === inv.roomId);
                return (
                  <div key={inv.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div>
                      <div className="text-xs font-semibold text-slate-900">
                        {ten?.name || 'Penghuni'} · Kamar {rm?.number}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Jatuh tempo: {formatDate(inv.dueDate)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 font-mono tabular-nums block mb-1">
                        {formatRupiah(inv.amount)}
                      </span>
                      <StatusBadge type="invoice" status={inv.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Simple Room Occupancy Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Ringkasan Okupansi Kamar</h3>
            <p className="text-xs text-slate-500 mt-0.5">Peta status seluruh kamar kost</p>
          </div>
          <button
            onClick={() => onNavigate('rooms')}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>Kelola Kamar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {rooms.map((room) => {
            const tenant = tenants.find((t) => t.id === room.currentTenantId);
            return (
              <div
                key={room.id}
                className={`p-3 rounded-lg border text-center transition-colors ${
                  room.status === 'occupied'
                    ? 'bg-blue-50/40 border-blue-200'
                    : room.status === 'available'
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="text-sm font-bold text-slate-900">{room.number}</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                  Lt. {room.floor}
                </div>
                <div className="mt-2">
                  <StatusBadge type="room" status={room.status} className="text-[10px] px-1 py-0" />
                </div>
                <div className="text-[11px] text-slate-700 truncate mt-1.5 font-medium">
                  {tenant ? tenant.name.split(' ')[0] : 'Kosong'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals for Verification & Proof Viewing */}
      {isVerifying && selectedSub && selectedSubInvoice && (
        <VerificationModal
          isOpen={isVerifying}
          submission={selectedSub}
          invoice={selectedSubInvoice}
          onClose={() => setIsVerifying(false)}
          onSuccess={() => setIsVerifying(false)}
        />
      )}

      {isViewingProof && selectedSub && (
        <ProofViewerModal
          isOpen={isViewingProof}
          submission={selectedSub}
          invoice={selectedSubInvoice}
          tenantName={tenants.find((t) => t.id === selectedSub.tenantId)?.name}
          roomNumber={rooms.find((r) => r.id === selectedSubInvoice?.roomId)?.number}
          onClose={() => setIsViewingProof(false)}
        />
      )}
    </div>
  );
};
