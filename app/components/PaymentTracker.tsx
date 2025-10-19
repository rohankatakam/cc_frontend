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
}

export default function PaymentTracker({ paymentId }: PaymentTrackerProps) {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line prefer-const
    let interval: NodeJS.Timeout;

    const fetchPayment = async () => {
      try {
        const data = await getPayment(paymentId);
        setPayment(data);
        setError(null);
        setPollCount((prev) => prev + 1);

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
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading payment...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* State Machine Visualization */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment Progress</CardTitle>
            <div className="text-sm text-muted-foreground">
              Poll count: {pollCount}
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
