'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Quote, PaymentRequest } from '@/lib/types';
import { createPayment, storePaymentId } from '@/lib/api';
import { generateUUID } from '@/lib/utils';
import { Loader2, Copy, Check } from 'lucide-react';

interface PaymentFormProps {
  quote: Quote;
  onPaymentCreated: (paymentId: string) => void;
}

export default function PaymentForm({ quote, onPaymentCreated }: PaymentFormProps) {
  const [sourceAccount, setSourceAccount] = useState('user_12345');
  const [destinationAccount, setDestinationAccount] = useState('merchant_67890');
  const [idempotencyKey] = useState(generateUUID());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyIdempotencyKey = () => {
    navigator.clipboard.writeText(idempotencyKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!sourceAccount.trim() || !destinationAccount.trim()) {
        throw new Error('Source and destination accounts are required');
      }

      const request: PaymentRequest = {
        amount: quote.amount,
        currency: quote.currency,
        source_account: sourceAccount,
        destination_account: destinationAccount,
        quote_id: quote.quote_id,
      };

      const response = await createPayment(request, idempotencyKey);

      // Store payment ID in localStorage for history
      storePaymentId(response.payment_id);

      // Notify parent component
      onPaymentCreated(response.payment_id);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Failed to create payment. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Payment</CardTitle>
        <CardDescription>
          Submit payment using the locked quote above
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="source-account">Source Account</Label>
            <Input
              id="source-account"
              type="text"
              placeholder="user_12345"
              value={sourceAccount}
              onChange={(e) => setSourceAccount(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination-account">Destination Account</Label>
            <Input
              id="destination-account"
              type="text"
              placeholder="merchant_67890"
              value={destinationAccount}
              onChange={(e) => setDestinationAccount(e.target.value)}
            />
          </div>

          {/* Idempotency Key Display */}
          <div className="space-y-2">
            <Label>Idempotency Key</Label>
            <div className="flex gap-2">
              <Input
                value={idempotencyKey}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopyIdempotencyKey}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Auto-generated UUID for request deduplication
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Payment
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
