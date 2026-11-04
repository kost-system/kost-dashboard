import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { Expense, ExpenseCategory } from '../../types';
import { formatRupiah, formatDate, getExpenseCategoryLabel, formatMonthPeriod } from '../../utils/formatters';
import { ConfirmModal } from '../common/ConfirmModal';
import {
  TrendingDown,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  X,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';

export const ExpensesPage: React.FC = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, currentUser } = useKost();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');
  const [monthFilter, setMonthFilter] = useState<string>('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(100000);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('utilities');
  const [notes, setNotes] = useState('');

  // Unique months for filter
  const uniqueMonths = Array.from(new Set(expenses.map((e) => e.date.substring(0, 7)))).sort().reverse();

  const filteredExpenses = expenses.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      exp.recordedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || exp.category === categoryFilter;
    const matchesMonth = monthFilter === 'all' || exp.date.startsWith(monthFilter);
    return matchesSearch && matchesCategory && matchesMonth;
  });

  // Calculate summary metrics
  const totalExpenseAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAdd = () => {
    setDescription('');
    setAmount(100000);
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('utilities');
    setNotes('');
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setErrorMessage('Deskripsi pengeluaran wajib diisi.');
      return;
    }
    if (amount <= 0) {
      setErrorMessage('Nominal pengeluaran harus lebih besar dari 0.');
      return;
    }

    const res = addExpense({
      description: description.trim(),
      amount: Number(amount),
      date,
      category,
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Gagal menyimpan pengeluaran.');
    }
  };

  const handleUpdateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExpense) return;

    const res = updateExpense(editingExpense.id, {
      description: editingExpense.description.trim(),
      amount: Number(editingExpense.amount),
      date: editingExpense.date,
      category: editingExpense.category,
      notes: editingExpense.notes?.trim() || undefined,
    });

    if (res.success) {
      setEditingExpense(null);
    } else {
      setErrorMessage(res.error || 'Gagal mengubah pengeluaran.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteExpense(deleteTargetId);
    setDeleteTargetId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pengeluaran Operasional
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pencatatan biaya listrik, air, perawatan, kebersihan, dan kebutuhan kost lainnya
          </p>
        </div>

        {currentUser.role !== 'tenant' && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Pengeluaran Baru</span>
          </button>
        )}
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Total Pengeluaran (Tersaring)
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRupiah(totalExpenseAmount)}
          </span>
          <p className="text-xs text-slate-500 mt-1">
            {filteredExpenses.length} transaksi pengeluaran tercatat
          </p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Rata-rata Pengeluaran
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {filteredExpenses.length > 0
              ? formatRupiah(Math.round(totalExpenseAmount / filteredExpenses.length))
              : 'Rp 0'}
          </span>
          <p className="text-xs text-slate-500 mt-1">Per transaksi pengeluaran</p>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 block mb-1">
            Kategori Terbesar
          </span>
          <span className="text-lg font-bold text-blue-700 truncate block">
            {getExpenseCategoryLabel('utilities')}
          </span>
          <p className="text-xs text-slate-500 mt-1">Listrik & Air rutin bulanan</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari deskripsi, catatan, atau pencatat..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-hidden"
          >
            <option value="all">Semua Kategori</option>
            <option value="utilities">Utilitas (Listrik & Air)</option>
            <option value="maintenance">Pemeliharaan & Servis</option>
            <option value="cleaning">Kebersihan</option>
            <option value="security">Keamanan</option>
            <option value="operational">Operasional Lainnya</option>
          </select>

          {/* Month Filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-hidden"
          >
            <option value="all">Semua Bulan</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthPeriod(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Tanggal</th>
                <th className="px-5 py-3.5 font-semibold">Kategori</th>
                <th className="px-5 py-3.5 font-semibold">Deskripsi Biaya</th>
                <th className="px-5 py-3.5 font-semibold">Jumlah (Rp)</th>
                <th className="px-5 py-3.5 font-semibold">Dicatat Oleh</th>
                <th className="px-5 py-3.5 font-semibold">Catatan / Bukti</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Belum ada pengeluaran yang sesuai dengan kriteria filter.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-3.5 text-slate-600">
                      {formatDate(exp.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {getExpenseCategoryLabel(exp.category)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      {exp.description}
                    </td>
                    <td className="px-5 py-3.5 font-bold text-rose-600 font-mono tabular-nums">
                      -{formatRupiah(exp.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {exp.recordedBy}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={exp.notes}>
                      {exp.notes || '-'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {currentUser.role !== 'tenant' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingExpense(exp);
                              setErrorMessage('');
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Pengeluaran"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetId(exp.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus Pengeluaran"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add Expense */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Catat Pengeluaran Operasional</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Deskripsi Pengeluaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Tagihan Listrik PLN Oktober"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Biaya</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="utilities">Utilitas (Listrik/Air)</option>
                    <option value="maintenance">Pemeliharaan/Servis</option>
                    <option value="cleaning">Kebersihan/Sampah</option>
                    <option value="security">Keamanan</option>
                    <option value="operational">Operasional Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jumlah Pengeluaran (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / No. Nota</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Contoh: No. struk PLN 98212903, lunas via M-Banking"
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
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Simpan Pengeluaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Expense */}
      {editingExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Edit Pengeluaran</h3>
              <button
                onClick={() => setEditingExpense(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateExpense} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Pengeluaran</label>
                <input
                  type="text"
                  value={editingExpense.description}
                  onChange={(e) => setEditingExpense({ ...editingExpense, description: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori</label>
                  <select
                    value={editingExpense.category}
                    onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="utilities">Utilitas (Listrik/Air)</option>
                    <option value="maintenance">Pemeliharaan/Servis</option>
                    <option value="cleaning">Kebersihan</option>
                    <option value="security">Keamanan</option>
                    <option value="operational">Operasional Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={editingExpense.date}
                    onChange={(e) => setEditingExpense({ ...editingExpense, date: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jumlah (Rp)</label>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={editingExpense.amount}
                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <textarea
                  value={editingExpense.notes || ''}
                  onChange={(e) => setEditingExpense({ ...editingExpense, notes: e.target.value })}
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
                  onClick={() => setEditingExpense(null)}
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

      {/* Delete Expense Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="Hapus Catatan Pengeluaran?"
        message="Apakah Anda yakin ingin menghapus catatan biaya ini dari pembukuan?"
        confirmLabel="Hapus Biaya"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
