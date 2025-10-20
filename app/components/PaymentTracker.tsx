'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Payment } from '@/lib/types';
import { getPayment } from '@/lib/api';
import StateVisualization from './StateVisualization';
import PaymentDetails from './PaymentDetails';
import { Loader2 } from 'lucide-react';

interface PaymentTrackerProps {
  paymentId: string;
  compact?: boolean;
}

export default function PaymentTracker({ paymentId, compact = false }: PaymentTrackerProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let interval: NodeJS.Timeout;

    const fetchPayment = async () => {
      try {
        const data = await getPayment(paymentId);
        setPayment(data);
        setError(null);
        setLastUpdated(new Date());

        // Stop polling if payment is completed or failed
        if (data.status === 'COMPLETED' || data.status === 'FAILED') {
          clearInterval(interval);
        }
      } catch (err: unknown) {
        if (err && typeof err === 'object' && 'message' in err) {
          setError(err.message as string);
        } else {
          setError('Failed to fetch payment details');
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    fetchPayment();

    // Poll every 3 seconds
    interval = setInterval(fetchPayment, 3000);

    return () => clearInterval(interval);
  }, [paymentId]);

  if (loading) {
    return (
      <Card>
        <CardContent className={compact ? "flex items-center justify-center p-4" : "flex items-center justify-center p-8"}>
          <Loader2 className={compact ? "h-5 w-5 animate-spin text-muted-foreground" : "h-8 w-8 animate-spin text-muted-foreground"} />
          <span className={compact ? "ml-2 text-sm text-muted-foreground" : "ml-2 text-muted-foreground"}>Loading...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className={compact ? "text-sm" : ""}>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!payment) {
    return null;
  }

  // Compact view for multi-payment grid
  if (compact) {
    return (
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono">
            {payment.payment_id.substring(0, 8)}...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <StateVisualization payment={payment} compact />
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold text-gray-900">
              {payment.currency} {(payment.amount / 100).toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">
              Updated {new Date().toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full view for single payment tracking
  return (
    <div className="space-y-6">
      {/* State Machine Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Progress</CardTitle>
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <StateVisualization payment={payment} />
        </CardContent>
      </Card>

      {/* Payment Details */}
      <PaymentDetails payment={payment} />
    </div>
  );
}
