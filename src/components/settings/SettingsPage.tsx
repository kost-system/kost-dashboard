import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { AdminManagementTab } from './AdminManagementTab';
import {
  Building,
  CreditCard,
  QrCode,
  Calendar,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, currentUser } = useKost();

  const [formState, setFormState] = useState(settings);
  const [saveNotice, setSaveNotice] = useState(false);

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

        {/* Save button */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
