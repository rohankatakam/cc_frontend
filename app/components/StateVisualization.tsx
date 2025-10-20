'use client';

import { Payment, PaymentStatus } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Loader2, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StateVisualizationProps {
  payment: Payment;
}

const STATES: PaymentStatus[] = [
  'PENDING',
  'ONRAMP_PENDING',
  'OFFRAMP_PENDING',
  'COMPLETED',
];

const STATE_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Initiated',
  ONRAMP_PENDING: 'Converting USD → USDC',
  ONRAMP_COMPLETE: 'On-ramp Complete', // Keep for backend compatibility
  OFFRAMP_PENDING: 'Converting USDC → EUR',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
};

export default function StateVisualization({ payment }: StateVisualizationProps) {
  // Map ONRAMP_COMPLETE to OFFRAMP_PENDING for simplified UI (backend still uses 5 states)
  const displayStatus = payment.status === 'ONRAMP_COMPLETE' ? 'OFFRAMP_PENDING' : payment.status;
  const currentStateIndex = STATES.indexOf(displayStatus);
  const isFailed = payment.status === 'FAILED';

  const getStateIcon = (state: PaymentStatus, index: number) => {
    if (isFailed && state === payment.status) {
      return <XCircle className="h-8 w-8 text-red-500" />;
    }

    if (index < currentStateIndex) {
      // Completed state
      return <CheckCircle2 className="h-8 w-8 text-green-500" />;
    } else if (index === currentStateIndex) {
      // Current state - show checkmark if COMPLETED, otherwise loading
      if (payment.status === 'COMPLETED') {
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      }
      return <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />;
    } else {
      // Pending state
      return <Circle className="h-8 w-8 text-gray-300" />;
    }
  };

  const getStateColor = (state: PaymentStatus, index: number) => {
    if (isFailed && state === payment.status) {
      return 'text-red-700 dark:text-red-400';
    }

    if (index < currentStateIndex) {
      return 'text-green-700 dark:text-green-400';
    } else if (index === currentStateIndex) {
      return 'text-blue-700 dark:text-blue-400';
    } else {
      return 'text-gray-400 dark:text-gray-600';
    }
  };

  const getTransitionTime = (state: PaymentStatus) => {
    if (!payment.state_history || payment.state_history.length === 0) {
      return null;
    }
    const transition = payment.state_history.find((t) => t.to_status === state);
    if (transition) {
      return new Date(transition.timestamp).toLocaleTimeString();
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* State Flow Diagram */}
      <div className="flex items-center justify-between gap-2 mb-8 px-4">
        {STATES.map((state, index) => (
          <div key={state} className="flex items-center flex-1">
            {/* State Node */}
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'mb-2 transition-all',
                  index === currentStateIndex && 'scale-110'
                )}
              >
                {getStateIcon(state, index)}
              </div>
              <div className={cn('text-xs font-medium text-center', getStateColor(state, index))}>
                {STATE_LABELS[state]}
              </div>
              {getTransitionTime(state) && (
                <div className="text-xs text-muted-foreground mt-1">
                  {getTransitionTime(state)}
                </div>
              )}
            </div>

            {/* Arrow between states */}
            {index < STATES.length - 1 && (
              <ArrowRight
                className={cn(
                  'h-6 w-6 mx-2 flex-shrink-0',
                  index < currentStateIndex ? 'text-green-500' : 'text-gray-300'
                )}
              />
            )}
          </div>
        ))}
      </div>

      {/* Current Status Badge */}
      <div className="flex justify-center">
        <Badge
          variant={
            isFailed
              ? 'destructive'
              : payment.status === 'COMPLETED'
              ? 'default'
              : 'secondary'
          }
          className="text-sm px-4 py-2"
        >
          Current Status: {STATE_LABELS[displayStatus]}
        </Badge>
      </div>
    </div>
  );
}
