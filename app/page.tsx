'use client';

import { useEffect, useState } from 'react';
import HomePage from './home-page';
import AccountPage from './account-page';
import AdminPage from './admin-page';
import { isAccountSubdomain, isPanelSubdomain } from '@/config';

export default function Page() {
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setCurrentDomain(hostname);
      setIsClient(true);
    }
  }, []);

  // Show loading while determining domain
  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
