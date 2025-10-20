'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Payment } from '@/lib/types';
import { getPayment } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Copy, ExternalLink } from 'lucide-react';

interface PaymentTableProps {
  paymentIds: string[];
  onSelectPayment: (paymentId: string) => void;
  onNewTransfer?: () => void;
}

export default function PaymentTable({ paymentIds, onSelectPayment, onNewTransfer }: PaymentTableProps) {
  const [payments, setPayments] = useState<Map<string, Payment>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllPayments = async () => {
      const newPayments = new Map<string, Payment>();

      for (const paymentId of paymentIds) {
        try {
          const payment = await getPayment(paymentId);
          newPayments.set(paymentId, payment);
        } catch (error) {
          console.error(`Failed to fetch payment ${paymentId}:`, error);
        }
      }

      setPayments(newPayments);
      setLoading(false);
    };

    fetchAllPayments();

    // Refresh every 3 seconds
    const interval = setInterval(fetchAllPayments, 3000);
    return () => clearInterval(interval);
  }, [paymentIds]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'default';
      case 'FAILED':
        return 'destructive';
      default:
        return 'secondary';
    }
  };


  const getProgressPercentage = (status: string) => {
    const statusMap: Record<string, number> = {
      PENDING: 25,
      ONRAMP_PENDING: 50,
      ONRAMP_COMPLETE: 75,
      OFFRAMP_PENDING: 75,
      COMPLETED: 100,
      FAILED: 0,
    };
    return statusMap[status] || 0;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Loading payments...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment Transactions</CardTitle>
          {onNewTransfer && (
            <Button onClick={onNewTransfer}>
              + New transfer
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr className="text-left">
                <th className="pb-3 pr-4 text-sm font-semibold text-gray-900">Payment ID</th>
                <th className="pb-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
                <th className="pb-3 px-4 text-sm font-semibold text-gray-900">Status</th>
                <th className="pb-3 px-4 text-sm font-semibold text-gray-900">Progress</th>
                <th className="pb-3 px-4 text-sm font-semibold text-gray-900">Created</th>
                <th className="pb-3 pl-4 text-sm font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {Array.from(payments.values()).map((payment) => {
                const progress = getProgressPercentage(payment.status);
                const createdAt = new Date(payment.created_at);
                const timeAgo = getRelativeTime(createdAt);

                return (
                  <tr
                    key={payment.payment_id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => onSelectPayment(payment.payment_id)}
                  >
                    {/* Payment ID */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-gray-700 bg-gray-100 px-2 py-1 rounded">
                          {payment.payment_id}
                        </code>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(payment.payment_id);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy to clipboard"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <Badge variant={getStatusBadgeVariant(payment.status)}>
                        {payment.status.replace('_', ' ')}
                      </Badge>
                    </td>

                    {/* Progress */}
                    <td className="py-4 px-4">
                      <div className="w-32">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              payment.status === 'FAILED'
                                ? 'bg-red-500'
                                : payment.status === 'COMPLETED'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{progress}%</div>
                      </div>
                    </td>

                    {/* Created */}
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">{timeAgo}</div>
                      <div className="text-xs text-gray-400">
                        {createdAt.toLocaleTimeString()}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 pl-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPayment(payment.payment_id);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {payments.size === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No payments found
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}
