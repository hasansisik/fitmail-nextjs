"use client"

import * as React from "react"

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
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
}

export function AccountSwitcher({
  isCollapsed,
  accounts,
}: AccountSwitcherProps) {
  // Tek account varsa dropdown gösterme, sadece ismi göster
  if (accounts.length === 1) {
    const account = accounts[0]
    return (
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-md",
          isCollapsed && "justify-center px-2"
        )}
      >
        <span className={cn("font-medium", isCollapsed && "hidden")}>
          {account.label}
        </span>
        {isCollapsed && (
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
            {account.label.split(' ').map(n => n[0]).join('')}
          </div>
        )}
      </div>
    )
  }

  // Birden fazla account varsa dropdown göster
  const [selectedAccount, setSelectedAccount] = React.useState<string>(
    accounts[0]?.email || ""
  )

  // Seçili account'u bul
  const currentAccount = accounts.find((account) => account.email === selectedAccount)

  return (
    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
      <SelectTrigger
        className={cn(
          "flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate",
          isCollapsed &&
            "flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>span]:w-auto"
        )}
        aria-label="Select account"
      >
        <SelectValue placeholder="Select an account">
          <span className={cn("", isCollapsed && "hidden")}>
            {currentAccount?.label || currentAccount?.email}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {accounts.map((account) => (
          <SelectItem key={account.email} value={account.email}>
            <div className="flex items-center gap-3">
              <span>{account.label}</span>
              <span className="text-muted-foreground text-sm">({account.email})</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
