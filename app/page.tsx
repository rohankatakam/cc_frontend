'use client';

import { useState, useEffect } from 'react';
import SimplifiedTransferFlow from './components/SimplifiedTransferFlow';
import PaymentTracker from './components/PaymentTracker';
import PaymentTable from './components/PaymentTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getStoredPaymentIds } from '@/lib/api';

export default function Home() {
  const [paymentIds, setPaymentIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showNewTransferModal, setShowNewTransferModal] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);

    // Reactive payment ID list - updates every 2 seconds
    const refreshPaymentIds = () => {
      setPaymentIds(getStoredPaymentIds());
    };

    refreshPaymentIds();
    const interval = setInterval(refreshPaymentIds, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  const hasAnyPayments = paymentIds.length > 0;

  // Show transfer form if no payments exist
  if (!hasAnyPayments && !showNewTransferModal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Infinite Transfer
          </h1>
          <SimplifiedTransferFlow
            onTransferComplete={(paymentId) => {
              setSelectedPaymentId(paymentId);
            }}
          />
        </div>
      </div>
    );
  }

  // Single-page dashboard with table
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <PaymentTable
          paymentIds={paymentIds}
          onSelectPayment={(id) => setSelectedPaymentId(id)}
          onNewTransfer={() => setShowNewTransferModal(true)}
        />

        {/* New Transfer Modal */}
        <Dialog open={showNewTransferModal} onOpenChange={setShowNewTransferModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Transfer</DialogTitle>
            </DialogHeader>
            <SimplifiedTransferFlow
              onTransferComplete={(paymentId) => {
                setShowNewTransferModal(false);
                setSelectedPaymentId(paymentId);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Payment Details Modal */}
        <Dialog open={!!selectedPaymentId} onOpenChange={(open) => !open && setSelectedPaymentId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Payment Details</DialogTitle>
            </DialogHeader>
            {selectedPaymentId && <PaymentTracker paymentId={selectedPaymentId} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
