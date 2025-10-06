"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  User,
  Settings,
  Bell,
  Palette,
  Zap,
} from "lucide-react"

const settingsNav = [
  {
    title: "Hesap",
    href: "/mail/settings/account",
    icon: User,
    variant: "ghost" as const,
  },
  {
    title: "Genel Ayarlar",
    href: "/mail/settings/general",
    icon: Settings,
    variant: "ghost" as const,
  }
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen flex flex-row">
        {/* Mobile Sidebar - Left side on mobile */}
        <div className="lg:hidden w-16 border-r">
          <div className="h-screen overflow-hidden">
            <div className="p-2 h-full flex flex-col">
              <nav className="flex flex-col items-center justify-center flex-1 space-y-1">
                {settingsNav.map((link, index) => {
                  const isActive = pathname === link.href
                  return (
                    <Tooltip key={index} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => router.push(link.href)}
                          className={cn(
                            buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                            "h-9 w-9 cursor-pointer",
                            !isActive && "hover:bg-transparent hover:text-foreground"
                          )}
                        >
                          <link.icon className="h-4 w-4" />
                          <span className="sr-only">{link.title}</span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="flex items-center gap-4">
                        {link.title}
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
        
        {/* Desktop Resizable Layout */}
        <div className="hidden lg:flex flex-1">
          <ResizablePanelGroup
            direction="horizontal"
            className="h-screen items-stretch"
          >
            <ResizablePanel
              defaultSize={20}
              collapsedSize={4}
              collapsible={true}
              minSize={15}
              maxSize={30}
              onCollapse={() => setIsCollapsed(true)}
              onResize={() => setIsCollapsed(false)}
              className="border-r"
            >
              <div className="h-screen overflow-hidden">
                <div className={cn(
                  isCollapsed ? "p-2 h-full flex flex-col" : "p-6"
                )}>
                  {!isCollapsed && (
                    <>
                      <h1 className="text-2xl font-bold mb-2">Ayarlar</h1>
                      <p className="text-muted-foreground text-sm mb-6">
                        Hesap ayarlarınızı yönetin ve e-posta tercihlerinizi belirleyin.
                      </p>
                    </>
                  )}
                  
                  <nav className={cn(
                    "space-y-1",
                    isCollapsed ? "flex flex-col items-center justify-center flex-1" : ""
                  )}>
                    {settingsNav.map((link, index) => {
                      const isActive = pathname === link.href
                      return isCollapsed ? (
                        <Tooltip key={index} delayDuration={0}>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => router.push(link.href)}
                              className={cn(
                                buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                                "h-9 w-9 cursor-pointer",
                                !isActive && "hover:bg-transparent hover:text-foreground"
                              )}
                            >
                              <link.icon className="h-4 w-4" />
                              <span className="sr-only">{link.title}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="flex items-center gap-4">
                            {link.title}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Link
                          key={index}
                          href={link.href}
                          className={cn(
                            buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                            !isActive && "hover:bg-transparent hover:text-foreground",
                            "justify-start w-full"
                          )}
                        >
                          <link.icon className="mr-2 h-4 w-4" />
                          {link.title}
                        </Link>
                      )
                    })}
                  </nav>
                </div>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={80} minSize={30}>
              <div className="h-screen overflow-auto">
                <div className="p-6">
                  {children}
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
        
        {/* Mobile Content - Remaining width on mobile */}
        <div className="lg:hidden flex-1 overflow-auto">
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}