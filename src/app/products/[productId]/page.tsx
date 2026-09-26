'use client';

import React, { Suspense } from 'react';
import ProductView from '../../../views/user/Product';
import AppLayout from '../../../layouts/user/AppLayout';
import ProductSkeleton from '../../../components/user/loadingSkeleton/ProductSkeleton';

export default function ProductDetailPage() {
  return (
    <AppLayout>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductView />
      </Suspense>
    </AppLayout>
  );
}
