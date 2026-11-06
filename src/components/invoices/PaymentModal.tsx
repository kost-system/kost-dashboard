import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { Invoice } from '../../types';
import { formatRupiah, formatDate, formatMonthPeriod } from '../../utils/formatters';
import { api } from '../../utils/api';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Zap,
  Loader2
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}

declare global {
  interface Window {
    snap?: any;
  }
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { rooms, tenants, refreshData } = useKost();

  const [errorMessage, setErrorMessage] = useState('');
  const [isMidtransLoading, setIsMidtransLoading] = useState(false);

  if (!isOpen || !invoice) return null;

  const room = rooms.find((r) => r.id === invoice.roomId);
  const tenant = tenants.find((t) => t.id === invoice.tenantId);

  // TRIGGER MIDTRANS SNAP POPUP
  const handlePayWithMidtrans = async () => {
    setIsMidtransLoading(true);
    setErrorMessage('');
    try {
      const res = await api.post<{ token: string; redirect_url: string }>(
        '/payments/midtrans/create-snap',
        { invoiceId: invoice.id }
      );

      if (window.snap) {
        window.snap.pay(res.token, {
          onSuccess: function (result: any) {
            console.log('Payment success:', result);
            refreshData();
            onSuccess();
          },
          onPending: function (result: any) {
            console.log('Payment pending:', result);
            refreshData();
          },
          onError: function (result: any) {
            console.error('Payment error:', result);
            setErrorMessage('Pembayaran gagal diproses oleh gateway.');
          },
          onClose: function () {
            console.log('User closed the popup without finishing the payment');
            refreshData();
          },
        });
      } else if (res.redirect_url) {
        window.open(res.redirect_url, '_blank');
      } else {
        setErrorMessage('SDK Midtrans belum termuat di browser.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memulai transaksi Midtrans.');
    } finally {
      setIsMidtransLoading(false);
    }
  };



  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-base font-bold text-slate-800">Pembayaran Tagihan</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Faktur #{invoice.invoiceNumber} • Periode {formatMonthPeriod(invoice.periodMonth)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Invoice Summary Box */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-900">Total Yang Harus Dibayar</p>
              <p className="text-xl font-extrabold text-blue-700 mt-0.5 tracking-tight">
                {formatRupiah(invoice.amount)}
              </p>
              <p className="text-[11px] text-blue-600/80 mt-1">
                Kamar {room?.number || invoice.roomId} • Jatuh tempo: {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* MIDTRANS SNAP INSTANT CHECKOUT */}
          <div className="space-y-4 py-2">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verifikasi Otomatis Terhubung Payment Gateway Midtrans</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pilih opsi pembayaran: <strong>BCA / Mandiri / BNI / BRI Virtual Account, QRIS (GoPay, ShopeePay, OVO), atau Minimarket</strong>. Status invoice akan otomatis berubah menjadi Lunas begitu pembayaran selesai.
              </p>
            </div>

            <button
              type="button"
              onClick={handlePayWithMidtrans}
              disabled={isMidtransLoading}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isMidtransLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghubungi Midtrans Gateway...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Buka Pop-up Pembayaran Midtrans</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
