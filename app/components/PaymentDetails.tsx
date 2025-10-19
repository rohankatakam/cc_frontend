'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Payment } from '@/lib/types';
import { formatCurrency, formatLocalTime, calculateProcessingTime } from '@/lib/utils';
import { Copy, Check } from 'lucide-react';

interface PaymentDetailsProps {
  payment: Payment;
}

export default function PaymentDetails({ payment }: PaymentDetailsProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const DetailRow = ({
    label,
    value,
    copyable = false,
    field,
  }: {
    label: string;
    value: string | number;
    copyable?: boolean;
    field?: string;
  }) => (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-mono">{value}</span>
        {copyable && field && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => handleCopy(value.toString(), field)}
          >
            {copiedField === field ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Information */}
        <div>
          <h4 className="font-medium text-sm mb-2">Basic Information</h4>
          <div className="space-y-1">
            <DetailRow
              label="Payment ID"
              value={payment.payment_id}
              copyable
              field="payment_id"
            />
            {payment.quote_id && (
              <DetailRow
                label="Quote ID"
                value={payment.quote_id}
                copyable
                field="quote_id"
              />
            )}
            <DetailRow
              label="Amount"
              value={formatCurrency(payment.amount, payment.currency)}
            />
            <DetailRow label="Source Account" value={payment.source_account} />
            <DetailRow
              label="Destination Account"
              value={payment.destination_account}
            />
          </div>
        </div>

        {/* Transaction Information */}
        <div>
          <h4 className="font-medium text-sm mb-2">Transaction Information</h4>
          <div className="space-y-1">
            {payment.on_ramp_tx_id ? (
              <DetailRow
                label="On-ramp Transaction ID"
                value={payment.on_ramp_tx_id}
                copyable
                field="onramp_tx"
              />
            ) : (
              <DetailRow label="On-ramp Transaction ID" value="Pending..." />
            )}

            {payment.off_ramp_tx_id ? (
              <DetailRow
                label="Off-ramp Transaction ID"
                value={payment.off_ramp_tx_id}
                copyable
                field="offramp_tx"
              />
            ) : (
              <DetailRow label="Off-ramp Transaction ID" value="Pending..." />
            )}
          </div>
        </div>

        {/* Processing Information */}
        <div>
          <h4 className="font-medium text-sm mb-2">Processing Information</h4>
          <div className="space-y-1">
            {payment.on_ramp_poll_count !== undefined && (
              <DetailRow
                label="On-ramp Poll Count"
                value={payment.on_ramp_poll_count}
              />
            )}
            {payment.off_ramp_poll_count !== undefined && (
              <DetailRow
                label="Off-ramp Poll Count"
                value={payment.off_ramp_poll_count}
              />
            )}
            <DetailRow
              label="Total Processing Time"
              value={calculateProcessingTime(
                payment.created_at,
                payment.processed_at
              )}
            />
          </div>
        </div>

        {/* Timestamps */}
        <div>
          <h4 className="font-medium text-sm mb-2">Timestamps</h4>
          <div className="space-y-1">
            <DetailRow label="Created At" value={formatLocalTime(payment.created_at)} />
            <DetailRow label="Updated At" value={formatLocalTime(payment.updated_at)} />
            {payment.processed_at && (
              <DetailRow
                label="Processed At"
                value={formatLocalTime(payment.processed_at)}
              />
            )}
          </div>
        </div>

        {/* State Transitions */}
        {payment.state_history && payment.state_history.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">State Transition History</h4>
            <div className="space-y-2">
              {payment.state_history.map((transition, index) => (
                <div
                  key={index}
                  className="text-xs p-2 bg-muted rounded flex justify-between items-center"
                >
                  <span>
                    <span className="font-semibold">{transition.from_status}</span>
                    {' → '}
                    <span className="font-semibold">{transition.to_status}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {formatLocalTime(transition.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
