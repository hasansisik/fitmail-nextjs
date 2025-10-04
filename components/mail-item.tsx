import { ComponentProps } from "react"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useMail } from "@/app/dashboard/mail/use-mail"
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
    id: string
    name: string
    type: string
    size: number
    url: string
  }>
  labels: string[]
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
}

export function MailItem({ mail, onAction }: MailItemProps) {
  const [mailState, { selectMail }] = useMail()

  const handleClick = (e: React.MouseEvent) => {
    // Sadece sol tık için mail seç
    e.preventDefault()
    e.stopPropagation()
    selectMail(mail._id)
  }

  return (
    <MailContextMenu
      mail={mail}
      onAction={onAction}
    >
      <div
        className={cn(
          "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent w-full cursor-pointer",
          mailState.selected === mail._id && "bg-muted"
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
            </div>
            <div
              className={cn(
                "ml-auto text-xs",
                mailState.selected === mail._id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {(() => {
                try {
                  const dateValue = mail.receivedAt || mail.createdAt || mail.updatedAt
                  if (!dateValue) return 'Tarih yok'
                  const date = new Date(dateValue)
                  if (isNaN(date.getTime())) return 'Geçersiz tarih'
                  return formatDistanceToNow(date, { addSuffix: true })
                } catch (error) {
                  return 'Tarih hatası'
                }
              })()}
            </div>
          </div>
          <div className="text-xs font-medium">{mail.subject}</div>
        </div>
        <div className="line-clamp-2 text-xs text-muted-foreground">
          {mail.content ? mail.content.substring(0, 300) : 'İçerik yok'}
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
