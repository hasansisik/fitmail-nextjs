import { ComponentProps } from "react"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Mail } from "@/app/dashboard/mail/data"
import { useMail } from "@/app/dashboard/mail/use-mail"
import { MailContextMenu } from "@/components/mail-context-menu"

interface MailItemProps {
  mail: Mail
  onAction: (action: string, mailId: string, data?: any) => void
}

export function MailItem({ mail, onAction }: MailItemProps) {
  const [mailState, { selectMail }] = useMail()

  const handleClick = (e: React.MouseEvent) => {
    // Sadece sol tık için mail seç
    e.preventDefault()
    e.stopPropagation()
    selectMail(mail.id)
  }

  return (
    <MailContextMenu
      mail={mail}
      onAction={onAction}
    >
      <div
        className={cn(
          "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent w-full cursor-pointer",
          mailState.selected === mail.id && "bg-muted"
        )}
        onClick={handleClick}
      >
        <div className="flex w-full flex-col gap-1">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="font-semibold">{mail.name}</div>
              {!mail.read && (
                <span className="flex h-2 w-2 rounded-full bg-blue-600" />
              )}
            </div>
            <div
              className={cn(
                "ml-auto text-xs",
                mailState.selected === mail.id
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {formatDistanceToNow(new Date(mail.date), {
                addSuffix: true,
              })}
            </div>
          </div>
          <div className="text-xs font-medium">{mail.subject}</div>
        </div>
        <div className="line-clamp-2 text-xs text-muted-foreground">
          {mail.text.substring(0, 300)}
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
