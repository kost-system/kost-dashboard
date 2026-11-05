import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { ConfirmModal } from '../common/ConfirmModal';
import { AdminManagementTab } from './AdminManagementTab';
import {
  Settings,
  Building,
  CreditCard,
  QrCode,
  Calendar,
  Save,
  CheckCircle2,
  RotateCcw,
  Users,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, users, currentUser, switchUser, resetToDefaultData } = useKost();

  const [formState, setFormState] = useState(settings);
  const [saveNotice, setSaveNotice] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (field: keyof typeof settings, val: any) => {
    setFormState((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveNotice(true);
    setTimeout(() => setSaveNotice(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pengaturan Kost
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi profil properti, rekening transfer, instruksi pembayaran, dan aturan sewa
          </p>
        </div>

        {saveNotice && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan berhasil disimpan!</span>
          </div>
        )}
      </div>

      {/* Admin Management Section for Owner */}
      {currentUser?.role === 'owner' && <AdminManagementTab />}

      {/* User Simulation Profile Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Peralihan Peran Pengguna (Uji Coba Hak Akses)
          </h3>
        </div>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Gunakan tombol di bawah untuk beralih antara akun Pemilik (akses penuh), Pengelola (operasional & verifikasi), atau Penghuni (portal mandiri):
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {users.map((user) => {
            const isCurrent = user.id === currentUser.id;
            return (
              <button
                key={user.id}
                onClick={() => switchUser(user.id)}
                className={`p-3 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                  isCurrent
                    ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{user.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                      user.role === 'owner' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      user.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {user.role === 'owner' ? 'Pemilik' : user.role === 'manager' ? 'Pengelola' : 'Penghuni'}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">{user.email}</span>
                </div>
                {isCurrent && (
                  <div className="mt-2 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Akun Aktif Sekarang</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Kost Profile */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Profil Properti Kost</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Rumah Kost</label>
              <input
                type="text"
                value={formState.kostName}
                onChange={(e) => handleChange('kostName', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline / Deskripsi Singkat</label>
              <input
                type="text"
                value={formState.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Alamat Lengkap</label>
              <input
                type="text"
                value={formState.address}
                onChange={(e) => handleChange('address', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp Pengelola</label>
              <input
                type="text"
                value={formState.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Bank Transfer Details */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Rekening Tujuan Pembayaran Bank</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Bank</label>
              <input
                type="text"
                value={formState.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening</label>
              <input
                type="text"
                value={formState.bankAccountNumber}
                onChange={(e) => handleChange('bankAccountNumber', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Atas Nama Rekening</label>
              <input
                type="text"
                value={formState.bankAccountName}
                onChange={(e) => handleChange('bankAccountName', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 3: QRIS Details */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <QrCode className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Informasi QRIS Pembayaran</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">NMID QRIS</label>
              <input
                type="text"
                value={formState.qrisNmid}
                onChange={(e) => handleChange('qrisNmid', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Merchant QRIS</label>
              <input
                type="text"
                value={formState.qrisMerchantName}
                onChange={(e) => handleChange('qrisMerchantName', e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Rental & Due Day Policy */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Aturan Jatuh Tempo & Instruksi</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Batas Tanggal Jatuh Tempo Rutin (Hari ke-n setiap bulan)
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formState.defaultDueDay}
                onChange={(e) => handleChange('defaultDueDay', Number(e.target.value))}
                required
                className="w-40 px-3 py-2 border border-slate-300 rounded-lg"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Secara default, invoice sewa akan dibuat dengan tanggal jatuh tempo tanggal {formState.defaultDueDay} setiap bulannya.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Instruksi Pembayaran untuk Penghuni
              </label>
              <textarea
                value={formState.paymentInstructions}
                onChange={(e) => handleChange('paymentInstructions', e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-300 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Save button & Reset */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Data ke Status Demo Awal</span>
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs self-end sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Kembalikan ke Data Demo Bawaan?"
        message="Semua transaksi baru, perubahan kamar, atau pengeluaran yang telah dicatat akan dihapus dan digantikan kembali dengan data contoh awal."
        confirmLabel="Reset Sekarang"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={() => {
          resetToDefaultData();
          setShowResetConfirm(false);
          setFormState(settings);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
