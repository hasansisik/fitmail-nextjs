'use client';

import { useEffect, useState } from 'react';
import HomePage from './home-page';
import AccountPage from './account-page';
import AdminPage from './admin-page';

export default function Page() {
  const [currentDomain, setCurrentDomain] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setCurrentDomain(hostname);
    }
  }, []);

  // Domain bazlı routing
  if (currentDomain === 'panel.localhost' || currentDomain === 'panel.domain.com') {
    return <AdminPage />;
  }
  
  if (currentDomain === 'account.localhost' || currentDomain === 'account.domain.com') {
    return <AccountPage />;
  }
  
  // Ana domain için home page
  return <HomePage />;
}
