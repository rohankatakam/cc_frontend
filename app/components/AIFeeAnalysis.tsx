'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FeeCalculationResponse } from '@/lib/types';
import { calculateFees } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Sparkles, Loader2, TrendingUp, AlertTriangle, Clock, Network } from 'lucide-react';

interface AIFeeAnalysisProps {
  amount: number; // in cents
  fromCurrency: string;
  toCurrency: string;
  standardFees?: number; // Standard fee from quote (optional)
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUseAnalysis?: (analysis: FeeCalculationResponse) => void;
}

export default function AIFeeAnalysis({
  amount,
  fromCurrency,
  toCurrency,
  standardFees,
  open,
  onOpenChange,
  onUseAnalysis,
}: AIFeeAnalysisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FeeCalculationResponse | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await calculateFees({
        amount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
        destination_country: getCountryFromCurrency(toCurrency),
        priority: 'standard',
        customer_tier: 'enterprise',
      });

      setAnalysis(response);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string);
      } else {
        setError('Failed to analyze fees. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze when modal opens
  React.useEffect(() => {
    if (open && !analysis && !loading) {
      handleAnalyze();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI-Powered Fee Analysis
          </DialogTitle>
          <DialogDescription>
            Intelligent routing and fee optimization using Claude AI
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-purple-500 mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing market conditions...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && !loading && (
          <div className="space-y-6">
            {/* Comparison View - Show only if we have standard fees */}
            {standardFees && standardFees > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 p-6 rounded-lg border-2 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Cost Savings Analysis</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Standard Routing</p>
                    <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                      {formatCurrency(standardFees, fromCurrency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((standardFees / amount) * 100).toFixed(2)}% fee
                    </p>
                  </div>
                  <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border-2 border-green-500">
                    <p className="text-sm text-muted-foreground mb-1">AI-Optimized ✨</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(analysis.total_fee, fromCurrency)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {((analysis.total_fee / amount) * 100).toFixed(2)}% fee
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">You Save:</span>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(standardFees - analysis.total_fee, fromCurrency)}
                      </span>
                      <span className="text-sm text-green-600 ml-2">
                        ({(((standardFees - analysis.total_fee) / standardFees) * 100).toFixed(1)}% less)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Total Fee Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">AI-Optimized Total Fee</p>
                  <p className="text-3xl font-bold">{formatCurrency(analysis.total_fee, fromCurrency)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((analysis.total_fee / amount) * 100).toFixed(2)}% of transaction
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Confidence</p>
                  <p className="text-2xl font-bold text-green-600">
                    {(analysis.confidence_score * 100).toFixed(0)}%
                  </p>
                  <Progress value={analysis.confidence_score * 100} className="mt-2 w-24" />
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Fee Breakdown
              </h3>
              <div className="space-y-2">
                <FeeItem
                  label="Platform Fee"
                  amount={analysis.fee_breakdown.platform_fee}
                  currency={fromCurrency}
                />
                <FeeItem
                  label="On-ramp Fee"
                  amount={analysis.fee_breakdown.onramp_fee}
                  currency={fromCurrency}
                />
                <FeeItem
                  label="Off-ramp Fee"
                  amount={analysis.fee_breakdown.offramp_fee}
                  currency={fromCurrency}
                />
                {analysis.fee_breakdown.volatility_premium !== undefined && (
                  <FeeItem
                    label="Volatility Premium"
                    amount={analysis.fee_breakdown.volatility_premium}
                    currency={fromCurrency}
                    highlight
                  />
                )}
                {analysis.fee_breakdown.risk_premium && analysis.fee_breakdown.risk_premium > 0 && (
                  <FeeItem
                    label="Risk Premium"
                    amount={analysis.fee_breakdown.risk_premium}
                    currency={fromCurrency}
                  />
                )}
              </div>
            </div>

            {/* Provider Recommendation */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Network className="h-4 w-4" />
                Recommended Routing
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">On-ramp Provider</span>
                  <Badge variant="secondary">{analysis.recommended_provider.onramp}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Off-ramp Provider</span>
                  <Badge variant="secondary">{analysis.recommended_provider.offramp}</Badge>
                </div>
                {analysis.recommended_provider.chain && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Blockchain</span>
                    <Badge variant="outline">{analysis.recommended_provider.chain}</Badge>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground italic">
                    {analysis.recommended_provider.reasoning}
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Explanation */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">AI Explanation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {analysis.fee_explanation}
              </p>
            </div>

            {/* Estimated Settlement Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Estimated settlement:</span>
              <span className="font-medium">{analysis.estimated_settlement_time}</span>
            </div>

            {/* Risk Factors */}
            {analysis.risk_factors && analysis.risk_factors.length > 0 && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Risk Factors
                </h3>
                <div className="space-y-2">
                  {analysis.risk_factors.map((factor, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      <span className="text-sm text-muted-foreground">{factor}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                onClick={() => {
                  if (onUseAnalysis) {
                    onUseAnalysis(analysis);
                  }
                  onOpenChange(false);
                }}
                className="flex-1"
              >
                {standardFees && standardFees > 0 ? 'Apply AI Optimization' : 'Use This Analysis'}
              </Button>
              <Button variant="outline" onClick={handleAnalyze} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Re-analyze
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Helper component for fee items
function FeeItem({
  label,
  amount,
  currency,
  highlight = false,
}: {
  label: string;
  amount: number;
  currency: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between p-2 rounded ${highlight ? 'bg-yellow-50 dark:bg-yellow-950' : ''}`}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-yellow-700 dark:text-yellow-300' : ''}`}>
        {formatCurrency(amount, currency)}
      </span>
    </div>
  );
}

// Helper to get country from currency (simplified)
function getCountryFromCurrency(currency: string): string {
  const currencyToCountry: Record<string, string> = {
    USD: 'USA',
    EUR: 'Germany',
    GBP: 'UK',
    BRL: 'Brazil',
  };
  return currencyToCountry[currency] || 'USA';
}
