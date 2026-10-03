import React from 'react';
import { PropertyStatus } from '../../types';

interface PropertyStatusBadgeProps {
  status: PropertyStatus;
}

export const PropertyStatusBadge: React.FC<PropertyStatusBadgeProps> = ({ status }) => {
  const configs: Record<PropertyStatus, { label: string; bg: string; text: string; dot: string }> = {
    DRAFT: {
      label: 'Draft',
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      dot: 'bg-gray-400',
    },
    PAYMENT_PENDING: {
      label: 'Payment Pending',
      bg: 'bg-amber-50',
      text: 'text-amber-700 border border-amber-200',
      dot: 'bg-amber-500 animate-pulse',
    },
    PENDING_APPROVAL: {
      label: 'Pending Approval',
      bg: 'bg-blue-50',
      text: 'text-blue-700 border border-blue-200',
      dot: 'bg-blue-500 animate-pulse',
    },
    PUBLISHED: {
      label: 'Published',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700 border border-emerald-200',
      dot: 'bg-emerald-500',
    },
    REJECTED: {
      label: 'Rejected',
      bg: 'bg-red-50',
      text: 'text-red-700 border border-red-200',
      dot: 'bg-red-500',
    },
    EXPIRED: {
      label: 'Expired',
      bg: 'bg-purple-50',
      text: 'text-purple-700 border border-purple-200',
      dot: 'bg-purple-500',
    },
    REMOVED: {
      label: 'Removed',
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      dot: 'bg-gray-400',
    },
  };

  const config = configs[status] || configs.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
