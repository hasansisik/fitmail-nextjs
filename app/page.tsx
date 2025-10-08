'use client';

import { useEffect, useState } from 'react';
import HomePage from './home-page';
import AccountPage from './account-page';
import AdminPage from './admin-page';
import { isAccountSubdomain, isPanelSubdomain } from '@/config';

export default function Page() {
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setCurrentDomain(hostname);
    }
  }, []);

  // Domain bazlı routing
  if (isPanelSubdomain(currentDomain)) {
    return <AdminPage />;
  }
  
  if (isAccountSubdomain(currentDomain)) {
    return <AccountPage />;
  }
  
  // Ana domain için home page
  return <HomePage />;
}
