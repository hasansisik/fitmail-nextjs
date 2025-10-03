"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Sidebar } from "@/components/sidebar"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"


interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

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
        <ResizablePanelGroup
          direction="horizontal"
          className="h-screen items-stretch"
        >
          <ResizablePanel
            defaultSize={15}
            collapsedSize={4}
            collapsible={true}
            minSize={15}
            maxSize={20}
            onCollapse={() => setIsCollapsed(true)}
            onResize={() => setIsCollapsed(false)}
            className="border-r"
          >
            <Sidebar isCollapsed={isCollapsed} onCollapse={setIsCollapsed} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={82} minSize={30}>
            <div className="h-full overflow-auto">
              {children}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </TooltipProvider>
    )
  }

  return <>{children}</>
}