import React from 'react';
import { useKost } from '../../context/KostContext';
import {
  LayoutDashboard,
  DoorClosed,
  Users,
  Receipt,
  TrendingDown,
  BarChart3,
  Settings,
  Building,
  X,
  CreditCard,
  UserCheck,
  MessageSquareShare,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, submissions, settings } = useKost();

  const pendingCount = submissions.filter((s) => s.status === 'pending').length;

  // Build authorized navigation items according to current role
  interface NavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badgeCount?: number;
  }

  const getNavItems = (): NavItem[] => {
    if (currentUser?.role === 'tenant') {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'invoices', label: 'Tagihan Saya', icon: Receipt },
        { id: 'tenant-room', label: 'Kamar & Profil Saya', icon: DoorClosed },
      ];
    }

    // Owner and Manager navigation items
    const items: NavItem[] = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'rooms', label: 'Kamar', icon: DoorClosed },
      { id: 'tenants', label: 'Penghuni', icon: Users },
      {
        id: 'invoices',
        label: 'Tagihan & Pembayaran',
        icon: Receipt,
        badgeCount: pendingCount > 0 ? pendingCount : undefined,
      },
      { id: 'expenses', label: 'Pengeluaran', icon: TrendingDown },
      { id: 'reports', label: 'Laporan', icon: BarChart3 },
      { id: 'settings', label: 'Pengaturan', icon: Settings },
    ];

    return items;
  };

  const navItems = getNavItems();

  const handleItemClick = (id: string) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-sm">
            KF
          </div>
          <div className="leading-tight">
            <span className="text-base font-bold text-white tracking-tight">KostFlow</span>
            <span className="block text-[11px] text-slate-400 font-normal">Manajemen Kost</span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Tutup menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Kost Context Summary */}
      <div className="px-5 py-3 border-b border-slate-800/60 bg-slate-950/40">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-0.5">
          Properti Aktif
        </div>
        <div className="text-xs font-medium text-slate-200 truncate">
          {settings.kostName}
        </div>
        <div className="text-[11px] text-slate-400 truncate mt-0.5">
          {settings.address.split(',')[0]}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badgeCount !== undefined && item.badgeCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                  {item.badgeCount}
                </span>
              )}
            </button>
          );
        })}

        {/* Shortcut Bot WhatsApp untuk Superadmin/Owner */}
        {currentUser?.role === 'owner' && (
          <div className="pt-3 mt-3 border-t border-slate-800/80">
            <div className="px-3.5 mb-1.5 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              Layanan Eksternal
            </div>
            <a
              href={`${process.env.NEXT_PUBLIC_WA_BOT_URL || 'http://localhost:5001'}/qr`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors border border-emerald-900/40"
              title="Buka status dan scan QR WhatsApp Bot"
            >
              <div className="flex items-center gap-3">
                <MessageSquareShare className="w-4 h-4 text-emerald-400" />
                <span>Bot WhatsApp</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        )}
      </nav>

      {/* Role Indicator Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-white truncate">{currentUser.name}</div>
            <div className="text-[11px] text-slate-400 capitalize">
              {currentUser.role === 'owner' ? 'Pemilik Kost' : currentUser.role === 'manager' ? 'Pengelola Kost' : 'Penghuni Kost'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-screen sticky top-0 z-40 border-r border-slate-800 shadow-sm">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop & Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-slate-900 shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
