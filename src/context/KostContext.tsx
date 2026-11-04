'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  User,
  Room,
  Tenant,
  Invoice,
  PaymentSubmission,
  Expense,
  KostSettings,
  PaymentMethod,
} from '../types';
import { api } from '../utils/api';

const DEFAULT_SETTINGS: KostSettings = {
  kostName: 'Kost Management',
  tagline: 'Sistem Manajemen Kos',
  address: '',
  phone: '',
  email: '',
  bankName: '',
  bankAccountNumber: '',
  bankAccountName: '',
  qrisNmid: '',
  qrisMerchantName: '',
  qrisImageUrl: '',
  defaultDueDay: 10,
  paymentInstructions: 'Silakan lakukan transfer atau scan QRIS sesuai tagihan.',
};

const DEFAULT_USER: User = {
  id: 'admin-1',
  name: 'Admin Pemilik',
  email: 'admin@kost.com',
  phone: '08123456789',
  role: 'owner',
};

interface KostContextType {
  currentUser: User;
  users: User[];
  rooms: Room[];
  tenants: Tenant[];
  invoices: Invoice[];
  submissions: PaymentSubmission[];
  expenses: Expense[];
  settings: KostSettings;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  switchUser: (userId: string) => void;
  // Room Actions
  addRoom: (room: Omit<Room, 'id'>) => { success: boolean; error?: string };
  updateRoom: (id: string, updates: Partial<Room>) => { success: boolean; error?: string };
  deleteRoom: (id: string) => { success: boolean; error?: string };
  // Tenant Actions
  addTenant: (tenant: any) => { success: boolean; error?: string };
  updateTenant: (id: string, updates: Partial<Tenant>) => { success: boolean; error?: string };
  checkOutTenant: (id: string) => { success: boolean; error?: string };
  deleteTenant: (id: string) => { success: boolean; error?: string };
  // Invoice Actions
  createInvoice: (invoice: any) => { success: boolean; error?: string };
  batchGenerateInvoices: (periodMonth: string, _notes?: any) => { success: boolean; count: number; message: string };
  updateInvoice: (id: string, updates: Partial<Invoice>) => { success: boolean; error?: string };
  deleteInvoice: (id: string) => { success: boolean; error?: string };
  // Payment Actions
  submitPaymentProof: (data: {
    invoiceId: string;
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    senderBank?: string;
    senderName?: string;
    proofImageUrl: string;
    notes?: string;
  }) => { success: boolean; error?: string };
  verifyPayment: (submissionId: string, notes?: string) => { success: boolean; error?: string };
  rejectPayment: (submissionId: string, rejectionReason: string) => { success: boolean; error?: string };
  // Expense Actions
  addExpense: (expense: Omit<Expense, 'id' | 'recordedBy'>) => { success: boolean; error?: string };
  updateExpense: (id: string, updates: Partial<Expense>) => { success: boolean; error?: string };
  deleteExpense: (id: string) => { success: boolean; error?: string };
  // Settings Actions
  updateSettings: (updates: Partial<KostSettings>) => void;
  resetToDefaultData: () => void;
}

const KostContext = createContext<KostContextType | undefined>(undefined);

