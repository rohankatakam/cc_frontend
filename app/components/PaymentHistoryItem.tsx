'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/lib/types';
import { formatCurrency, getStatusColor } from '@/lib/utils';

interface PaymentHistoryItemProps {
  payment: Payment;
  onSelect: (paymentId: string) => void;
}

export default function PaymentHistoryItem({ payment, onSelect }: PaymentHistoryItemProps) {
  const [relativeTime, setRelativeTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const createdAt = new Date(payment.created_at);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - createdAt.getTime()) / 1000);

      if (diffInSeconds < 60) {
        setRelativeTime(`${diffInSeconds}s ago`);
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setRelativeTime(`${minutes}m ago`);
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        setRelativeTime(`${hours}h ago`);
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        setRelativeTime(`${days}d ago`);
      }
    };

    // Initial update
    updateTime();

    // Update every second if less than 1 minute old, otherwise every 30 seconds
    const createdAt = new Date(payment.created_at);
    const diffInSeconds = Math.floor((new Date().getTime() - createdAt.getTime()) / 1000);
    const interval = setInterval(updateTime, diffInSeconds < 60 ? 1000 : 30000);

    return () => clearInterval(interval);
  }, [payment.created_at]);

  return (
    <button
      onClick={() => onSelect(payment.payment_id)}
      className="w-full text-left p-3 rounded-lg border hover:bg-muted transition-colors"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-sm font-medium">
          {payment.payment_id.substring(0, 8)}...
        </span>
        <Badge
          variant={
            getStatusColor(payment.status) === 'green'
              ? 'default'
              : getStatusColor(payment.status) === 'red'
              ? 'destructive'
              : 'secondary'
          }
        >
          {payment.status}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">
          {formatCurrency(payment.amount, payment.currency)}
        </span>
        <span className="text-muted-foreground">{relativeTime}</span>
      </div>
    </button>
  );
}
