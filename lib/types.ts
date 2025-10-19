// TypeScript interfaces for API data structures

export interface QuoteRequest {
  from_currency: string;
  to_currency: string;
  amount: number; // in cents
}

export interface Fees {
  platform_fee: number;
  onramp_fee: number;
  offramp_fee: number;
  total_fees: number;
  currency: string;
}

export interface Quote {
  quote_id: string;
  amount: number;
  currency: string;
  exchange_rate: number;
  fees: Fees;
  guaranteed_payout: number;
  payout_currency: string;
  expires_at: string;
  valid_for_seconds: number;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  source_account: string;
  destination_account: string;
  quote_id: string;
}

export interface PaymentResponse {
  payment_id: string;
  status: PaymentStatus;
  message: string;
}

export type PaymentStatus =
  | 'PENDING'
  | 'ONRAMP_PENDING'
  | 'ONRAMP_COMPLETE'
  | 'OFFRAMP_PENDING'
  | 'COMPLETED'
  | 'FAILED';

export interface StateTransition {
  from_status: PaymentStatus;
  to_status: PaymentStatus;
  timestamp: string;
  message?: string;
}

export interface Payment {
  payment_id: string;
  idempotency_key: string;
  quote_id?: string;
  amount: number;
  currency: string;
  source_account: string;
  destination_account: string;
  status: PaymentStatus;
  fee_amount: number;
  fee_currency: string;
  guaranteed_payout_amount?: number;
  state_history?: StateTransition[];
  on_ramp_tx_id?: string;
  on_ramp_poll_count?: number;
  off_ramp_tx_id?: string;
  off_ramp_poll_count?: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface APIError {
  error: string;
  message: string;
}

// AI Fee Engine Types
export interface FeeCalculationRequest {
  amount: number;
  from_currency: string;
  to_currency: string;
  destination_country: string;
  priority: 'standard' | 'express';
  customer_tier: 'retail' | 'business' | 'enterprise';
}

export interface ProviderRecommendation {
  onramp: string;
  offramp: string;
  chain?: string;
  reasoning: string;
}

export interface FeeBreakdown {
  platform_fee: number;
  onramp_fee: number;
  offramp_fee: number;
  volatility_premium: number;
  risk_premium?: number;
}

export interface FeeCalculationResponse {
  total_fee: number;
  fee_breakdown: FeeBreakdown;
  recommended_provider: ProviderRecommendation;
  fee_explanation: string;
  estimated_settlement_time: string;
  confidence_score: number;
  risk_factors?: string[];
}
