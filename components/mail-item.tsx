import { ComponentProps } from "react"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { MailContextMenu } from "@/components/mail-context-menu"

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
                  
                  // Türkçe format için
                  const now = new Date()
                  const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60)
                  
                  if (diffInHours < 1) {
                    return 'Az önce'
                  } else if (diffInHours < 24) {
                    return `${Math.floor(diffInHours)} saat önce`
                  } else if (diffInHours < 168) { // 7 gün
                    return `${Math.floor(diffInHours / 24)} gün önce`
                  } else {
                    return date.toLocaleDateString('tr-TR', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: '2-digit' 
                    })
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
                {label}
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
