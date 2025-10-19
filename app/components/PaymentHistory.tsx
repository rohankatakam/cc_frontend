'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Payment } from '@/lib/types';
import { getStoredPaymentIds, listPayments, clearPaymentHistory } from '@/lib/api';
import { Loader2, Trash2 } from 'lucide-react';
import PaymentHistoryItem from './PaymentHistoryItem';

interface PaymentHistoryProps {
  onSelectPayment: (paymentId: string) => void;
}

export default function PaymentHistory({ onSelectPayment }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPayments = async () => {
    const paymentIds = getStoredPaymentIds();
    if (paymentIds.length > 0) {
      const data = await listPayments(paymentIds);
      setPayments(data);
    } else {
      setPayments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();

    // Refresh data every 5 seconds (updates state in background, no reload flash)
    const interval = setInterval(loadPayments, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear payment history?')) {
      clearPaymentHistory();
      setPayments([]);
    }
  };

  // Memoize payment items to prevent unnecessary re-renders
  const paymentItems = useMemo(
    () =>
      payments.map((payment) => (
        <PaymentHistoryItem
          key={payment.payment_id}
          payment={payment}
          onSelect={onSelectPayment}
        />
      )),
    [payments, onSelectPayment]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payment History</CardTitle>
          {payments.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearHistory}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear History
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payment history. Create a payment to get started.
          </div>
        ) : (
          <div className="space-y-2">{paymentItems}</div>
        )}
      </CardContent>
    </Card>
  );
}
