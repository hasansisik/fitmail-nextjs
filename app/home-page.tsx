"use client"

import Link from "next/link";
import { AppLogo, AppLogoWithLoading } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Zap, Target, Smartphone } from "lucide-react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hook";
import { Metadata } from "@/components/metadata";
import { isSubdomain } from "@/config";

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.user);

  // Redirect authenticated users to /mail (only on main domain)
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Sadece ana domain'deyse /mail'e yönlendir
      if (typeof window !== 'undefined' && !isSubdomain(window.location.hostname)) {
        router.push("/mail");
      }
    }
  }, [isAuthenticated, loading, user, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10">
          <div className="flex flex-col items-center gap-3">
          <AppLogoWithLoading size="lg" />
          <div className="h-1 w-24 bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" />
          </div>
        </div>
      </div>
    );
  }

  // Don't render the homepage if user is authenticated (will redirect)
  if (isAuthenticated && user) {
    return null;
  }
  return (
    <>
      <Metadata 
        title="Fitmail - Hızlı, Güvenli ve Akıllı E-posta"
        description="Fitmail ile e-postalarınızı yönetin, organize edin ve iletişiminizi güçlendirin. Modern arayüzü ve güçlü özellikleriyle e-posta deneyiminizi yeniden tanımlayın."
        keywords="email, e-posta, mail, güvenli email, hızlı email, akıllı email, fitmail, ücretsiz email"
      />
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-8 p-6 md:p-10">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Logo/Title */}
          <div className="space-y-4">
            <AppLogo size="lg" />
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-semibold text-muted-foreground">
              Hızlı, Güvenli ve Akıllı E-posta
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Fitmail ile e-postalarınızı yönetin, organize edin ve iletişiminizi güçlendirin. 
              Modern arayüzü ve güçlü özellikleriyle e-posta deneyiminizi yeniden tanımlayın.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="w-full sm:w-auto min-w-[140px]">
              <Link href="/giris">
                Giriş Yap
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto min-w-[140px]">
              <Link href="/kayit-ol">
                Kayıt Ol
              </Link>
            </Button>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-border">
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">Hızlı ve Güvenli</h3>
              <p className="text-sm text-muted-foreground">
                Gelişmiş güvenlik ve hızlı performans
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Target className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">Akıllı Organizasyon</h3>
              <p className="text-sm text-muted-foreground">
                E-postalarınızı otomatik kategorize edin
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                <Smartphone className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold">Her Cihazda</h3>
              <p className="text-sm text-muted-foreground">
                Masaüstü ve mobil uyumlu arayüz
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}