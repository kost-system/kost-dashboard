import React from 'react';
import { useKost } from '../../context/KostContext';
import { formatDate, formatRupiah } from '../../utils/formatters';
import {
  DoorClosed,
  User,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Building,
  CheckCircle2,
  FileText,
  AlertCircle
} from 'lucide-react';

export const TenantPortalPage: React.FC = () => {
  const { currentUser, tenants, rooms, settings } = useKost();

  const currentTenant = tenants.find((t) => t.id === currentUser.tenantId);
  const currentRoom = rooms.find((r) => r.id === currentTenant?.roomId);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Informasi Kamar & Profil Penghuni
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Rincian fasilitas kamar yang Anda sewa serta data identitas terdaftar
        </p>
      </div>

      {/* Privacy Notice */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">Privasi Terjamin: </span>
          <span>
            Sebagai penghuni, data pribadi, nomor kontak darurat, serta seluruh riwayat bukti transfer Anda dienkripsi dan hanya dapat diakses oleh pihak pengelola kost. Anda tidak memiliki akses ke data penghuni lain.
          </span>
        </div>
      </div>

      {/* Room Details Card */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <DoorClosed className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Kamar Sewa Anda: <span className="text-blue-700">Kamar {currentRoom?.number}</span>
            </h3>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
            Status: Terisi Aktif
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">Tipe Fasilitas</span>
            <span className="font-bold text-slate-900 text-sm">
              {currentRoom?.type || 'Standard'}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Lantai {currentRoom?.floor || 1}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">Harga Sewa Bulanan</span>
            <span className="font-bold text-slate-900 text-sm font-mono tabular-nums">
              {formatRupiah(currentRoom?.monthlyPrice || 0)}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Jatuh tempo tgl {settings.defaultDueDay}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block mb-1">Mulai Menempati</span>
            <span className="font-bold text-slate-900 text-sm">
              {formatDate(currentTenant?.startDate || '')}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              Kontrak Aktif
            </span>
          </div>
        </div>

        {currentRoom?.notes && (
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 text-xs text-slate-700">
            <span className="font-semibold text-slate-900">Catatan Kamar: </span>
            {currentRoom.notes}
          </div>
        )}
      </div>

      {/* Tenant Profile Data */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <User className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-semibold text-slate-900">Data Identitas Penghuni Terdaftar</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-100 gap-1">
            <span className="text-slate-500">Nama Lengkap</span>
            <span className="font-semibold text-slate-900">{currentTenant?.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-100 gap-1">
            <span className="text-slate-500">Nomor WhatsApp / HP</span>
            <span className="font-medium text-slate-900">{currentTenant?.phone}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-100 gap-1">
            <span className="text-slate-500">Alamat Email</span>
            <span className="font-medium text-slate-900">{currentTenant?.email}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-100 gap-1">
            <span className="text-slate-500">Kontak Darurat (Keluarga)</span>
            <span className="font-medium text-slate-900">{currentTenant?.emergencyContact || '-'}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-100 gap-1">
            <span className="text-slate-500">Catatan Kendaraan / Pekerjaan</span>
            <span className="font-medium text-slate-900">{currentTenant?.notes || '-'}</span>
          </div>
        </div>
      </div>

      {/* Kost Contacts & Help Card */}
      <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
        <h4 className="font-semibold text-slate-900">Bantuan & Hubungi Pengelola Kost</h4>
        <p className="text-slate-600 leading-relaxed">
          Jika terdapat kendala fasilitas kamar (AC, air, lampu) atau pertanyaan seputar invoice sewa, silakan hubungi pengelola kost:
        </p>
        <div className="flex flex-wrap items-center gap-4 text-slate-700 pt-1">
          <div className="flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>WhatsApp: {settings.phone}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-blue-600" />
            <span>Email: {settings.email}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-blue-600" />
            <span>Lokasi: {settings.address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
