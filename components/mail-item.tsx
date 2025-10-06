import { ComponentProps } from "react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MailContextMenu } from "@/components/mail-context-menu"

// Label translation function
function translateLabel(label: string): string {
  const translations: Record<string, string> = {
    'promotions': 'Promosyonlar',
    'forums': 'Forumlar',
    'social': 'Sosyal',
    'updates': 'Güncellemeler',
    'shopping': 'Alışveriş',
    'work': 'İş',
    'personal': 'Kişisel',
    'important': 'Önemli',
    'starred': 'Yıldızlı',
    'draft': 'Taslak',
    'sent': 'Gönderilen',
    'inbox': 'Gelen Kutusu',
    'spam': 'Spam',
    'trash': 'Çöp Kutusu',
    'archive': 'Arşiv'
  }
  
  return translations[label.toLowerCase()] || label
}

// API'den gelen mail formatı
interface ApiMail {
  _id: string
  from: {
    name: string
    email: string
  }
  to: Array<{ name: string; email: string }>
  cc: Array<{ name: string; email: string }>
  bcc: Array<{ name: string; email: string }>
  subject: string
  content: string
  htmlContent?: string
  attachments: Array<{
    filename: string
    originalName?: string
    mimeType?: string
    contentType?: string
    type?: string
    size: number
    url?: string
  }>
  labels: string[]
  categories: string[]
  folder: string
  isRead: boolean
  isStarred: boolean
  isImportant: boolean
  receivedAt: string
  createdAt: string
  updatedAt: string
  conversation?: Array<{
    id: string
    sender: string
    content: string
    date: string
    isFromMe: boolean
  }>
  status: string
  mailgunId: string
  messageId: string
  references: string[]
  user: {
    _id: string
    name: string
    surname: string
    mailAddress: string
  }
}

interface MailItemProps {
  mail: ApiMail
  onAction: (action: string, mailId: string, data?: any) => void
  onClick?: () => void
}

export function MailItem({ mail, onAction, onClick }: MailItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    // Sadece sol tık için mail seç
    e.preventDefault()
    e.stopPropagation()
    onClick?.()
  }

  // Reply olup olmadığını kontrol et
  const isReply = mail.subject.toLowerCase().startsWith('re:')
  const originalSubject = isReply ? mail.subject.replace(/^re:\s*/i, '') : mail.subject

  return (
    <MailContextMenu
      mail={mail}
      onAction={onAction}
    >
      <div
        className={cn(
          "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent w-full cursor-pointer",
          isReply && "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
        )}
        onClick={handleClick}
      >
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="font-semibold">{mail.from?.name || 'Bilinmeyen Gönderen'}</div>
              {!mail.isRead && (
                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              )}
              {isReply && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  Yanıt
                </Badge>
              )}
            </div>
            <div
              className={cn(
                "ml-auto text-xs text-muted-foreground"
              )}
            >
              {(() => {
                try {
                  const dateValue = mail.receivedAt || mail.createdAt || mail.updatedAt
                  if (!dateValue) return 'Tarih yok'
                  
                  // Tarih string'ini parse et
                  let date: Date
                  if (typeof dateValue === 'string') {
                    date = new Date(dateValue)
                  } else {
                    date = dateValue
                  }
                  
                  if (isNaN(date.getTime())) return 'Geçersiz tarih'
                  
                  // Detaylı zaman hesaplama
                  const now = new Date()
                  const diffInMs = now.getTime() - date.getTime()
                  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
                  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
                  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
                  
                  if (diffInMinutes < 1) {
                    return 'Az önce'
                  } else if (diffInMinutes < 60) {
                    return `${diffInMinutes} dakika önce`
                  } else if (diffInHours < 24) {
                    return `${diffInHours} saat önce`
                  } else if (diffInDays < 7) {
                    return `${diffInDays} gün önce`
                  } else if (diffInDays < 30) {
                    const weeks = Math.floor(diffInDays / 7)
                    return `${weeks} hafta önce`
                  } else if (diffInDays < 365) {
                    const months = Math.floor(diffInDays / 30)
                    return `${months} ay önce`
                  } else {
                    const years = Math.floor(diffInDays / 365)
                    return `${years} yıl önce`
                  }
                } catch (error) {
                  return 'Tarih hatası'
                }
              })()}
            </div>
          </div>
          <div className="text-xs font-medium">
            {isReply ? (
              <div className="flex items-center gap-2">
                <span className="text-blue-600 dark:text-blue-400">↳</span>
                <span className="text-muted-foreground">Yanıt:</span>
                <span>{originalSubject}</span>
              </div>
            ) : (
              mail.subject
            )}
          </div>
        </div>
        <div className="line-clamp-2 text-xs text-muted-foreground">
          {mail.content ? mail.content.substring(0, 200) + (mail.content.length > 200 ? '...' : '') : 'İçerik yok'}
        </div>
        {mail.labels.length ? (
          <div className="flex items-center gap-2">
            {mail.labels.map((label) => (
              <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                {translateLabel(label)}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
    </MailContextMenu>
  )
}

function getBadgeVariantFromLabel(
  label: string
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default"
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline"
  }

  return "secondary"
}
