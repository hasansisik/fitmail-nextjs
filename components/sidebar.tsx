"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { useAppDispatch } from "@/redux/hook"
import { logout } from "@/redux/actions/userActions"
import { toast } from "sonner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
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
  LogOut,
} from "lucide-react"
import { useAppSelector } from "@/redux/hook"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mails } from "@/app/dashboard/mail/data"

// Mail sayılarını hesaplayan fonksiyon
const getMailCount = (category: string) => {
  return mails.filter(mail => mail.category === category).length
}

// Dinamik navigation array'leri
const getMainNav = () => [
  {
    title: "Gelen Kutusu",
    label: getMailCount("inbox").toString(),
    icon: Inbox,
    variant: "default" as const,
    href: "/dashboard/mail",
    category: "inbox"
  },
  {
    title: "Taslaklar",
    label: getMailCount("drafts").toString(),
    icon: File,
    variant: "ghost" as const,
    href: "/dashboard/mail/drafts",
    category: "drafts"
  },
  {
    title: "Gönderilenler",
    label: getMailCount("sent").toString(),
    icon: Send,
    variant: "ghost" as const,
    href: "/dashboard/mail/sent",
    category: "sent"
  },
  {
    title: "Spam",
    label: getMailCount("spam").toString(),
    icon: ArchiveX,
    variant: "ghost" as const,
    href: "/dashboard/mail/spam",
    category: "spam"
  },
  {
    title: "Çöp Kutusu",
    label: getMailCount("trash").toString(),
    icon: Trash2,
    variant: "ghost" as const,
    href: "/dashboard/mail/trash",
    category: "trash"
  },
  {
    title: "Arşiv",
    label: getMailCount("archive").toString(),
    icon: Archive,
    variant: "ghost" as const,
    href: "/dashboard/mail/archive",
    category: "archive"
  },
]

const getCategoryNav = () => [
  {
    title: "Sosyal",
    label: getMailCount("social").toString(),
    icon: Users2,
    variant: "ghost" as const,
    href: "/dashboard/mail/social",
    category: "social"
  },
  {
    title: "Güncellemeler",
    label: getMailCount("updates").toString(),
    icon: AlertCircle,
    variant: "ghost" as const,
    href: "/dashboard/mail/updates",
    category: "updates"
  },
  {
    title: "Forumlar",
    label: getMailCount("forums").toString(),
    icon: MessagesSquare,
    variant: "ghost" as const,
    href: "/dashboard/mail/forums",
    category: "forums"
  },
  {
    title: "Alışveriş",
    label: getMailCount("shopping").toString(),
    icon: ShoppingCart,
    variant: "ghost" as const,
    href: "/dashboard/mail/shopping",
    category: "shopping"
  },
  {
    title: "Promosyonlar",
    label: getMailCount("promotions").toString(),
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

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.user)
  
  // Dinamik navigation array'leri
  const mainNav = getMainNav()
  const categoryNav = getCategoryNav()

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
      </a>
    )
  }

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* User Account Section */}
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
      
      {/* Main Navigation and Category Navigation Combined - Scrollable */}
      <div className="flex flex-1 flex-col gap-4 py-2 overflow-y-auto">
        {/* Main Navigation */}
        <nav className="grid gap-1 px-2">
          {mainNav.map((link, index) => {
            const isActive = pathname === link.href || (pathname === "/dashboard/mail" && link.title === "Gelen Kutusu")
            return renderNavItem(link, index, isActive)
          })}
        </nav>
        
        {/* Category Navigation - Right below main navigation */}
        <nav className="grid gap-1 px-2">
          {categoryNav.map((link, index) => {
            const isActive = pathname === link.href
            return renderNavItem(link, index, isActive)
          })}
        </nav>
      </div>
      
      {/* Settings and Logout - Fixed at Bottom */}
      <div className="flex flex-col gap-4 py-2 border-t">
        <nav className="grid gap-1 px-2">
          {settingsNav.map((link, index) => {
            const isActive = pathname.startsWith(link.href)
            return renderNavItem(link, index, isActive)
          })}
        </nav>
      </div>
    </div>
  )
}
