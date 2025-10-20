'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, Clock, Shield, Info, Loader2, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { createQuote, createPayment, calculateFees, storePaymentId } from '@/lib/api';
import type { FeeCalculationResponse } from '@/lib/types';

interface SimplifiedTransferFlowProps {
  onTransferComplete: (paymentId: string) => void;
}

export default function SimplifiedTransferFlow({
  onTransferComplete
}: SimplifiedTransferFlowProps) {
  // State - Fixed to USD → EUR
  const [sendAmount, setSendAmount] = useState('1000.00');
  const fromCurrency = 'USD'; // Fixed
  const toCurrency = 'EUR'; // Fixed
  const [aiOptimization, setAIOptimization] = useState<FeeCalculationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [optimizationLoading, setOptimizationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch AI optimization with debounce
  useEffect(() => {
    const amountCents = parseCurrencyToCents(sendAmount);
    if (amountCents > 0) {
      setOptimizationLoading(true);
      setError(null);

      const timer = setTimeout(async () => {
        try {
          const optimization = await calculateFees({
            amount: amountCents,
            from_currency: fromCurrency,
            to_currency: toCurrency,
            destination_country: 'Germany',
            priority: 'standard',
            customer_tier: 'retail',
          });
          setAIOptimization(optimization);
        } catch (err) {
          console.error('Failed to fetch AI optimization:', err);
          setAIOptimization(null);
        } finally {
          setOptimizationLoading(false);
        }
      }, 800); // 800ms debounce

      return () => clearTimeout(timer);
    }
  }, [sendAmount]);

  // Calculate recipient amount (always use latest optimization data, don't hide during loading)
  const recipientAmount = aiOptimization
    ? calculateRecipientAmount(parseCurrencyToCents(sendAmount), aiOptimization)
    : null;

  // Handle send
  const handleSend = async () => {
    setLoading(true);
    setError(null);

    try {
      const amountCents = parseCurrencyToCents(sendAmount);

      if (amountCents <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // 1. Create quote
      const quote = await createQuote({
        from_currency: fromCurrency,
        to_currency: toCurrency,
        amount: amountCents,
      });

      // 2. Create payment with idempotency
      const idempotencyKey = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // IMPORTANT: Payment amount must match the original quote amount (in USD), not the payout
      const payment = await createPayment(
        {
          quote_id: quote.quote_id,
          amount: quote.amount, // Use original quote amount, not guaranteed_payout
          currency: quote.currency, // Use original quote currency (USD)
          source_account: 'user_default',
          destination_account: 'recipient_default',
        },
        idempotencyKey
      );

      // 3. Store payment ID in localStorage for history
      storePaymentId(payment.payment_id);

      // 4. Navigate to tracking
      onTransferComplete(payment.payment_id);
    } catch (err: unknown) {
      console.error('Transfer failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transfer failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <Card className="shadow-2xl border-0 bg-white overflow-hidden">
        <div className="p-6 md:p-8 space-y-5">
          {/* Section 1: You send */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              You send exactly
            </label>

            <div className="relative">
              <div className="flex items-center gap-3 p-4 md:p-5 border-2 border-gray-200 rounded-xl hover:border-blue-300 focus-within:border-blue-500 transition-colors bg-white">
                <Input
                  type="text"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  placeholder="1,000.00"
                  className="flex-1 text-3xl md:text-4xl font-bold outline-none border-0 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-2xl">🇺🇸</span>
                  <span>USD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Discount callout (for amounts over $25k) */}
          {parseCurrencyToCents(sendAmount) > 2500000 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200"
            >
              <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">
                  Sending over $25,000?
                </p>
                <p className="text-blue-700">We&apos;ll discount our fee</p>
              </div>
            </motion.div>
          )}

          {/* Arrow indicator */}
          <div className="flex justify-center py-1">
            <div className="p-2 bg-gray-100 rounded-full">
              <ArrowDown className="h-5 w-5 text-gray-600" />
            </div>
          </div>

          {/* Section 2: Recipient gets */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">
              Recipient gets
            </label>

            <div className="relative">
              <div className="flex items-center gap-3 p-4 md:p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                <div className="flex-1">
                  {recipientAmount !== null ? (
                    <motion.div
                      key={recipientAmount}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-4xl md:text-5xl font-bold ${optimizationLoading ? 'text-green-600 opacity-70' : 'text-green-700'}`}
                    >
                      {(recipientAmount / 100).toFixed(2)}
                    </motion.div>
                  ) : (
                    // Skeleton loader for recipient amount
                    <div className="h-12 md:h-14 bg-green-200 rounded-lg animate-pulse w-48"></div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <span className="text-2xl">🇪🇺</span>
                  <span>EUR</span>
                </div>
              </div>
            </div>

            {/* Exchange rate display */}
            {aiOptimization && (
              <p className="text-xs text-gray-500 text-center">
                Rate: 1 USD = {(0.858).toFixed(4)} EUR
              </p>
            )}
          </div>

          {/* Section 3: Fee breakdown (collapsible) */}
          {!aiOptimization ? (
            // Skeleton loader for fees
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
            </div>
          ) : (
            <details className="group cursor-pointer">
              <summary className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors list-none">
                <span className="flex items-center gap-2">
                  {optimizationLoading ? (
                    // Skeleton loaders for fee values during recalculation
                    <span className="flex items-center gap-2">
                      <span>Platform fee</span>
                      <span className="inline-block h-4 w-12 bg-gray-300 rounded animate-pulse"></span>
                      <span>•</span>
                      <span>Route fee</span>
                      <span className="inline-block h-4 w-12 bg-gray-300 rounded animate-pulse"></span>
                      <span>•</span>
                      <span className="font-semibold">Total</span>
                      <span className="inline-block h-4 w-12 bg-gray-400 rounded animate-pulse"></span>
                    </span>
                  ) : (
                    <span>
                      Platform fee ${(aiOptimization.fee_breakdown.platform_fee / 100).toFixed(2)} •{' '}
                      Route fee ${((aiOptimization.fee_breakdown.onramp_fee + aiOptimization.fee_breakdown.offramp_fee) / 100).toFixed(2)} •{' '}
                      <span className="font-semibold text-gray-900">
                        Total ${(aiOptimization.total_fee / 100).toFixed(2)}
                      </span>
                    </span>
                  )}
                </span>
                <svg
                  className="h-4 w-4 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>

              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-4 bg-gray-50 rounded-lg space-y-2 relative"
              >
                {/* Skeleton overlay during recalculation */}
                {optimizationLoading && (
                  <div className="absolute inset-0 bg-gray-50/95 rounded-lg p-4 z-10 space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-28"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-16"></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-20"></div>
                      <div className="h-4 bg-gray-300 rounded animate-pulse w-12"></div>
                    </div>
                    <div className="pt-2 mt-2 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-400 rounded animate-pulse w-20"></div>
                        <div className="h-4 bg-gray-400 rounded animate-pulse w-16"></div>
                      </div>
                    </div>
                  </div>
                )}

                <FeeRow
                  label="Platform fee"
                  amount={aiOptimization.fee_breakdown.platform_fee}
                />
                <FeeRow
                  label={`On-ramp (${aiOptimization.recommended_provider.onramp})`}
                  amount={aiOptimization.fee_breakdown.onramp_fee}
                />
                <FeeRow
                  label={`Off-ramp (${aiOptimization.recommended_provider.offramp})`}
                  amount={aiOptimization.fee_breakdown.offramp_fee}
                />
                <FeeRow
                  label={`Gas (${aiOptimization.recommended_provider.chain})`}
                  amount={aiOptimization.fee_breakdown.gas_cost || 0}
                  highlight={(aiOptimization.fee_breakdown.gas_cost || 0) === 0}
                />

                <div className="pt-2 mt-2 border-t border-gray-200">
                  <FeeRow
                    label="Total fees"
                    amount={aiOptimization.total_fee}
                    bold
                  />
                  {optimizationLoading ? (
                    <div className="mt-2 space-y-1">
                      <div className="h-3 bg-gray-300 rounded animate-pulse w-full"></div>
                      <div className="h-3 bg-gray-300 rounded animate-pulse w-5/6"></div>
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {aiOptimization.fee_explanation}
                    </p>
                  )}
                </div>
              </motion.div>
            </details>
          )}

          {/* Section 4: Delivery estimate */}
          {!aiOptimization ? (
            // Skeleton loader for delivery time
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-4 w-4 text-blue-300 flex-shrink-0" />
              <div className="h-4 bg-blue-200 rounded animate-pulse w-48"></div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">
              <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
              {optimizationLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 bg-blue-200 rounded animate-pulse w-44"></div>
                </div>
              ) : (
                <span>
                  Should arrive in{' '}
                  <span className="font-semibold text-blue-900">
                    {aiOptimization.estimated_settlement_time}
                  </span>
                </span>
              )}
            </div>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
            >
              {error}
            </motion.div>
          )}

          {/* Section 5: Send button */}
          <Button
            onClick={handleSend}
            disabled={loading || !aiOptimization || parseCurrencyToCents(sendAmount) <= 0}
            size="lg"
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              'Send money'
            )}
          </Button>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-green-600" />
              <span>Secured by Circle</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-purple-600" />
              <span>AI-optimized routing</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Optional: Show transaction history link below */}
      <div className="mt-6 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          View transaction history →
        </button>
      </div>
    </div>
  );
}

// Helper Components

function FeeRow({
  label,
  amount,
  bold = false,
  highlight = false,
}: {
  label: string;
  amount: number;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1 ${highlight ? 'text-green-700' : ''}`}>
      <span className={`text-sm ${bold ? 'font-semibold' : 'text-gray-600'}`}>
        {label}
      </span>
      <span className={`text-sm ${bold ? 'font-bold' : ''}`}>
        ${(amount / 100).toFixed(2)}
        {highlight && amount === 0 && (
          <span className="ml-2 text-xs font-semibold text-green-600">FREE</span>
        )}
      </span>
    </div>
  );
}

// Helper Functions

function parseCurrencyToCents(amount: string): number {
  const cleaned = amount.replace(/[^0-9.]/g, '');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
}

function calculateRecipientAmount(amountCents: number, optimization: FeeCalculationResponse): number | null {
  // Subtract fees, apply exchange rate (using fixed rate for now)
  const amountAfterFees = amountCents - optimization.total_fee;

  // Protect against negative values (can happen when using stale fee data with new amount)
  // Return null to trigger skeleton loader instead of showing negative or zero
  if (amountAfterFees < 0) {
    return null;
  }

  const exchangeRate = 0.858; // USD to EUR
  const recipientAmount = amountAfterFees * exchangeRate;
  return Math.round(recipientAmount);
}
