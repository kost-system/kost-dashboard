import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { Invoice, PaymentMethod } from '../../types';
import { formatRupiah, formatDate, formatMonthPeriod } from '../../utils/formatters';
import { api } from '../../utils/api';
import { 
  X, 
  UploadCloud, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FileText,
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
  const { settings, rooms, tenants, submitPaymentProof, refreshData, currentUser } = useKost();

  const [paymentType, setPaymentType] = useState<'midtrans' | 'manual'>('midtrans');
  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [senderBank, setSenderBank] = useState('BCA');
  const [senderName, setSenderName] = useState(currentUser.name || '');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [proofImage, setProofImage] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleCopyBankAccount = () => {
    navigator.clipboard.writeText(settings.bankAccountNumber);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Harap unggah file gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 2 MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      setProofImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImage) {
      setErrorMessage('Bukti transfer pembayaran wajib diunggah.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = submitPaymentProof({
      invoiceId: invoice.id,
      amount: invoice.amount,
      paymentDate,
      method,
      senderBank: method === 'bank_transfer' ? senderBank : 'QRIS',
      senderName,
      proofImageUrl: proofImage,
      notes,
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
    } else {
      setErrorMessage(res.error || 'Gagal mengirim bukti pembayaran.');
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

          {/* Tab Selection: Midtrans Otomatis vs Transfer Manual */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPaymentType('midtrans')}
              className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                paymentType === 'midtrans'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Midtrans (Otomatis)</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentType('manual')}
              className={`py-2 rounded-md transition-all flex items-center justify-center gap-1.5 ${
                paymentType === 'manual'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Transfer Manual</span>
            </button>
          </div>

          {/* OPSI 1: MIDTRANS SNAP INSTANT CHECKOUT */}
          {paymentType === 'midtrans' && (
            <div className="space-y-4 py-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verifikasi Otomatis Tanpa Perlu Upload Struk</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Pilih opsi pembayaran lengkap: <strong>BCA / Mandiri / BNI / BRI Virtual Account, QRIS (GoPay, ShopeePay, OVO), atau Indomaret/Alfamart</strong>. Status tagihan akan otomatis lunas saat dana masuk.
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
          )}

          {/* OPSI 2: TRANSFER MANUAL DENGAN UPLOAD STRUK */}
          {paymentType === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-xs text-amber-900">
                <p className="font-semibold">Info Rekening Pemilik:</p>
                <p className="mt-1">
                  Bank: {settings.bankName || 'BCA'} • No. Rek: {settings.bankAccountNumber || '8820-1928-30'} a.n. {settings.bankAccountName || 'Pemilik Kos'}
                </p>
                <button
                  type="button"
                  onClick={handleCopyBankAccount}
                  className="mt-1 text-[11px] text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Copy className="w-3 h-3" />
                  {copiedBank ? 'Tersalin ke Clipboard!' : 'Salin Nomor Rekening'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Pengirim di Rekening
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nama pengirim sesuai buku tabungan"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Unggah Bukti Struk Transfer (Maks. 2MB)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  required={!proofImage}
                />
                {proofImage && (
                  <div className="mt-2 text-xs text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Gambar bukti struk siap dikirim</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
