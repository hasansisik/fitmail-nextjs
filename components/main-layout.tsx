"use client"

import { usePathname } from "next/navigation"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  // Login/register sayfalarında sidebar gösterme
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  // Dashboard sayfaları kendi layout'unu kullanacak
  return <>{children}</>
}