import React from 'react';
import { InvoiceStatus, RoomStatus } from '../../types';
import { getInvoiceStatusConfig, getRoomStatusConfig } from '../../utils/formatters';

interface StatusBadgeProps {
  type: 'invoice' | 'room' | 'submission';
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status, className = '' }) => {
  if (type === 'invoice') {
    const config = getInvoiceStatusConfig(status as InvoiceStatus);
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${config.bg} ${config.text} ${config.border} ${className}`}
      >
        {config.label}
      </span>
    );
  }

  if (type === 'room') {
    const config = getRoomStatusConfig(status as RoomStatus);
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium rounded border ${config.bg} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
        {config.label}
      </span>
    );
  }

  if (type === 'submission') {
    if (status === 'verified') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border bg-emerald-50 text-emerald-700 border-emerald-200">
          Disetujui
        </span>
      );
    }
    if (status === 'rejected') {
      return (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border bg-rose-50 text-rose-700 border-rose-200">
          Ditolak
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border bg-amber-50 text-amber-700 border-amber-200">
        Menunggu Review
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-slate-100 text-slate-700 border border-slate-200">
      {status}
    </span>
  );
};
