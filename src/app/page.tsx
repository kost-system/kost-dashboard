'use client';

import React, { useState, useEffect } from 'react';
import { KostProvider, useKost } from '../context/KostContext';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { DashboardPage } from '../components/dashboard/DashboardPage';
import { RoomsPage } from '../components/rooms/RoomsPage';
import { TenantsPage } from '../components/tenants/TenantsPage';
import { InvoicesPage } from '../components/invoices/InvoicesPage';
import { ExpensesPage } from '../components/expenses/ExpensesPage';
import { FinancialReportsPage } from '../components/reports/FinancialReportsPage';
import { SettingsPage } from '../components/settings/SettingsPage';
import { TenantPortalPage } from '../components/tenant-portal/TenantPortalPage';

function MainLayout() {
  const { currentUser } = useKost();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // If user role is tenant and they are currently on a restricted tab, redirect them to dashboard
  useEffect(() => {
    if (currentUser.role === 'tenant') {
      const allowedTabsForTenant = ['dashboard', 'invoices', 'tenant-room'];
      if (!allowedTabsForTenant.includes(currentTab)) {
        setCurrentTab('dashboard');
      }
    }
  }, [currentUser.role, currentTab]);

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
          <span>Memuat KostFlow...</span>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'rooms':
        return currentUser.role !== 'tenant' ? (
          <RoomsPage />
        ) : (
          <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'tenants':
        return currentUser.role !== 'tenant' ? (
          <TenantsPage />
        ) : (
          <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'invoices':
        return <InvoicesPage />;
      case 'expenses':
        return currentUser.role !== 'tenant' ? (
          <ExpensesPage />
        ) : (
          <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'reports':
        return currentUser.role !== 'tenant' ? (
          <FinancialReportsPage />
        ) : (
          <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'settings':
        return currentUser.role !== 'tenant' ? (
          <SettingsPage />
        ) : (
          <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />
        );
      case 'tenant-room':
        return <TenantPortalPage />;
      default:
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-slate-900 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentTab={currentTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderContent()}
        </main>

        {/* Clean Footer */}
        <footer className="py-4 px-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
          <p>
            KostFlow — Dashboard Manajemen Rumah Kost · Next.js App Router Edition
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <KostProvider>
      <MainLayout />
    </KostProvider>
  );
}
