import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { Tenant } from '../../types';
import { formatDate, formatRupiah } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  DoorClosed,
  Calendar,
  Edit2,
  LogOut,
  Trash2,
  X,
  AlertCircle,
  FileText,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export const TenantsPage: React.FC = () => {
  const { tenants, rooms, invoices, addTenant, updateTenant, checkOutTenant, deleteTenant, currentUser } = useKost();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [checkOutTargetId, setCheckOutTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Add Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const [newStartDate, setNewStartDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newEmergency, setNewEmergency] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [editPasswordInput, setEditPasswordInput] = useState('');

  // Available rooms for assignment
  const availableRooms = rooms.filter((r) => r.status === 'available');

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.phone.includes(searchQuery) ||
      tenant.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdd = () => {
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewRoomId(availableRooms.length > 0 ? availableRooms[0].id : '');
    setNewStartDate(new Date().toISOString().split('T')[0]);
    setNewEmergency('');
    setNewNotes('');
    setNewPassword('');
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomId) {
      setErrorMessage('Pilih kamar yang tersedia untuk penghuni.');
      return;
    }

    const res = addTenant({
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim(),
      roomId: newRoomId,
      startDate: newStartDate,
      emergencyContact: newEmergency.trim() || undefined,
      password: newPassword.trim() || undefined,
      notes: newNotes.trim() || undefined,
    });

    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Gagal menambahkan penghuni.');
    }
  };

  const handleUpdateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    const payload: any = {
      name: editingTenant.name.trim(),
      phone: editingTenant.phone.trim(),
      email: editingTenant.email.trim(),
      roomId: editingTenant.roomId,
      startDate: editingTenant.startDate,
      emergencyContact: editingTenant.emergencyContact?.trim() || undefined,
      notes: editingTenant.notes?.trim() || undefined,
    };

    if (editPasswordInput.trim().length > 0) {
      payload.password = editPasswordInput.trim();
    }

    const res = updateTenant(editingTenant.id, payload);

    if (res.success) {
      setEditingTenant(null);
      setEditPasswordInput('');
    } else {
      setErrorMessage(res.error || 'Gagal memperbarui data penghuni.');
    }
  };

  const handleCheckOutConfirm = () => {
    if (!checkOutTargetId) return;
    const res = checkOutTenant(checkOutTargetId);
    if (!res.success) {
      alert(res.error);
    }
    setCheckOutTargetId(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    const res = deleteTenant(deleteTargetId);
    if (!res.success) {
      alert(res.error);
    }
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Data Penghuni Kost
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data kontak, kamar sewa, dan status tinggal penghuni
          </p>
        </div>

        {currentUser.role !== 'tenant' && (
          <button
            onClick={handleOpenAdd}
            disabled={availableRooms.length === 0}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors shadow-xs self-start sm:self-auto ${
              availableRooms.length === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'text-white bg-blue-600 hover:bg-blue-700'
            }`}
            title={availableRooms.length === 0 ? 'Semua kamar saat ini sudah terisi penuh' : 'Tambah penghuni baru'}
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Penghuni Baru</span>
          </button>
        )}
      </div>

      {availableRooms.length === 0 && currentUser.role !== 'tenant' && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Seluruh kamar kost saat ini sedang terisi (100% Okupansi). Anda tidak dapat menambah penghuni baru sampai ada kamar yang tersedia atau keluar.</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama penghuni, nomor HP, atau email..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              statusFilter === 'active'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Penghuni Aktif
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              statusFilter === 'inactive'
                ? 'bg-white text-slate-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sudah Keluar
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Nama Penghuni</th>
                <th className="px-5 py-3.5 font-semibold">Kamar Dihuni</th>
                <th className="px-5 py-3.5 font-semibold">Kontak (HP / Email)</th>
                <th className="px-5 py-3.5 font-semibold">Mulai Sewa</th>
                <th className="px-5 py-3.5 font-semibold">Status Tinggal</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400">
                    Tidak ada penghuni yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredTenants.map((tenant) => {
                  const room = rooms.find((r) => r.id === tenant.roomId);
                  const isCurrentActive = tenant.status === 'active';

                  return (
                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{tenant.name}</div>
                        {tenant.notes && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">{tenant.notes}</div>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        {room ? (
                          <div>
                            <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              Kamar {room.number}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {formatRupiah(room.monthlyPrice)} / bln
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-slate-900 font-medium">{tenant.phone}</div>
                        <div className="text-[11px] text-slate-400">{tenant.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600">
                        {formatDate(tenant.startDate)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                              isCurrentActive
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {isCurrentActive ? 'Aktif Menghuni' : 'Sudah Keluar'}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              tenant.hasPassword
                                ? 'text-blue-700 bg-blue-50'
                                : 'text-amber-700 bg-amber-50'
                            }`}
                          >
                            <KeyRound className="w-2.5 h-2.5" />
                            {tenant.hasPassword ? 'Ada Password' : 'Belum Ada Password'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingTenant(tenant)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                            title="Lihat Detail Profil"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          {currentUser.role !== 'tenant' && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingTenant(tenant);
                                  setErrorMessage('');
                                }}
                                className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                title="Edit Data Penghuni"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {isCurrentActive && (
                                <button
                                  onClick={() => setCheckOutTargetId(tenant.id)}
                                  className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                  title="Check Out / Selesai Sewa"
                                >
                                  <LogOut className="w-4 h-4" />
                                </button>
                              )}
                              {currentUser.role === 'owner' && (
                                <button
                                  onClick={() => setDeleteTargetId(tenant.id)}
                                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                  title="Hapus Data Penghuni"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
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

      {/* Add Tenant Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Pendaftaran Penghuni Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Penghuni <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rian Pratama"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="Contoh: 0812-3456-7890"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email Aktif <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Kamar yang Dihuni <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newRoomId}
                    onChange={(e) => setNewRoomId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {availableRooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        Kamar {r.number} ({formatRupiah(r.monthlyPrice)}/bln)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tanggal Mulai Masuk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kontak Darurat (Keluarga / Kerabat)
                </label>
                <input
                  type="text"
                  value={newEmergency}
                  onChange={(e) => setNewEmergency(e.target.value)}
                  placeholder="Contoh: 0812-9988-7766 (Ibu Rahayu - Orang Tua)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi Awal (Opsional)
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Kosongkan jika ingin penghuni mengatur sendiri saat login pertama"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Jika dikosongkan, penghuni akan otomatis diminta membuat password saat pertama kali login di landing page.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Pekerjaan / Kendaraan
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Karyawan swasta IT, motor Honda Vario B 4920 ABC"
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
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
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-xs"
                >
                  Daftarkan Penghuni
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Tenant Modal */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">
                Edit Data Penghuni: {editingTenant.name}
              </h3>
              <button
                onClick={() => setEditingTenant(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  value={editingTenant.name}
                  onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    value={editingTenant.phone}
                    onChange={(e) => setEditingTenant({ ...editingTenant, phone: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingTenant.email}
                    onChange={(e) => setEditingTenant({ ...editingTenant, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pindah Kamar (Opsional)</label>
                  <select
                    value={editingTenant.roomId}
                    onChange={(e) => setEditingTenant({ ...editingTenant, roomId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    {/* Allow current room + available rooms */}
                    <option value={editingTenant.roomId}>
                      {rooms.find((r) => r.id === editingTenant.roomId)?.number} (Kamar Sekarang)
                    </option>
                    {availableRooms
                      .filter((r) => r.id !== editingTenant.roomId)
                      .map((r) => (
                        <option key={r.id} value={r.id}>
                          Pindah ke Kamar {r.number} ({formatRupiah(r.monthlyPrice)}/bln)
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai Sewa</label>
                  <input
                    type="date"
                    value={editingTenant.startDate}
                    onChange={(e) => setEditingTenant({ ...editingTenant, startDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kontak Darurat</label>
                <input
                  type="text"
                  value={editingTenant.emergencyContact || ''}
                  onChange={(e) => setEditingTenant({ ...editingTenant, emergencyContact: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              {/* Kelola Kata Sandi Penghuni oleh Admin */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                    <span>Reset / Ganti Password Portal</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Status saat ini: {editingTenant.hasPassword ? 'Sudah Punya' : 'Belum Ada'}
                  </span>
                </div>
                <input
                  type="text"
                  value={editPasswordInput}
                  onChange={(e) => setEditPasswordInput(e.target.value)}
                  placeholder="Ketik kata sandi baru untuk mereset (kosongkan jika tidak diubah)"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                />
                <p className="text-[10px] text-slate-500">
                  Gunakan fitur ini jika penghuni lupa password mereka saat login di Landing Page.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  value={editingTenant.notes || ''}
                  onChange={(e) => setEditingTenant({ ...editingTenant, notes: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
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
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tenant Detail Modal */}
      {viewingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Profil Penghuni</h3>
                <p className="text-xs text-slate-500">{viewingTenant.name}</p>
              </div>
              <button
                onClick={() => setViewingTenant(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block mb-0.5">Kamar Dihuni</span>
                  <span className="font-bold text-slate-900 text-sm">
                    Kamar {rooms.find((r) => r.id === viewingTenant.roomId)?.number || '-'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block mb-0.5">Status Tinggal</span>
                  <span className="font-semibold text-emerald-700">
                    {viewingTenant.status === 'active' ? 'Aktif Menghuni' : 'Sudah Keluar'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Nomor WhatsApp / HP</span>
                  <span className="font-medium text-slate-900">{viewingTenant.phone}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Email</span>
                  <span className="font-medium text-slate-900">{viewingTenant.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tanggal Mulai Masuk</span>
                  <span className="font-medium text-slate-900">{formatDate(viewingTenant.startDate)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Kontak Darurat</span>
                  <span className="font-medium text-slate-900 text-right">{viewingTenant.emergencyContact || '-'}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 block mb-1">Catatan Tambahan:</span>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-700">
                    {viewingTenant.notes || 'Tidak ada catatan khusus.'}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setViewingTenant(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-medium"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Check Out Modal */}
      <ConfirmModal
        isOpen={!!checkOutTargetId}
        title="Konfirmasi Check Out Penghuni?"
        message="Penghuni ini akan ditandai sebagai 'Sudah Keluar' dan status kamar akan otomatis menjadi 'Tersedia' untuk disewakan ke penghuni berikutnya."
        confirmLabel="Check Out Penghuni"
        cancelLabel="Batal"
        isDestructive={false}
        onConfirm={handleCheckOutConfirm}
        onCancel={() => setCheckOutTargetId(null)}
      />

      {/* Confirm Delete Tenant Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Hapus Data Penghuni?"
        message="Apakah Anda yakin ingin menghapus data penghuni ini dari arsip? Kamar yang ditempati akan otomatis dikosongkan."
        confirmLabel="Hapus Data"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
