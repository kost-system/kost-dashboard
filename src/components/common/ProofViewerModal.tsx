import React from 'react';
import { X, Download, ExternalLink, Calendar, CreditCard, User, Building } from 'lucide-react';
import { PaymentSubmission, Invoice } from '../../types';
import { formatRupiah, formatDate } from '../../utils/formatters';

interface ProofViewerModalProps {
  isOpen: boolean;
  submission: PaymentSubmission | null;
  invoice?: Invoice | null;
  tenantName?: string;
  roomNumber?: string;
  onClose: () => void;
}

export const ProofViewerModal: React.FC<ProofViewerModalProps> = ({
  isOpen,
  submission,
  invoice,
  tenantName,
  roomNumber,
  onClose,
}) => {
  if (!isOpen || !submission) return null;

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = submission.proofImageUrl;
    link.download = `bukti-bayar-${submission.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Bukti Pembayaran</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tagihan: {invoice?.invoiceNumber || '-'} · Kamar {roomNumber || '-'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadImage}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              title="Unduh Gambar"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Submission Details Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block mb-0.5">Jumlah Transfer</span>
              <span className="font-semibold text-slate-900 text-sm font-mono tabular-nums">
                {formatRupiah(submission.amount)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Metode</span>
              <span className="font-medium text-slate-900">
                {submission.method === 'bank_transfer' ? 'Transfer Bank' : 'QRIS'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Pengirim / Bank</span>
              <span className="font-medium text-slate-900 truncate block">
                {submission.senderName || tenantName || '-'} ({submission.senderBank || '-'})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-0.5">Tanggal Bayar</span>
              <span className="font-medium text-slate-900">
                {formatDate(submission.paymentDate)}
              </span>
            </div>
          </div>

          {submission.notes && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-900">
              <span className="font-semibold">Catatan Penghuni: </span>
              {submission.notes}
            </div>
          )}

          {submission.rejectionReason && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900">
              <span className="font-semibold">Alasan Penolakan: </span>
              {submission.rejectionReason}
            </div>
          )}

          {/* Receipt Image Preview Container */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
            <img
              src={submission.proofImageUrl}
              alt="Bukti Transfer Resi"
              className="max-h-[380px] w-auto object-contain rounded shadow-md"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Diunggah pada: {formatDate(submission.submittedAt)}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
