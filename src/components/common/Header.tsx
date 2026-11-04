import React, { useState } from 'react';
import { useKost } from '../../context/KostContext';
import { 
  Building2, 
  Menu, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ShieldCheck, 
  UserCheck, 
  User as UserIcon,
  RotateCcw
} from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

interface HeaderProps {
  currentTab: string;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, onOpenMobileMenu }) => {
  const { currentUser, users, switchUser, submissions, resetToDefaultData } = useKost();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Pending verification count for managers and owners
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  const getPageTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Dashboard';
      case 'rooms':
        return 'Kamar & Okupansi';
      case 'tenants':
        return 'Daftar Penghuni';
      case 'invoices':
        return currentUser.role === 'tenant' ? 'Tagihan Saya' : 'Tagihan & Pembayaran';
      case 'expenses':
        return 'Pengeluaran Operasional';
      case 'reports':
        return 'Laporan Keuangan';
      case 'settings':
        return 'Pengaturan Kost';
      default:
        return 'Dashboard';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return 'Pemilik';
      case 'manager':
        return 'Pengelola';
      case 'tenant':
        return 'Penghuni';
      default:
        return role;
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'tenant':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
        {/* Left: Mobile trigger & breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-slate-900 tracking-tight text-base sm:text-lg">
              {getPageTitle(currentTab)}
            </span>
            <span className="hidden sm:inline text-slate-400">/</span>
            <span className="hidden sm:inline text-xs text-slate-500">
              KostFlow Residence
            </span>
          </div>
        </div>

        {/* Right: Role Switcher & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Pending verification alert badge for owner/manager */}
          {currentUser.role !== 'tenant' && pendingCount > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded-full animate-pulse">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>{pendingCount} Verifikasi Menunggu</span>
            </div>
          )}

          {/* User selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              aria-expanded={isUserMenuOpen}
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-xs shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-xs">
                <div className="font-medium text-slate-900 leading-tight">{currentUser.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`inline-block px-1.5 py-0.2 text-[10px] font-medium rounded border ${getRoleBadgeStyle(currentUser.role)}`}>
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div 
                className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Ganti Peran Pengguna
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pilih akun untuk menguji hak akses & dashboard
                  </p>
                </div>

                <div className="py-1">
                  {users.map((user) => {
                    const isSelected = user.id === currentUser.id;
                    return (
                      <button
                        key={user.id}
                        onClick={() => switchUser(user.id)}
                        className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                          isSelected ? 'bg-slate-50 font-medium' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-slate-900 font-medium">{user.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] rounded border ${getRoleBadgeStyle(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="p-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsUserMenuOpen(false);
                      setShowResetConfirm(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Data Demo KostFlow</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      <ConfirmModal
        isOpen={showResetConfirm}
        title="Reset Data Demo?"
        message="Tindakan ini akan mengembalikan semua data kamar, penghuni, tagihan, dan pembayaran ke status awal demo bawaan."
        confirmLabel="Reset Data"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={() => {
          resetToDefaultData();
          setShowResetConfirm(false);
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </>
  );
};
