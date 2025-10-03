"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button"
import { useAppDispatch } from "@/redux/hook"
import { logout } from "@/redux/actions/userActions"
import { toast } from "sonner"
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
  Inbox,
  File,
  Send,
  ArchiveX,
  Trash2,
  Archive,
  Users2,
  AlertCircle,
  MessagesSquare,
  ShoppingCart,
  Settings,
  Mail,
  LogOut,
} from "lucide-react"
import { AccountSwitcher } from "@/components/account-switcher"
import { useAppSelector } from "@/redux/hook"

const mainNav = [
  {
    title: "Gelen Kutusu",
    label: "128",
    icon: Inbox,
    variant: "default" as const,
    href: "/dashboard/mail",
    category: "inbox"
  },
  {
    title: "Taslaklar",
    label: "9",
    icon: File,
    variant: "ghost" as const,
    href: "/dashboard/mail/drafts",
    category: "drafts"
  },
  {
    title: "Gönderilenler",
    label: "",
    icon: Send,
    variant: "ghost" as const,
    href: "/dashboard/mail/sent",
    category: "sent"
  },
  {
    title: "Spam",
    label: "23",
    icon: ArchiveX,
    variant: "ghost" as const,
    href: "/dashboard/mail/spam",
    category: "spam"
  },
  {
    title: "Çöp Kutusu",
    label: "",
    icon: Trash2,
    variant: "ghost" as const,
    href: "/dashboard/mail/trash",
    category: "trash"
  },
  {
    title: "Arşiv",
    label: "",
    icon: Archive,
    variant: "ghost" as const,
    href: "/dashboard/mail/archive",
    category: "archive"
  },
]

const categoryNav = [
  {
    title: "Sosyal",
    label: "972",
    icon: Users2,
    variant: "ghost" as const,
    href: "/dashboard/mail/social",
    category: "social"
  },
  {
    title: "Güncellemeler",
    label: "342",
    icon: AlertCircle,
    variant: "ghost" as const,
    href: "/dashboard/mail/updates",
    category: "updates"
  },
  {
    title: "Forumlar",
    label: "128",
    icon: MessagesSquare,
    variant: "ghost" as const,
    href: "/dashboard/mail/forums",
    category: "forums"
  },
  {
    title: "Alışveriş",
    label: "8",
    icon: ShoppingCart,
    variant: "ghost" as const,
    href: "/dashboard/mail/shopping",
    category: "shopping"
  },
  {
    title: "Promosyonlar",
    label: "21",
    icon: Archive,
    variant: "ghost" as const,
    href: "/dashboard/mail/promotions",
    category: "promotions"
  },
]