export const KostProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(DEFAULT_USER);
  const [users, setUsers] = useState<User[]>([DEFAULT_USER]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<KostSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get<{
        users: User[];
        rooms: Room[];
        tenants: Tenant[];
        invoices: Invoice[];
        submissions: PaymentSubmission[];
        expenses: Expense[];
        settings: KostSettings | null;
      }>('/bootstrap');

      if (data.users && data.users.length > 0) {
        setUsers(data.users);
      }
      setRooms(data.rooms || []);
      setTenants(data.tenants || []);
      setInvoices(data.invoices || []);
      setSubmissions(data.submissions || []);
      setExpenses(data.expenses || []);
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err: any) {
      console.warn('Backend server not connected yet, working in clean empty mode');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) setCurrentUser(user);
  };

  // ROOM ACTIONS
  const addRoom = (roomData: Omit<Room, 'id'>) => {
    api.post('/rooms', roomData).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    api.put(`/rooms/${id}`, updates).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const deleteRoom = (id: string) => {
    api.delete(`/rooms/${id}`).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  // TENANT ACTIONS
  const addTenant = (tenantData: any) => {
    const payload = { status: 'active', ...tenantData };
    api.post('/tenants', payload).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const updateTenant = (id: string, updates: Partial<Tenant>) => {
    api.put(`/tenants/${id}`, updates).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const checkOutTenant = (id: string) => {
    api.post(`/tenants/${id}/checkout`).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const deleteTenant = (id: string) => {
    api.delete(`/tenants/${id}`).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  // INVOICE ACTIONS
  const createInvoice = (invoiceData: any) => {
    const payload = {
      status: 'unpaid',
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      ...invoiceData,
    };
    api.post('/invoices', payload).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const batchGenerateInvoices = (periodMonth: string, _notes?: any) => {
    api.post('/invoices/batch-generate', { periodMonth }).then(() => refreshData()).catch(console.error);
    return {
      success: true,
      count: 0,
      message: `Permintaan generate tagihan periode ${periodMonth} dikirim ke server backend.`,
    };
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    api.put(`/invoices/${id}`, updates).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const deleteInvoice = (id: string) => {
    api.delete(`/invoices/${id}`).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  // PAYMENT WORKFLOW
  const submitPaymentProof = (data: {
    invoiceId: string;
    amount: number;
    paymentDate: string;
    method: PaymentMethod;
    senderBank?: string;
    senderName?: string;
    proofImageUrl: string;
    notes?: string;
  }) => {
    api.post('/submissions', data).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const verifyPayment = (submissionId: string, notes?: string) => {
    if (currentUser.role === 'tenant') {
      return {
        success: false,
        error: 'Akses ditolak: Hanya Pemilik atau Pengelola yang berhak memverifikasi pembayaran.',
      };
    }
    const reviewerName = `${currentUser.name} (${currentUser.role === 'owner' ? 'Pemilik' : 'Pengelola'})`;
    api.post(`/submissions/${submissionId}/verify`, { reviewerName, notes }).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const rejectPayment = (submissionId: string, rejectionReason: string) => {
    if (currentUser.role === 'tenant') {
      return {
        success: false,
        error: 'Akses ditolak: Hanya Pemilik atau Pengelola yang berhak memproses pembayaran.',
      };
    }
    if (!rejectionReason || !rejectionReason.trim()) {
      return { success: false, error: 'Alasan penolakan pembayaran wajib diisi.' };
    }
    const reviewerName = `${currentUser.name} (${currentUser.role === 'owner' ? 'Pemilik' : 'Pengelola'})`;
    api.post(`/submissions/${submissionId}/reject`, { reviewerName, rejectionReason }).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  // EXPENSE ACTIONS
  const addExpense = (expenseData: Omit<Expense, 'id' | 'recordedBy'>) => {
    const recordedBy = `${currentUser.name} (${currentUser.role === 'owner' ? 'Pemilik' : 'Pengelola'})`;
    api.post('/expenses', { ...expenseData, recordedBy }).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    api.put(`/expenses/${id}`, updates).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  const deleteExpense = (id: string) => {
    api.delete(`/expenses/${id}`).then(() => refreshData()).catch(console.error);
    return { success: true };
  };

  // SETTINGS ACTIONS
  const updateSettings = (updates: Partial<KostSettings>) => {
    api.put('/settings', updates).then(() => refreshData()).catch(console.error);
  };

  const resetToDefaultData = () => {
    refreshData();
  };

  return (
    <KostContext.Provider
      value={{
        currentUser,
        users,
        rooms,
        tenants,
        invoices,
        submissions,
        expenses,
        settings,
        isLoading,
        error,
        refreshData,
        switchUser,
        addRoom,
        updateRoom,
        deleteRoom,
        addTenant,
        updateTenant,
        checkOutTenant,
        deleteTenant,
        createInvoice,
        batchGenerateInvoices,
        updateInvoice,
        deleteInvoice,
        submitPaymentProof,
        verifyPayment,
        rejectPayment,
        addExpense,
        updateExpense,
        deleteExpense,
        updateSettings,
        resetToDefaultData,
      }}
    >
      {children}
    </KostContext.Provider>
  );
};

export const useKost = () => {
  const context = useContext(KostContext);
  if (!context) {
    throw new Error('useKost must be used within a KostProvider');
  }
  return context;
};
