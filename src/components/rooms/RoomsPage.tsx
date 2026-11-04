import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { Room, RoomStatus } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmModal } from '../common/ConfirmModal';
import { 
  Plus, 
  Search, 
  Filter, 
  DoorClosed, 
  Edit2, 
  Trash2, 
  User, 
  X, 
  Check, 
  AlertCircle,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

export const RoomsPage: React.FC = () => {
  const { rooms, tenants, addRoom, updateRoom, deleteRoom, currentUser } = useKost();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RoomStatus>('all');
  const [floorFilter, setFloorFilter] = useState<'all' | number>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Add Room Form State
  const [newNumber, setNewNumber] = useState('');
  const [newFloor, setNewFloor] = useState(1);
  const [newType, setNewType] = useState('Kamar Mandi Dalam + AC');
  const [newPrice, setNewPrice] = useState(1500000);
  const [newStatus, setNewStatus] = useState<RoomStatus>('available');
  const [newNotes, setNewNotes] = useState('');

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch = room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (room.notes && room.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
    const matchesFloor = floorFilter === 'all' || room.floor === floorFilter;
    return matchesSearch && matchesStatus && matchesFloor;
  });

  const handleOpenAddModal = () => {
    setNewNumber('');
    setNewFloor(1);
    setNewType('Kamar Mandi Dalam + AC');
    setNewPrice(1500000);
    setNewStatus('available');
    setNewNotes('');
    setErrorMessage('');
    setIsAddModalOpen(true);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim()) {
      setErrorMessage('Nomor kamar wajib diisi.');
      return;
    }

    const res = addRoom({
      number: newNumber.trim().toUpperCase(),
      floor: Number(newFloor),
      type: newType.trim(),
      monthlyPrice: Number(newPrice),
      status: newStatus,
      notes: newNotes.trim() || undefined,
    });

    if (res.success) {
      setIsAddModalOpen(false);
    } else {
      setErrorMessage(res.error || 'Gagal menambahkan kamar.');
    }
  };

  const handleUpdateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;

    const res = updateRoom(editingRoom.id, {
      number: editingRoom.number.trim().toUpperCase(),
      floor: Number(editingRoom.floor),
      type: editingRoom.type.trim(),
      monthlyPrice: Number(editingRoom.monthlyPrice),
      status: editingRoom.status,
      notes: editingRoom.notes?.trim() || undefined,
    });

    if (res.success) {
      setEditingRoom(null);
    } else {
      setErrorMessage(res.error || 'Gagal memperbarui kamar.');
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingRoomId) return;
    const res = deleteRoom(deletingRoomId);
    if (!res.success) {
      alert(res.error);
    }
    setDeletingRoomId(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Manajemen Kamar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kelola data kamar, harga sewa bulanan, dan status okupansi
          </p>
        </div>

        {currentUser.role !== 'tenant' && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kamar Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor kamar, tipe, atau catatan..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600 bg-slate-50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Status
            </button>
            <button
              onClick={() => setStatusFilter('available')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'available'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tersedia
            </button>
            <button
              onClick={() => setStatusFilter('occupied')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'occupied'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terisi
            </button>
            <button
              onClick={() => setStatusFilter('maintenance')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === 'maintenance'
                  ? 'bg-white text-slate-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemeliharaan
            </button>
          </div>

          {/* Floor filter */}
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 text-xs border border-slate-200 bg-white rounded-lg focus:outline-hidden"
          >
            <option value="all">Semua Lantai</option>
            <option value="1">Lantai 1</option>
            <option value="2">Lantai 2</option>
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Nomor Kamar</th>
                <th className="px-5 py-3.5 font-semibold">Lantai & Tipe</th>
                <th className="px-5 py-3.5 font-semibold">Harga Sewa / Bulan</th>
                <th className="px-5 py-3.5 font-semibold">Status Okupansi</th>
                <th className="px-5 py-3.5 font-semibold">Penghuni Saat Ini</th>
                <th className="px-5 py-3.5 font-semibold">Catatan / Fasilitas</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRooms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400">
                    Tidak ada kamar yang cocok dengan filter yang dipilih.
                  </td>
                </tr>
              ) : (
                filteredRooms.map((room) => {
                  const currentTenant = tenants.find((t) => t.id === room.currentTenantId);
                  return (
                    <tr key={room.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 text-sm">
                        {room.number}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-slate-900">{room.type}</div>
                        <div className="text-[11px] text-slate-400">Lantai {room.floor}</div>
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 font-mono tabular-nums">
                        {formatRupiah(room.monthlyPrice)}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge type="room" status={room.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        {currentTenant ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-900">
                            <User className="w-3.5 h-3.5 text-blue-600" />
                            <span>{currentTenant.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Tidak ada penghuni</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 max-w-xs truncate" title={room.notes}>
                        {room.notes || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingRoom(room);
                              setErrorMessage('');
                            }}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Kamar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {currentUser.role === 'owner' && (
                            <button
                              onClick={() => setDeletingRoomId(room.id)}
                              disabled={!!room.currentTenantId}
                              className={`p-1.5 rounded-md transition-colors ${
                                room.currentTenantId
                                  ? 'text-slate-300 cursor-not-allowed'
                                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={room.currentTenantId ? 'Kamar terisi tidak dapat dihapus' : 'Hapus Kamar'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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

      {/* Modal Add Room */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">Tambah Kamar Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Kamar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newNumber}
                  onChange={(e) => setNewNumber(e.target.value)}
                  placeholder="Contoh: A05 atau B05"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lantai</label>
                  <select
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                    <option value={3}>Lantai 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Awal</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as RoomStatus)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="available">Tersedia</option>
                    <option value="maintenance">Pemeliharaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe / Spesifikasi</label>
                <input
                  type="text"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="Contoh: Standard AC / Kamar Mandi Dalam"
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Harga Sewa Bulanan (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Posisi dekat tangga, fasilitas kasur queen size..."
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
                  Simpan Kamar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Room */}
      {editingRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-semibold text-slate-900">
                Edit Kamar {editingRoom.number}
              </h3>
              <button
                onClick={() => setEditingRoom(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRoom} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Kamar</label>
                <input
                  type="text"
                  value={editingRoom.number}
                  onChange={(e) => setEditingRoom({ ...editingRoom, number: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lantai</label>
                  <select
                    value={editingRoom.floor}
                    onChange={(e) => setEditingRoom({ ...editingRoom, floor: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value={1}>Lantai 1</option>
                    <option value={2}>Lantai 2</option>
                    <option value={3}>Lantai 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status Okupansi</label>
                  <select
                    value={editingRoom.status}
                    onChange={(e) => setEditingRoom({ ...editingRoom, status: e.target.value as RoomStatus })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="available">Tersedia</option>
                    <option value="occupied">Terisi</option>
                    <option value="maintenance">Pemeliharaan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe / Fasilitas</label>
                <input
                  type="text"
                  value={editingRoom.type}
                  onChange={(e) => setEditingRoom({ ...editingRoom, type: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Harga Sewa Bulanan (Rp)</label>
                <input
                  type="number"
                  min="0"
                  step="50000"
                  value={editingRoom.monthlyPrice}
                  onChange={(e) => setEditingRoom({ ...editingRoom, monthlyPrice: Number(e.target.value) })}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan</label>
                <textarea
                  value={editingRoom.notes || ''}
                  onChange={(e) => setEditingRoom({ ...editingRoom, notes: e.target.value })}
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
                  onClick={() => setEditingRoom(null)}
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

      {/* Confirm Delete Room Modal */}
      <ConfirmModal
        isOpen={!!deletingRoomId}
        title="Hapus Kamar?"
        message="Apakah Anda yakin ingin menghapus kamar ini? Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Kamar"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingRoomId(null)}
      />
    </div>
  );
};
