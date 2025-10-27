"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { Metadata } from "@/components/metadata";
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <>
      <Metadata 
        title="Giriş Yap - Fitmail"
        description="Fitmail hesabınıza giriş yapın. Hızlı, güvenli ve akıllı e-posta deneyimi için giriş yapın."
        keywords="giriş, login, fitmail, email, e-posta"
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
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              Fitmail
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
