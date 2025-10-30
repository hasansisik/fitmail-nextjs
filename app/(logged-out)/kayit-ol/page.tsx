"use client"

import { AppLogo, AppLogoWithLoading } from "@/components/app-logo"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { Metadata } from "@/components/metadata";

import { RegisterForm } from "@/components/register-form"

export default function RegisterPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.user);

  // Redirect authenticated users to /mail
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.push("/mail");
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2 page-transition">
        <div 
          className="bg-muted relative hidden lg:block"
          style={{
            backgroundImage: 'url(/bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="flex flex-col gap-4 p-6 md:p-10 slide-in-from-right">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <AppLogo size="sm" />
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <AppLogoWithLoading size="md" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render the register page if user is authenticated (will redirect)
  if (isAuthenticated && user) {
    return null;
  }
  return (
    <>
      <Metadata 
        title="Kayıt Ol - Fitmail"
        description="Fitmail'e ücretsiz kayıt olun. Hızlı, güvenli ve akıllı e-posta deneyimi için hemen başlayın."
        keywords="kayıt, register, fitmail, email, e-posta, ücretsiz"
      />
      <div className="grid min-h-svh lg:grid-cols-2 page-transition">
        <div 
          className="bg-muted relative hidden lg:block"
          style={{
            backgroundImage: 'url(/bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="flex flex-col gap-4 p-6 md:p-10 slide-in-from-right">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <AppLogo size="sm" />
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <RegisterForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
