"use client"

import * as React from "react"
import { Search, Plus } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { MailDisplay } from "@/components/mail-display"
import { MailList } from "@/components/mail-list"
import { SendMailDialog } from "@/components/send-mail-dialog"
import { type Mail } from "@/app/dashboard/mail/data"
import { useMail } from "@/app/dashboard/mail/use-mail"

interface MailProps {
  accounts: {
    label: string
    email: string
    icon: React.ReactNode
  }[]
  mails: Mail[]
  defaultLayout: number[] | undefined
  defaultCollapsed?: boolean
  navCollapsedSize: number
  categoryTitle?: string
}

export function Mail({
  accounts,
  mails,
  defaultLayout = [20, 32, 48],
  defaultCollapsed = false,
  navCollapsedSize,
  categoryTitle = "Gelen Kutusu",
}: MailProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
  const [isMaximized, setIsMaximized] = React.useState(false)
  const [showSendDialog, setShowSendDialog] = React.useState(false)
  const [mail, { clearSelection }] = useMail()

  // İlk account'u (kullanıcı) al
  const currentUser = accounts[0]

  // Seçili mail var mı kontrol et
  const selectedMail = mails.find((item) => item.id === mail.selected)
  const showMailDetail = selectedMail !== undefined

  return (
    <div className="h-full flex">
      {/* Mail Listesi - Sadece mail seçili değilse göster */}
      {!showMailDetail && (
        <div className="w-full">
          <Tabs defaultValue="all">
            <div className="flex items-center px-4 py-2">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold">{categoryTitle}</h1>
                {currentUser && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>•</span>
                    <span>{currentUser.email}</span>
                  </div>
                )}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => setShowSendDialog(true)}
                  className="h-8"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Yeni Mail
                </Button>
                <TabsList>
                  <TabsTrigger
                    value="all"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Tüm E-postalar
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="text-zinc-600 dark:text-zinc-200"
                  >
                    Okunmamış
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>
            <Separator />
            <div className="bg-background/95 p-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Ara" className="pl-8" />
                </div>
              </form>
            </div>
            <TabsContent value="all" className="m-0">
              <MailList items={mails} />
            </TabsContent>
            <TabsContent value="unread" className="m-0">
              <MailList items={mails.filter((item) => !item.read)} />
            </TabsContent>
          </Tabs>
        </div>
      )}
      
      {/* Mail Detayı - Sadece mail seçili ise göster */}
      {showMailDetail && (
        <div className="w-full">
          <div className="flex h-full flex-col">
            <div className="flex-1">
              <MailDisplay
                mail={selectedMail}
                isMaximized={true}
                onToggleMaximize={clearSelection}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Send Mail Dialog */}
      <SendMailDialog
        open={showSendDialog}
        onOpenChange={setShowSendDialog}
      />
    </div>
  )
}
