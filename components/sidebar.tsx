"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { logout } from "@/redux/actions/userActions"
import { getMailsByLabelCategory, getMailStats } from "@/redux/actions/mailActions"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
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
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAppSelector } from "@/redux/hook"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mails } from "@/app/dashboard/mail/data"

// Dinamik navigation array'leri - mail stats kullanacak
const getMainNav = (mailStats: any) => [
  {
    title: "Gelen Kutusu",
    label: (mailStats?.inbox || 0).toString(),
    icon: Inbox,
    variant: "default" as const,
    href: "/dashboard/mail",
    category: "inbox"
  },
  {
    title: "Taslaklar",
    label: (mailStats?.drafts || 0).toString(),
    icon: File,
    variant: "ghost" as const,
    href: "/dashboard/mail/drafts",
    category: "drafts"
  },
  {
    title: "Gönderilenler",
    label: (mailStats?.sent || 0).toString(),
    icon: Send,
    variant: "ghost" as const,
    href: "/dashboard/mail/sent",
    category: "sent"
  },
  {
    title: "Spam",
    label: (mailStats?.spam || 0).toString(),
    icon: ArchiveX,
    variant: "ghost" as const,
    href: "/dashboard/mail/spam",
    category: "spam"
  },
  {
    title: "Çöp Kutusu",
    label: (mailStats?.trash || 0).toString(),
    icon: Trash2,
    variant: "ghost" as const,
    href: "/dashboard/mail/trash",
    category: "trash"
  },
  {
    title: "Arşiv",
    label: (mailStats?.archive || 0).toString(),
    icon: Archive,
    variant: "ghost" as const,
    href: "/dashboard/mail/archive",
    category: "archive"
  },
]

const getCategoryNav = (mailStats: any) => [
  {
    title: "Sosyal",
    label: (mailStats?.social || 0).toString(),
    icon: Users2,
    variant: "ghost" as const,
    href: "/dashboard/mail/social",
    category: "social"
  },
  {
    title: "Güncellemeler",
    label: (mailStats?.updates || 0).toString(),
    icon: AlertCircle,
    variant: "ghost" as const,
    href: "/dashboard/mail/updates",
    category: "updates"
  },
  {
    title: "Forumlar",
    label: (mailStats?.forums || 0).toString(),
    icon: MessagesSquare,
    variant: "ghost" as const,
    href: "/dashboard/mail/forums",
    category: "forums"
  },
  {
    title: "Alışveriş",
    label: (mailStats?.shopping || 0).toString(),
    icon: ShoppingCart,
    variant: "ghost" as const,
    href: "/dashboard/mail/shopping",
    category: "shopping"
  },
  {
    title: "Promosyon",
    label: (mailStats?.promotions || 0).toString(),
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
    href: "/dashboard/settings/account"
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

interface SidebarProps {
  isCollapsed?: boolean
  onCollapse?: (collapsed: boolean) => void
}

export function Sidebar({ isCollapsed: externalIsCollapsed, onCollapse }: SidebarProps = {}) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.user)
  const { mailStats } = useAppSelector((state) => state.mail)
  const [internalIsCollapsed, setInternalIsCollapsed] = useState(false)
  
  const isCollapsed = externalIsCollapsed !== undefined ? externalIsCollapsed : internalIsCollapsed
  const setIsCollapsed = onCollapse || setInternalIsCollapsed

  // Kategori tıklama handler'ı
  const handleCategoryClick = (category: string) => {
    console.log(`Kategori tıklandı: ${category}`)
    // Kategori sayfaları için label category kullan
    if (['social', 'updates', 'forums', 'shopping', 'promotions'].includes(category)) {
      dispatch(getMailsByLabelCategory({
        category: category,
        page: 1,
        limit: 50
      }))
    } else {
      // Klasör sayfaları için normal category kullan
      dispatch(getMailsByCategory({
        folder: category,
        page: 1,
        limit: 50
      }))
    }
  }
  
  // Dinamik navigation array'leri
  const mainNav = getMainNav(mailStats)
  const categoryNav = getCategoryNav(mailStats)

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

  // Kullanıcı adının baş harflerini al
  const userInitials = user ? `${user.name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase() : 'U'

  const renderNavItem = (link: any, index: number, isActive: boolean) => {
    const isLogout = link.isLogout

    return isLogout ? (
      isCollapsed ? (
        <Tooltip key={index} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "h-9 w-9 mx-auto",
                "hover:bg-transparent hover:text-foreground"
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
        <button
          key={index}
          onClick={handleLogout}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "hover:bg-transparent hover:text-foreground",
            "justify-start w-full"
          )}
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
        </button>
      )
    ) : (
      isCollapsed ? (
        <Tooltip key={index} delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              onClick={() => handleCategoryClick(link.category)}
              className={cn(
                buttonVariants({ variant: isActive ? "default" : "ghost", size: "icon" }),
                "h-9 w-9 mx-auto",
                !isActive && "hover:bg-transparent hover:text-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              <span className="sr-only">{link.title}</span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {link.title}
            {link.label && (
              <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
                {link.label}
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      ) : (
        <button
          key={index}
          onClick={() => handleCategoryClick(link.category)}
          className={cn(
            buttonVariants({ variant: isActive ? "default" : "ghost", size: "sm" }),
            !isActive && "hover:bg-transparent hover:text-foreground",
            "justify-start w-full"
          )}
        >
          <link.icon className="mr-2 h-4 w-4" />
          {link.title}
          {link.label && (
            <span
              className={cn(
                "ml-auto",
                isActive && "text-primary-foreground"
              )}
            >
              {link.label}
            </span>
          )}
        </button>
      )
    )
  }

  return (
    <div className="flex h-screen w-full flex-col bg-background transition-all duration-300 ease-in-out">
      {/* User Account Section */}
      {!isCollapsed && (
        <div className="flex h-16 items-center justify-center px-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={`${user?.name} ${user?.surname}`} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{user?.name} {user?.surname}</span>
              <span className="text-xs text-muted-foreground">{user?.email}</span>
            </div>
          </div>
        </div>
      )}
      
      {isCollapsed && (
        <div className="flex h-16 items-center justify-center px-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={`${user?.name} ${user?.surname}`} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
      
      {/* Main Navigation and Category Navigation Combined - Scrollable */}
      <div className="flex flex-1 flex-col gap-4 py-2 overflow-y-auto">
        {/* Main Navigation */}
        <nav className={cn(
          "grid gap-1",
          isCollapsed ? "px-1" : "px-2"
        )}>
          {mainNav.map((link, index) => {
            const isActive = pathname === link.href || (pathname === "/dashboard/mail" && link.title === "Gelen Kutusu")
            return renderNavItem(link, index, isActive)
          })}
        </nav>
        
        {/* Category Navigation - Right below main navigation */}
        <nav className={cn(
          "grid gap-1",
          isCollapsed ? "px-1" : "px-2"
        )}>
          {categoryNav.map((link, index) => {
            const isActive = pathname === link.href
            return renderNavItem(link, index, isActive)
          })}
        </nav>
      </div>
      
      {/* Settings and Logout - Fixed at Bottom */}
      <div className="flex flex-col gap-4 py-2 border-t">
        <nav className={cn(
          "grid gap-1",
          isCollapsed ? "px-1" : "px-2"
        )}>
          {settingsNav.map((link, index) => {
            const isActive = pathname.startsWith(link.href)
            return renderNavItem(link, index, isActive)
          })}
        </nav>

      </div>
    </div>
  )
}
