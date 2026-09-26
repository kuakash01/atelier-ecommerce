'use client';

import React, { Suspense } from 'react';
import OrdersView from '../../../views/user/Orders';
import AppLayout from '../../../layouts/user/AppLayout';
import AccountLayout from '../../../layouts/user/AccountLayout';
import OrdersSkeleton from '../../../components/user/loadingSkeleton/OrdersSkeleton';

export default function UserOrdersPage() {
  return (
    <AppLayout>
      <AccountLayout>
        <Suspense fallback={<OrdersSkeleton />}>
          <OrdersView />
        </Suspense>
      </AccountLayout>
    </AppLayout>
  );
}
