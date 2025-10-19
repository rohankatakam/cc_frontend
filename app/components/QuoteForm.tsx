'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Quote, QuoteRequest } from '@/lib/types';
import { createQuote } from '@/lib/api';
import { parseCurrencyToCents } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'BRL'];

interface QuoteFormProps {
  onQuoteCreated: (quote: Quote) => void;
}

export default function QuoteForm({ onQuoteCreated }: QuoteFormProps) {
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [amountInput, setAmountInput] = useState('1000.00');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const amountInCents = parseCurrencyToCents(amountInput);

      if (amountInCents <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      if (fromCurrency === toCurrency) {
        throw new Error('From and To currencies must be different');
      }

      const request: QuoteRequest = {
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: amountInCents,
      };

      const quote = await createQuote(request);
      onQuoteCreated(quote);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Failed to create quote. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Quote</CardTitle>
        <CardDescription>
          Lock in an exchange rate for 60 seconds with guaranteed payout
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-currency">From Currency</Label>
              <Select value={fromCurrency} onValueChange={setFromCurrency}>
                <SelectTrigger id="from-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to-currency">To Currency</Label>
              <Select value={toCurrency} onValueChange={setToCurrency}>
                <SelectTrigger id="to-currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({fromCurrency})</Label>
            <Input
              id="amount"
              type="text"
              placeholder="1000.00"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Quote
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
