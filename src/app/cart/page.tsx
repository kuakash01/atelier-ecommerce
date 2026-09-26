'use client';

import React, { Suspense } from 'react';
import CartView from '../../views/user/Cart';
import AppLayout from '../../layouts/user/AppLayout';
import CartSkeleton from '../../components/user/loadingSkeleton/CartSkeleton';

export default function CartPage() {
  return (
    <AppLayout>
      <Suspense fallback={<CartSkeleton />}>
        <CartView />
      </Suspense>
    </AppLayout>
  );
}
