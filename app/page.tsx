'use client';

import { useState } from 'react';
import SimplifiedTransferFlow from './components/SimplifiedTransferFlow';
import PaymentTracker from './components/PaymentTracker';
import PaymentHistory from './components/PaymentHistory';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Home() {
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // When tracking a payment
  if (currentPaymentId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PayFlow
            </h1>
            <button
              onClick={() => setCurrentPaymentId(null)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              ← New transfer
            </button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <PaymentTracker paymentId={currentPaymentId} />
        </main>
      </div>
    );
  }

  // Main transfer page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Clean header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PayFlow
              </h1>
              <p className="text-sm text-gray-600">Send money globally, instantly</p>
            </div>
            <button
              onClick={() => setShowHistory(true)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              History
            </button>
          </div>
        </div>
      </header>

      {/* Main content - centered, prominent */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Value proposition */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Send money anywhere, instantly
            </h2>
            <p className="text-lg text-gray-600">
              90% cheaper than banks • Arrives in minutes • AI-optimized routing
            </p>
          </div>

          {/* Main transfer card */}
          <SimplifiedTransferFlow
            onTransferComplete={(paymentId) => setCurrentPaymentId(paymentId)}
          />

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Instant settlement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              <span>Global coverage</span>
            </div>
          </div>

          {/* Comparison section */}
          <div className="mt-16 pt-16 border-t">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
              Why PayFlow?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <ComparisonCard
                icon="💰"
                label="Cost"
                traditional="$45 (4.5%)"
                payflow="$12 (1.2%)"
                savings="73% cheaper"
              />
              <ComparisonCard
                icon="⚡"
                label="Speed"
                traditional="3-5 days"
                payflow="3-5 minutes"
                savings="99.9% faster"
              />
              <ComparisonCard
                icon="📊"
                label="Transparency"
                traditional="Hidden fees"
                payflow="Full breakdown"
                savings="100% clear"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer - minimal */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-500">
            © 2025 PayFlow • Powered by stablecoin rails
          </p>
        </div>
      </footer>

      {/* History Modal */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
          </DialogHeader>
          <PaymentHistory onSelectPayment={(paymentId) => {
            setCurrentPaymentId(paymentId);
            setShowHistory(false);
          }} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Comparison Card Component
function ComparisonCard({
  icon,
  label,
  traditional,
  payflow,
  savings,
}: {
  icon: string;
  label: string;
  traditional: string;
  payflow: string;
  savings: string;
}) {
  return (
    <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="text-3xl mb-4 text-center">{icon}</div>
      <h4 className="font-semibold text-gray-900 text-center mb-4">{label}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Traditional:</span>
          <span className="text-gray-700 font-medium">{traditional}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">PayFlow:</span>
          <span className="text-green-700 font-semibold">{payflow}</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t text-center">
        <span className="text-sm font-bold text-green-600">{savings}</span>
      </div>
    </div>
  );
}
