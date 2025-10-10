"use client"

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import "./globals.css";
import { MainLayout } from "@/components/main-layout";
import { Providers } from "@/redux/provider";
import { Toaster } from "sonner";
import { useAppDispatch } from "@/redux/hook";
import { loadUser } from "@/redux/actions/userActions";
import { Metadata } from "@/components/metadata";
import { isSubdomain, getMainDomainFromSubdomain, activeDomains } from "@/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function LayoutContent({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Uygulama başladığında kullanıcı bilgilerini yükle
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    // Global subdomain yönlendirme kontrolü
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // Panel subdomain'inde /mail path'ini ana domain'e yönlendir
      // Account subdomain'inde /mail path'ini ana domain'e yönlendir
      // Diğer path'ler subdomain'de kalabilir
      if (isSubdomain(hostname) && pathname === '/mail') {
        // Ana domain'e yönlendir
        const mainDomain = getMainDomainFromSubdomain(hostname);
        const redirectUrl = `${activeDomains.protocol}://${mainDomain}${pathname}`;
        
        setIsRedirecting(true);
        window.location.href = redirectUrl;
        return;
      }
    }
  }, [pathname]);

  // Yönlendirme sırasında loading göster
  if (isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yönlendiriliyor...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Metadata 
        title="Fitmail - Hızlı, Güvenli ve Akıllı E-posta"
        description="Fitmail ile e-postalarınızı yönetin, organize edin ve iletişiminizi güçlendirin. Modern arayüzü ve güçlü özellikleriyle e-posta deneyiminizi yeniden tanımlayın."
        keywords="email, e-posta, mail, güvenli email, hızlı email, akıllı email, fitmail"
      />
      <MainLayout>
        {children}
      </MainLayout>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>
          <Toaster 
            position="top-right"
            expand={true}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--background)',
                color: 'var(--foreground)',
                border: '1px solid var(--border)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
