'use client';

import React, { Suspense } from 'react';
import AddressView from '../../../views/user/Address';
import AppLayout from '../../../layouts/user/AppLayout';
import AccountLayout from '../../../layouts/user/AccountLayout';
import AddressSkeleton from '../../../components/user/loadingSkeleton/AddressSkeleton';

export default function AddressesPage() {
  return (
    <AppLayout>
      <AccountLayout>
        <Suspense fallback={<AddressSkeleton />}>
          <AddressView />
        </Suspense>
      </AccountLayout>
    </AppLayout>
  );
}
