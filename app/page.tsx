'use client';

import { useEffect, useState } from 'react';
import { AppLogoWithLoading } from '@/components/app-logo';
import { usePathname } from 'next/navigation';
import HomePage from './home-page';
import AccountPage from './account-page';
import AdminPage from './admin-page';
import MailPage from './mail/page';
import { isAccountSubdomain, isPanelSubdomain } from '@/config';

export default function Page() {
  const [currentDomain, setCurrentDomain] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <AppLogoWithLoading size="lg" />
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
  
  // Ana domain için routing - sadece /mail path'i için
  if (pathname === '/mail') {
    return <MailPage />;
  }
  
  // Ana domain için home page
  return <HomePage />;
}
