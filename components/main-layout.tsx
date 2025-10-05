"use client"

import { usePathname } from "next/navigation"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  // Login/register sayfalarında sidebar gösterme
  const isAuthPage = pathname === '/giris' || pathname === '/kayit-ol' || pathname === '/sifremi-unuttum' || pathname === '/sifre-sifirla'

  if (isAuthPage) {
    return <>{children}</>
  }

  // Dashboard sayfaları kendi layout'unu kullanacak
  return <>{children}</>
}