'use client';

import React, { Suspense } from 'react';
import ShopView from '../../views/user/Shop';
import AppLayout from '../../layouts/user/AppLayout';
import ShopSkeleton from '../../components/user/loadingSkeleton/ShopSkeleton';

export default function CategoryShopPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ShopSkeleton />}>
        <ShopView />
      </Suspense>
    </AppLayout>
  );
}
