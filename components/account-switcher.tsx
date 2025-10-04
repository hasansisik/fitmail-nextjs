"use client"

import * as React from "react"
import { useAppSelector } from "@/redux/hook"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface AccountSwitcherProps {
  isCollapsed: boolean
}

export function AccountSwitcher({
  isCollapsed,
}: AccountSwitcherProps) {
  const { user } = useAppSelector((state) => state.user)
  
  // Kullanıcı bilgisi yoksa loading göster
  if (!user) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md",
          isCollapsed && "justify-center px-2"
        )}
      >
        <span className={cn("text-muted-foreground", isCollapsed && "hidden")}>
          Yükleniyor...
        </span>
        {isCollapsed && (
          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-muted-foreground text-xs font-medium">
            ...
          </div>
        )}
      </div>
    )
  }

  // Kullanıcı bilgisi varsa göster
  const userInitials = `${user.name?.[0] || ''}${user.surname?.[0] || ''}`.toUpperCase()
  const userDisplayName = `${user.name || ''} ${user.surname || ''}`.trim() || user.email

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md",
        isCollapsed && "justify-center px-2"
      )}
    >
      <span className={cn("font-medium", isCollapsed && "hidden")}>
        {userDisplayName}
      </span>
      {isCollapsed && (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
          {userInitials}
        </div>
      )}
    </div>
  )
}
