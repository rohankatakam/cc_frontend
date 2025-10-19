'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Quote } from '@/lib/types';
import { formatCurrency, calculateTimeRemaining } from '@/lib/utils';
import { Clock, TrendingUp } from 'lucide-react';

interface QuoteDisplayProps {
  quote: Quote;
  onExpired?: () => void;
}

export default function QuoteDisplay({ quote, onExpired }: QuoteDisplayProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    calculateTimeRemaining(quote.expires_at)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(quote.expires_at);
      setTimeRemaining(remaining);

      if (remaining === 0 && onExpired) {
        onExpired();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [quote.expires_at, onExpired]);

  const isExpired = timeRemaining === 0;
  const progressPercent = (timeRemaining / quote.valid_for_seconds) * 100;

  return (
    <Card className={isExpired ? 'opacity-60' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Quote Details</CardTitle>
          <Badge variant={isExpired ? 'destructive' : 'default'}>
            {isExpired ? 'Expired' : 'Active'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expiry Timer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Time Remaining</span>
            </div>
            <span className={`font-mono ${isExpired ? 'text-red-500' : 'text-blue-600'}`}>
              {timeRemaining}s
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Exchange Rate */}
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Exchange Rate</span>
          </div>
          <span className="font-mono font-semibold">
            1 {quote.currency} = {quote.exchange_rate.toFixed(4)} {quote.payout_currency}
          </span>
        </div>

        {/* Fee Breakdown */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Fee Breakdown</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee</span>
              <span className="font-mono">
                {formatCurrency(quote.fees.platform_fee, quote.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">On-ramp Fee</span>
              <span className="font-mono">
                {formatCurrency(quote.fees.onramp_fee, quote.currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Off-ramp Fee</span>
              <span className="font-mono">
                {formatCurrency(quote.fees.offramp_fee, quote.currency)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t">
              <span className="font-medium">Total Fees</span>
              <span className="font-mono font-semibold">
                {formatCurrency(quote.fees.total_fees, quote.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Guaranteed Payout */}
        <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              Guaranteed Payout
            </span>
            <span className="text-xl font-bold text-green-700 dark:text-green-300">
              {formatCurrency(quote.guaranteed_payout, quote.payout_currency)}
            </span>
          </div>
        </div>

        {/* Quote ID */}
        <div className="text-xs text-muted-foreground">
          <span>Quote ID: </span>
          <span className="font-mono">{quote.quote_id}</span>
        </div>
      </CardContent>
    </Card>
  );
}
