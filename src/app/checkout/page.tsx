'use client';

import React, { Suspense } from 'react';
import CheckoutView from '../../views/user/Checkout';
import AppLayout from '../../layouts/user/AppLayout';
import CheckoutSkeleton from '../../components/user/loadingSkeleton/CheckoutSkeleton';

export default function CheckoutPage() {
  return (
    <AppLayout>
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutView />
      </Suspense>
    </AppLayout>
  );
}
