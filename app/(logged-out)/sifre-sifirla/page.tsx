"use client"

import { GalleryVerticalEnd } from "lucide-react"
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
      <div className="grid min-h-svh lg:grid-cols-2">
        <div 
          className="bg-muted relative hidden lg:block"
          style={{
            backgroundImage: 'url(/bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Fitmail
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <Suspense fallback={
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
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
