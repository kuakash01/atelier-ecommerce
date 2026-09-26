'use client';

import React from 'react';
import AddressFormView from '../../../../views/user/AddressForm';
import AppLayout from '../../../../layouts/user/AppLayout';
import AccountLayout from '../../../../layouts/user/AccountLayout';

export default function AddAddressPage() {
  return (
    <AppLayout>
      <AccountLayout>
        <AddressFormView />
      </AccountLayout>
    </AppLayout>
  );
}
