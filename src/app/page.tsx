'use client';

import React from 'react';
import HomeView from '../views/user/Home';
import AppLayout from '../layouts/user/AppLayout';

export default function HomePage() {
  return (
    <AppLayout>
      <HomeView />
    </AppLayout>
  );
}
