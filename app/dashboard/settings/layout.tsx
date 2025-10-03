"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
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
    href: "/dashboard/settings/account",
    icon: User,
    variant: "ghost" as const,
  },
  {
    title: "Genel Ayarlar",
    href: "/dashboard/settings/general",
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
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:settings=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-screen items-stretch"
      >
        <ResizablePanel
          defaultSize={20}
          collapsedSize={4}
          collapsible={true}
          minSize={15}
          maxSize={30}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed:settings=${JSON.stringify(
              true
            )}`
          }}
          onResize={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed:settings=${JSON.stringify(
              false
            )}`
          }}
          className={cn(
            isCollapsed &&
              "min-w-[50px] transition-all duration-300 ease-in-out",
            "border-r"
          )}
        >
          <div className="p-6">
            {!isCollapsed && (
              <>
                <h1 className="text-2xl font-bold mb-2">Ayarlar</h1>
                <p className="text-muted-foreground text-sm mb-6">
                  Hesap ayarlarınızı yönetin ve e-posta tercihlerinizi belirleyin.
                </p>
              </>
            )}
            
            <nav className="space-y-1">
              {settingsNav.map((link, index) => {
                const isActive = pathname === link.href
                return isCollapsed ? (
                  <Tooltip key={index} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <a
                        href={link.href}
                        className={cn(
                          buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                          "h-9 w-9",
                          !isActive && "hover:bg-transparent hover:text-foreground"
                        )}
                      >
                        <link.icon className="h-4 w-4" />
                        <span className="sr-only">{link.title}</span>
                      </a>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="flex items-center gap-4">
                      {link.title}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <a
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
                  </a>
                )
              })}
            </nav>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={80} minSize={30}>
          <div className="h-full overflow-auto">
            <div className="p-6">
              {children}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}