'use client';

import { useState } from 'react';
import { Quote } from '@/lib/types';
import QuoteForm from './components/QuoteForm';
import QuoteDisplay from './components/QuoteDisplay';
import PaymentForm from './components/PaymentForm';
import PaymentTracker from './components/PaymentTracker';
import PaymentHistory from './components/PaymentHistory';

export default function Home() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const handleQuoteCreated = (quote: Quote) => {
    setCurrentQuote(quote);
    setShowPaymentForm(true);
    setCurrentPaymentId(null);
  };

  const handleQuoteExpired = () => {
    setCurrentQuote(null);
    setShowPaymentForm(false);
  };

  const handlePaymentCreated = (paymentId: string) => {
    setCurrentPaymentId(paymentId);
    setShowPaymentForm(false);
  };

  const handleSelectPayment = (paymentId: string) => {
    setCurrentPaymentId(paymentId);
    setCurrentQuote(null);
    setShowPaymentForm(false);
  };

  const handleNewQuote = () => {
    setCurrentQuote(null);
    setCurrentPaymentId(null);
    setShowPaymentForm(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Crypto Payment Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Real-time payment processing with guaranteed exchange rates
              </p>
            </div>
            {(currentQuote || currentPaymentId) && (
              <button
                onClick={handleNewQuote}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                + New Quote
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Quote and Payment Forms */}
          <div className="lg:col-span-1 space-y-6">
            {!currentPaymentId && (
              <>
                <QuoteForm onQuoteCreated={handleQuoteCreated} />

                {currentQuote && (
                  <QuoteDisplay quote={currentQuote} onExpired={handleQuoteExpired} />
                )}

                {currentQuote && showPaymentForm && (
                  <PaymentForm
                    quote={currentQuote}
                    onPaymentCreated={handlePaymentCreated}
                  />
                )}
              </>
            )}

            <PaymentHistory onSelectPayment={handleSelectPayment} />
          </div>

          {/* Right Column - Payment Tracker */}
          <div className="lg:col-span-2">
            {currentPaymentId ? (
              <PaymentTracker paymentId={currentPaymentId} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-lg">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg font-medium mb-2">No Active Payment</p>
                  <p className="text-sm">
                    Create a quote and submit a payment to see real-time tracking
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Powered by AWS Lambda, DynamoDB, and SQS</p>
            <p>API: {process.env.NEXT_PUBLIC_API_URL}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
