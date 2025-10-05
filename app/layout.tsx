"use client"

import { Geist, Geist_Mono } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";
import { MainLayout } from "@/components/main-layout";
import { Providers } from "@/redux/provider";
import { Toaster } from "sonner";
import { useAppDispatch } from "@/redux/hook";
import { loadUser } from "@/redux/actions/userActions";
import { Metadata } from "@/components/metadata";

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

  useEffect(() => {
    // Uygulama başladığında kullanıcı bilgilerini yükle
    dispatch(loadUser());
  }, [dispatch]);

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
