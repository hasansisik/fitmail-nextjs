"use client"

import { GalleryVerticalEnd } from "lucide-react"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { Metadata } from "@/components/metadata";

import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
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
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/bg.jpg"
            alt="Bg"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render the login page if user is authenticated (will redirect)
  if (isAuthenticated && user) {
    return null;
  }
  return (
    <>
      <Metadata 
        title="Giriş Yap - Fitmail"
        description="Fitmail hesabınıza giriş yapın. Hızlı, güvenli ve akıllı e-posta deneyimi için giriş yapın."
        keywords="giriş, login, fitmail, email, e-posta"
      />
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/bg.jpg"
            alt="Bg"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
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
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
