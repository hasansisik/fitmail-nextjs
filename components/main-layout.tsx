"use client"

import { usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/sidebar"


interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()

  // Settings sayfalarında sidebar gösterme
  const isSettingsPage = pathname.startsWith('/dashboard/settings')
  
  // Mail sayfalarında sidebar gösterme
  const isMailPage = pathname.startsWith('/dashboard/mail')

  // Login/register sayfalarında sidebar gösterme
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  if (isMailPage || isSettingsPage) {
    return (
      <TooltipProvider delayDuration={0}>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      </TooltipProvider>
    )
  }

  return <>{children}</>
}