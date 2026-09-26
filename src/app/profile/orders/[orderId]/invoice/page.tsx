'use client';

import React, { Suspense } from 'react';
import OrderInvoiceView from '../../../../../views/user/OrderInvoice';
import AppLayout from '../../../../../layouts/user/AppLayout';
import AccountLayout from '../../../../../layouts/user/AccountLayout';
import InvoiceSkeleton from '../../../../../components/user/loadingSkeleton/InvoiceSkeleton';

export default function OrderInvoicePage() {
  return (
    <AppLayout>
      <AccountLayout>
        <Suspense fallback={<InvoiceSkeleton />}>
          <OrderInvoiceView />
        </Suspense>
      </AccountLayout>
    </AppLayout>
  );
}