const settingsNav = [
  {
    title: "Ayarlar",
    label: "",
    icon: Settings,
    variant: "ghost" as const,
    href: "/dashboard/settings"
  },
  {
    title: "Çıkış Yap",
    label: "",
    icon: LogOut,
    variant: "ghost" as const,
    href: "#",
    isLogout: true
  },
]

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.user)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap()
      toast.success("Başarıyla çıkış yapıldı!")
      router.push("/login")
    } catch (error: any) {
      console.error("Logout failed:", error)
      toast.error("Çıkış yapılırken bir hata oluştu")
    }
  }

  // Kullanıcı bilgilerini accounts'a dönüştür
  const userAccounts = user ? [
    {
      label: `${user.name} ${user.surname}`,
      email: user.email,
      icon: null // Icon kaldırıldı
    }
  ] : []

  // Settings sayfalarında sidebar gösterme
  const isSettingsPage = pathname.startsWith('/dashboard/settings')
  
  // Mail sayfalarında sidebar gösterme
  const isMailPage = pathname.startsWith('/dashboard/mail')

  // Login/register sayfalarında sidebar gösterme
  const isAuthPage = pathname === '/login' || pathname === '/register'

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout:main=${JSON.stringify(
            sizes
          )}`
        }}
        className="h-screen min-h-screen items-stretch"
      >
        {(isMailPage || isSettingsPage) && (
          <>
            <ResizablePanel
              defaultSize={15}
              collapsedSize={4}
              collapsible={true}
              minSize={10}
              maxSize={25}
              onCollapse={() => {
                setIsCollapsed(true)
                document.cookie = `react-resizable-panels:collapsed:main=${JSON.stringify(
                  true
                )}`
              }}
              onResize={() => {
                setIsCollapsed(false)
                document.cookie = `react-resizable-panels:collapsed:main=${JSON.stringify(
                  false
                )}`
              }}
              className={cn(
                isCollapsed &&
                  "min-w-[50px] transition-all duration-300 ease-in-out",
                "border-r"
              )}
            >
              <div
                className={cn(
                  "flex h-[52px] items-center justify-center",
                  isCollapsed ? "h-[52px]" : "px-2"
                )}
              >
                <AccountSwitcher isCollapsed={isCollapsed} accounts={userAccounts} />
              </div>
              
              <div
                data-collapsed={isCollapsed}
                className="group flex flex-1 flex-col gap-4 py-2 data-[collapsed=true]:py-2"
              >
                <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                  {mainNav.map((link, index) => {
                    const isActive = pathname === link.href || (pathname === "/dashboard/mail" && link.title === "Gelen Kutusu")
                    return isCollapsed ? (
                      <Tooltip key={index} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <a
                            href={link.href}
                            className={cn(
                              buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                              !isActive && "hover:bg-transparent hover:text-foreground",
                              "h-9 w-9",
                            )}
                          >
                            <link.icon className="h-4 w-4" />
                            <span className="sr-only">{link.title}</span>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-4">
                          {link.title}
                          {link.label && (
                            <span className="ml-auto text-muted-foreground">
                              {link.label}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <a
                        key={index}
                        href={link.href}
                        className={cn(
                          buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                          !isActive && "hover:bg-transparent hover:text-foreground",
                          "justify-start"
                        )}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.title}
                        {link.label && (
                          <span
                            className={cn(
                              "ml-auto",
                              isActive &&
                                "text-primary-foreground"
                            )}
                          >
                            {link.label}
                          </span>
                        )}
                      </a>
                    )
                  })}
                </nav>
              </div>
              
              <div
                data-collapsed={isCollapsed}
                className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
              >
                <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                  {categoryNav.map((link, index) => {
                    const isActive = pathname === link.href
                    return isCollapsed ? (
                      <Tooltip key={index} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <a
                            href={link.href}
                            className={cn(
                              buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                              !isActive && "hover:bg-transparent hover:text-foreground",
                              "h-9 w-9",
                            )}
                          >
                            <link.icon className="h-4 w-4" />
                            <span className="sr-only">{link.title}</span>
                          </a>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-4">
                          {link.title}
                          {link.label && (
                            <span className="ml-auto text-muted-foreground">
                              {link.label}
                            </span>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <a
                        key={index}
                        href={link.href}
                        className={cn(
                          buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                          !isActive && "hover:bg-transparent hover:text-foreground",
                          "justify-start"
                        )}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.title}
                        {link.label && (
                          <span
                            className={cn(
                              "ml-auto",
                              isActive &&
                                "text-primary-foreground"
                            )}
                          >
                            {link.label}
                          </span>
                        )}
                      </a>
                    )
                  })}
                </nav>
              </div>
              
              <div
                data-collapsed={isCollapsed}
                className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
              >
                <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
                  {settingsNav.map((link, index) => {
                    const isActive = pathname.startsWith(link.href)
                    const isLogout = link.isLogout
                    
                    return isCollapsed ? (
                      <Tooltip key={index} delayDuration={0}>
                        <TooltipTrigger asChild>
                          {isLogout ? (
                            <button
                              onClick={handleLogout}
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "icon" }),
                                "hover:bg-transparent hover:text-foreground",
                                "h-9 w-9",
                              )}
                            >
                              <link.icon className="h-4 w-4" />
                              <span className="sr-only">{link.title}</span>
                            </button>
                          ) : (
                            <a
                              href={link.href}
                              className={cn(
                                buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                                !isActive && "hover:bg-transparent hover:text-foreground",
                                "h-9 w-9",
                              )}
                            >
                              <link.icon className="h-4 w-4" />
                              <span className="sr-only">{link.title}</span>
                            </a>
                          )}
                        </TooltipTrigger>
                        <TooltipContent side="right" className="flex items-center gap-4">
                          {link.title}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      isLogout ? (
                        <button
                          key={index}
                          onClick={handleLogout}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "hover:bg-transparent hover:text-foreground",
                            "justify-start"
                          )}
                        >
                          <link.icon className="mr-2 h-4 w-4" />
                          {link.title}
                        </button>
                      ) : (
                        <a
                          key={index}
                          href={link.href}
                          className={cn(
                            buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
                            !isActive && "hover:bg-transparent hover:text-foreground",
                            "justify-start"
                          )}
                        >
                          <link.icon className="mr-2 h-4 w-4" />
                          {link.title}
                        </a>
                      )
                    )
                  })}
                </nav>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
          </>
        )}
        
        <ResizablePanel defaultSize={isMailPage || isSettingsPage ? 85 : 100} minSize={30}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}