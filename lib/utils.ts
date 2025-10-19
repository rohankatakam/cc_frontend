import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format cents to currency string
export function formatCurrency(amountInCents: number, currency: string): string {
  const amount = amountInCents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Parse currency string to cents
export function parseCurrencyToCents(value: string): number {
  const cleaned = value.replace(/[^0-9.]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

// Format timestamp to relative time
export function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

// Format timestamp to local time
export function formatLocalTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString();
}

// Calculate time remaining until expiration
export function calculateTimeRemaining(expiresAt: string): number {
  const expirationTime = new Date(expiresAt).getTime();
  const now = new Date().getTime();
  const remainingSeconds = Math.floor((expirationTime - now) / 1000);
  return Math.max(0, remainingSeconds);
}

// Generate UUID v4
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Calculate total processing time
export function calculateProcessingTime(createdAt: string, completedAt?: string): string {
  const start = new Date(createdAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : new Date().getTime();
  const diffInSeconds = Math.floor((end - start) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s`;
  } else {
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }
}

// Get status color for badges
export function getStatusColor(
  status: string
): 'gray' | 'blue' | 'yellow' | 'green' | 'red' {
  switch (status) {
    case 'PENDING':
      return 'gray';
    case 'ONRAMP_PENDING':
    case 'OFFRAMP_PENDING':
      return 'blue';
    case 'ONRAMP_COMPLETE':
      return 'yellow';
    case 'COMPLETED':
      return 'green';
    case 'FAILED':
      return 'red';
    default:
      return 'gray';
  }
}
