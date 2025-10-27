'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import HomePage from './home-page';
import AccountPage from './account-page';
import AdminPage from './admin-page';
import MailPage from './mail/page';
import { isAccountSubdomain, isPanelSubdomain } from '@/config';
import { GalleryVerticalEnd } from 'lucide-react';

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
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-2xl">
            <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md animate-pulse">
              <GalleryVerticalEnd className="size-5" />
            </div>
            <span className="animate-pulse">Fitmail</span>
          </div>
          <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" 
                 style={{
                   animation: 'loading 1.5s ease-in-out infinite',
                   transformOrigin: 'left'
                 }}
            />
          </div>
        </div>
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
