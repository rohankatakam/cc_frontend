// API Client for backend communication

import {
  Quote,
  QuoteRequest,
  Payment,
  PaymentRequest,
  PaymentResponse,
  APIError,
  FeeCalculationRequest,
  FeeCalculationResponse,
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        error: data.error || 'API_ERROR',
        message: data.message || 'An error occurred',
        status: response.status,
      } as APIError & { status: number };
    }

    return data as T;
  } catch (error) {
    if (error && typeof error === 'object' && 'error' in error) {
      throw error;
    }
    throw {
      error: 'NETWORK_ERROR',
      message: 'Failed to connect to the API',
    } as APIError;
  }
}

// Quote API
export async function createQuote(request: QuoteRequest): Promise<Quote> {
  return apiCall<Quote>('/quotes', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Payment API
export async function createPayment(
  request: PaymentRequest,
  idempotencyKey?: string
): Promise<PaymentResponse> {
  const headers: HeadersInit = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  return apiCall<PaymentResponse>('/payments', {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
}

export async function getPayment(paymentId: string): Promise<Payment> {
  return apiCall<Payment>(`/payments/${paymentId}`, {
    method: 'GET',
  });
}

export async function listPayments(paymentIds: string[]): Promise<Payment[]> {
  // Fetch payments in parallel
  const promises = paymentIds.map((id) => getPayment(id));
  const results = await Promise.allSettled(promises);

  // Filter successful results
  return results
    .filter((result) => result.status === 'fulfilled')
    .map((result) => (result as PromiseFulfilledResult<Payment>).value);
}

// AI Fee Engine API
export async function calculateFees(
  request: FeeCalculationRequest
): Promise<FeeCalculationResponse> {
  return apiCall<FeeCalculationResponse>('/fees/calculate', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Storage helpers for payment history
export function getStoredPaymentIds(): string[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem('payment_history');
  return stored ? JSON.parse(stored) : [];
}

export function storePaymentId(paymentId: string): void {
  if (typeof window === 'undefined') return;

  const existing = getStoredPaymentIds();
  if (!existing.includes(paymentId)) {
    existing.unshift(paymentId); // Add to beginning
    localStorage.setItem('payment_history', JSON.stringify(existing));
  }
}

export function clearPaymentHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('payment_history');
}
