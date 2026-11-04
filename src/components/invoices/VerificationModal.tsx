import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { PaymentSubmission, Invoice } from '../../types';
import { formatRupiah, formatDate, formatMonthPeriod } from '../../utils/formatters';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  CreditCard, 
  Calendar, 
  User, 
  Building,
  Eye,
  Download
} from 'lucide-react';

interface VerificationModalProps {
  isOpen: boolean;
  submission: PaymentSubmission | null;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  submission,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { verifyPayment, rejectPayment, tenants, rooms, currentUser } = useKost();

  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !submission || !invoice) return null;

  const tenant = tenants.find((t) => t.id === invoice.tenantId);
  const room = rooms.find((r) => r.id === invoice.roomId);

  const handleApprove = () => {
    setIsProcessing(true);
    setErrorMessage('');

    const res = verifyPayment(submission.id, notes.trim() || undefined);
    setIsProcessing(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || 'Gagal memverifikasi pembayaran.');
    }
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setErrorMessage('Alasan penolakan wajib diisi agar penghuni mengetahui kesalahan pembayaran.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    const res = rejectPayment(submission.id, rejectionReason.trim());
    setIsProcessing(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || 'Gagal menolak pembayaran.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Verifikasi Pembayaran Sewa
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoice.invoiceNumber} · Kamar {room?.number} ({tenant?.name})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Summary Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Jumlah Tagihan</span>
              <span className="font-bold text-slate-900 font-mono text-sm tabular-nums">
                {formatRupiah(invoice.amount)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Periode Sewa</span>
              <span className="font-medium text-slate-900">
                {formatMonthPeriod(invoice.periodMonth)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Metode Bayar</span>
              <span className="font-medium text-slate-900">
                {submission.method === 'bank_transfer' ? 'Transfer Bank' : 'QRIS'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Tanggal Transfer</span>
              <span className="font-medium text-slate-900">
                {formatDate(submission.paymentDate)}
              </span>
            </div>
          </div>

          {/* Sender metadata */}
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs flex flex-wrap gap-x-6 gap-y-2 text-slate-700">
            <div>
              <span className="text-slate-500">Nama Pengirim: </span>
              <span className="font-semibold text-slate-900">{submission.senderName || tenant?.name}</span>
            </div>
            <div>
              <span className="text-slate-500">Bank / Channel: </span>
              <span className="font-semibold text-slate-900">{submission.senderBank || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500">Diajukan pada: </span>
              <span className="font-medium text-slate-800">{formatDate(submission.submittedAt)}</span>
            </div>
          </div>

          {submission.notes && (
            <div className="p-3 bg-slate-100 rounded-lg text-xs text-slate-700">
              <span className="font-semibold text-slate-900">Catatan dari Penghuni: </span>
              {submission.notes}
            </div>
          )}

          {/* Receipt Proof Preview */}
          <div>
            <div className="text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span>Bukti Resi / Tangkapan Layar:</span>
              <a
                href={submission.proofImageUrl}
                target="_blank"
                rel="noreferrer"
                download={`bukti-bayar-${submission.id}.png`}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Unduh Bukti
              </a>
            </div>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-center items-center">
              <img
                src={submission.proofImageUrl}
                alt="Bukti Transfer"
                className="max-h-72 w-auto object-contain rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Rejection Form Drawer */}
          {isRejecting ? (
            <form onSubmit={handleRejectConfirm} className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3">
              <div className="flex items-start gap-2 text-red-800 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>Formulir Penolakan Pembayaran</span>
              </div>
              <p className="text-[11px] text-red-700 leading-normal">
                Tagihan tidak akan terpotong dan penghuni akan diminta mengirimkan ulang bukti pembayaran yang sah.
              </p>
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={2}
                  required
                  placeholder="Contoh: Bukti buram, nominal transfer kurang, atau mutasi rekening belum masuk..."
                  className="w-full p-2.5 text-xs bg-white border border-red-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-red-500 text-slate-900"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
                >
                  {isProcessing ? 'Memproses...' : 'Konfirmasi Tolak Pembayaran'}
                </button>
              </div>
            </form>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Catatan Verifikasi (Opsional untuk pembukuan internal)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Sudah dicek via BCA Mobile mutasi masuk Rp 1.500.000"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>
          )}

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        {!isRejecting && (
          <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsRejecting(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              <span>Tolak Pembayaran</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={isProcessing}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isProcessing ? 'Memproses...' : 'Setujui & Verifikasi Lunas'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
