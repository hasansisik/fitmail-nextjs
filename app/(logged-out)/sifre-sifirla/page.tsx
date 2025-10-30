"use client"

import { AppLogo, AppLogoWithLoading } from "@/components/app-logo"
import { Suspense } from "react";
import { Metadata } from "@/components/metadata";
import { ResetPasswordForm } from "@/components/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <>
      <Metadata 
        title="Şifre Sıfırla - Fitmail"
        description="Fitmail şifrenizi sıfırlayın. E-posta adresiniz ve doğrulama kodunuz ile yeni şifre oluşturun."
        keywords="şifre, sıfırla, reset, fitmail, email, e-posta"
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
              <Suspense fallback={
                <AppLogoWithLoading size="md" />
              }>
                <ResetPasswordForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
