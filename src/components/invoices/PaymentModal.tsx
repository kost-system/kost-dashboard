import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { Invoice, PaymentMethod } from '../../types';
import { formatRupiah, formatDate, formatMonthPeriod } from '../../utils/formatters';
import { SAMPLE_RECEIPT_IMAGE_1 } from '../../data/initialData';
import { 
  X, 
  UploadCloud, 
  CreditCard, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  FileText 
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  invoice,
  onClose,
  onSuccess,
}) => {
  const { settings, rooms, tenants, submitPaymentProof, currentUser } = useKost();

  const [method, setMethod] = useState<PaymentMethod>('bank_transfer');
  const [senderBank, setSenderBank] = useState('BCA');
  const [senderName, setSenderName] = useState(currentUser.name || '');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [proofImage, setProofImage] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !invoice) return null;

  const room = rooms.find((r) => r.id === invoice.roomId);
  const tenant = tenants.find((t) => t.id === invoice.tenantId);

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

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Ukuran file maksimal 5MB.');
      return;
    }

    setErrorMessage('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUseSampleReceipt = () => {
    setProofImage(SAMPLE_RECEIPT_IMAGE_1);
    setErrorMessage('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofImage) {
      setErrorMessage('Unggah foto resi atau screenshot bukti transfer terlebih dahulu.');
      return;
    }

    if (!senderName.trim()) {
      setErrorMessage('Nama pengirim transfer wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = submitPaymentProof({
      invoiceId: invoice.id,
      amount: invoice.amount,
      paymentDate,
      method,
      senderBank,
      senderName,
      proofImageUrl: proofImage,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || 'Gagal mengirim bukti pembayaran.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Pembayaran Tagihan Sewa</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {invoice.invoiceNumber} · Periode {formatMonthPeriod(invoice.periodMonth)}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5">
          {/* Invoice Summary Box */}
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Kamar {room?.number} · {tenant?.name}</span>
              <span className="text-xs text-slate-500">Jatuh tempo: {formatDate(invoice.dueDate)}</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Total Tagihan</span>
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                {formatRupiah(invoice.amount)}
              </span>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('bank_transfer')}
                className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                  method === 'bank_transfer'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <CreditCard className={`w-5 h-5 mt-0.5 ${method === 'bank_transfer' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">Transfer Bank</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">BCA / Mandiri / BNI</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('qris')}
                className={`p-3 rounded-lg border text-left flex items-start gap-3 transition-colors ${
                  method === 'qris'
                    ? 'border-blue-600 bg-blue-50/50 text-blue-950 font-medium'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <QrCode className={`w-5 h-5 mt-0.5 ${method === 'qris' ? 'text-blue-600' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-semibold">QRIS</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">GoPay, OVO, ShopeePay</div>
                </div>
              </button>
            </div>
          </div>

          {/* Instructions Box */}
          {method === 'bank_transfer' ? (
            <div className="p-3.5 bg-blue-50/60 rounded-lg border border-blue-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-500">Bank Tujuan:</div>
                  <div className="font-semibold text-slate-900">{settings.bankName}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyBankAccount}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-white border border-blue-200 text-blue-700 rounded-md hover:bg-blue-50 transition-colors shadow-xs"
                >
                  {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBank ? 'Tersalin' : 'Salin Rekening'}</span>
                </button>
              </div>
              <div className="pt-1 border-t border-blue-200/50 flex items-center justify-between">
                <span className="text-slate-600 font-mono text-sm tracking-wide font-bold">{settings.bankAccountNumber}</span>
                <span className="text-slate-600 font-medium">a/n {settings.bankAccountName}</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col items-center text-center space-y-2">
              <span className="text-xs text-slate-600 font-medium">Scan QRIS menggunakan aplikasi M-Banking atau E-Wallet:</span>
              <img
                src={settings.qrisImageUrl}
                alt="QRIS KostFlow"
                className="w-40 h-40 border border-slate-200 rounded-lg p-1 bg-white shadow-xs"
              />
              <div className="text-[11px] text-slate-500">
                NMID: {settings.qrisNmid} · {settings.qrisMerchantName}
              </div>
            </div>
          )}

          {/* Transfer Input Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Bank / Dompet Digital Pengirim
              </label>
              <input
                type="text"
                value={senderBank}
                onChange={(e) => setSenderBank(e.target.value)}
                placeholder="Contoh: BCA / GoPay"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nama Pemilik Rekening Pengirim
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Nama sesuai buku tabungan"
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal Pembayaran
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Nominal Transfer (Rp)
              </label>
              <input
                type="text"
                disabled
                value={formatRupiah(invoice.amount)}
                className="w-full px-3 py-2 border border-slate-200 bg-slate-100 text-slate-600 rounded-lg font-mono font-medium"
              />
            </div>
          </div>

          {/* Proof Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                Unggah Bukti Transfer / Resi
              </label>
              <button
                type="button"
                onClick={handleUseSampleReceipt}
                className="text-[11px] text-blue-600 hover:text-blue-800 underline font-medium"
              >
                Gunakan Contoh Resi Demo
              </button>
            </div>

            {proofImage ? (
              <div className="relative border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={proofImage}
                    alt="Pratinjau bukti"
                    className="w-14 h-14 object-cover rounded border border-slate-300 bg-white"
                  />
                  <div>
                    <div className="text-xs font-medium text-slate-900">Bukti Transfer Terlampir</div>
                    <div className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Siap dikirim untuk verifikasi
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setProofImage('')}
                  className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 rounded border border-rose-200"
                >
                  Hapus
                </button>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white hover:bg-slate-50">
                <UploadCloud className="w-8 h-8 text-slate-400 mb-1.5" />
                <span className="text-xs font-medium text-slate-700">Klik untuk memilih file foto bukti</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Mendukung format JPG, PNG, atau WebP (Maks 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Notes Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Catatan Pembayaran (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sewa kamar bulan Oktober via GoPay"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Policy Notice */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-lg text-[11px] text-amber-800">
            <strong>Catatan Penting:</strong> Mengunggah bukti pembayaran tidak otomatis membuat status tagihan lunas. Status akan berubah menjadi <em>Lunas</em> setelah diverifikasi oleh pemilik atau pengelola kost.
          </div>

          {/* Form Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {isSubmitting ? 'Mengirim...' : 'Kirim Bukti Pembayaran'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
