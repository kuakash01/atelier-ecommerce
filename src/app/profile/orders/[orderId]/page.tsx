'use client';

import React, { Suspense } from 'react';
import OrderDetailsView from '../../../../views/user/OrderDetails';
import AppLayout from '../../../../layouts/user/AppLayout';
import AccountLayout from '../../../../layouts/user/AccountLayout';
import OrderDetailsSkeleton from '../../../../components/user/loadingSkeleton/OrderDetailsSkeleton';

export default function UserOrderDetailPage() {
  return (
    <AppLayout>
      <AccountLayout>
        <Suspense fallback={<OrderDetailsSkeleton />}>
          <OrderDetailsView />
        </Suspense>
      </AccountLayout>
    </AppLayout>
  );
}
