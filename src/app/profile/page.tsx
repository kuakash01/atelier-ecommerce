'use client';

import React, { Suspense } from 'react';
import ProfileView from '../../views/user/Profile';
import AppLayout from '../../layouts/user/AppLayout';
import AccountLayout from '../../layouts/user/AccountLayout';
import ProfileSkeleton from '../../components/user/loadingSkeleton/ProfileSkeleton';

export default function ProfilePage() {
  return (
    <AppLayout>
      <AccountLayout>
        <Suspense fallback={<ProfileSkeleton />}>
          <ProfileView />
        </Suspense>
      </AccountLayout>
    </AppLayout>
  );
}
