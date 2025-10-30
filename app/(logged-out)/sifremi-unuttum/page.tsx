"use client"

import { AppLogo } from "@/components/app-logo"
import { Metadata } from "@/components/metadata";
import { ForgotPasswordForm } from "@/components/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <>
      <Metadata 
        title="Şifremi Unuttum - Fitmail"
        description="Fitmail şifrenizi mi unuttunuz? E-posta adresinizi girerek şifre sıfırlama bağlantısı alın."
        keywords="şifre, unuttum, sıfırla, fitmail, email, e-posta"
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
              <ForgotPasswordForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
