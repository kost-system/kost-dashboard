import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { api } from '../../utils/api';
import { User, UserRole } from '../../types';
import {
  ShieldAlert,
  UserPlus,
  Trash2,
  KeyRound,
  ShieldCheck,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';

export const AdminManagementTab: React.FC = () => {
  const { currentUser, users, refreshData } = useKost();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('manager');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password reset modal state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Hanya role 'owner' yang bisa melihat dan mengelola menu ini
  if (currentUser.role !== 'owner') {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold">Akses Dibatasi</h4>
          <p className="text-xs mt-1">
            Hanya Superadmin / Pemilik Kost (Owner) yang memiliki hak akses untuk mengelola akun administrator dan memberikan kata sandi.
          </p>
        </div>
      </div>
    );
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.post('/users', {
        name,
        email,
        password,
        phone,
        role,
      });

      setSuccessMessage(`Admin ${name} berhasil ditambahkan!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setPhone('');
      setRole('manager');
      refreshData();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menambahkan akun admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.put(`/users/${editingUser.id}`, {
        password: newPassword,
      });

      setSuccessMessage(`Password akun ${editingUser.name} berhasil diperbarui!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setEditingUser(null);
      setNewPassword('');
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mengganti password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (user: User) => {
    if (user.email === 'owner@kost.com') {
      alert('Akun Superadmin Utama tidak dapat dihapus.');
      return;
    }
    if (!confirm(`Hapus hak akses admin untuk ${user.name} (${user.email})?`)) {
      return;
    }

    try {
      await api.delete(`/users/${user.id}`);
      refreshData();
      setSuccessMessage(`Akun ${user.name} berhasil dihapus.`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus user.');
    }
  };

  return (
    <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Manajemen Hak Akses & Administrator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Fitur khusus Super Admin / Owner: Tambah admin, atur peran (Owner / Manager), dan berikan password akun.
          </p>
        </div>

        <button
          onClick={() => {
            setErrorMessage('');
            setIsAddModalOpen(true);
          }}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Administrator</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Admin Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold">
              <th className="pb-2.5">Nama & Kontak</th>
              <th className="pb-2.5">Email Akun</th>
              <th className="pb-2.5">Peran / Role</th>
              <th className="pb-2.5 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const isOwner = user.role === 'owner';
              const isSelf = user.id === currentUser.id;
              return (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span>{user.name}</span>
                          {isSelf && (
                            <span className="text-[10px] text-blue-600 font-normal">
                              (Anda)
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500">{user.phone || '-'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-slate-600">{user.email}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isOwner
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}
                    >
                      {isOwner ? 'Super Admin / Pemilik' : 'Pengelola (Staff)'}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingUser(user);
                          setNewPassword('');
                          setErrorMessage('');
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                        title="Ubah Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>

                      {user.email !== 'owner@kost.com' && !isSelf && (
                        <button
                          onClick={() => handleDeleteAdmin(user)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          title="Hapus Hak Akses"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah Admin */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-purple-600" />
                <span>Tambah Akun Administrator</span>
              </h4>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleAddAdmin} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin2@kost.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kata Sandi / Password Baru
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WA</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxx"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Peran / Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="manager">Pengelola (Staff)</option>
                    <option value="owner">Super Admin / Owner</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Password */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-purple-600" />
                <span>Reset Kata Sandi</span>
              </h4>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Masukkan kata sandi baru untuk akun <strong>{editingUser.name}</strong> ({editingUser.email}):
            </p>

            <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Password Baru</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ketik password baru"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-800 rounded-xl disabled:opacity-50"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Perbarui Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
