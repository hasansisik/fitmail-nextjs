import { ComponentProps } from "react"
import { formatDistanceToNow } from "date-fns/formatDistanceToNow"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mail } from "@/app/dashboard/mail/data"
import { useMail } from "@/app/dashboard/mail/use-mail"
import { MailContextMenu } from "@/components/mail-context-menu"

interface MailListProps {
  items: Mail[]
}

export function MailList({ items }: MailListProps) {
  const [mail, { selectMail }] = useMail()

  const handleMailAction = (action: string, mailId: string, data?: any) => {
    console.log(`Action: ${action}, Mail ID: ${mailId}`, data)
    
    switch (action) {
      case "reply":
        // Implement reply functionality
        break
      case "replyAll":
        // Implement reply all functionality
        break
      case "forward":
        // Implement forward functionality
        break
      case "forwardAsAttachment":
        // Implement forward as attachment functionality
        break
      case "archive":
        // Implement archive functionality
        break
      case "delete":
        // Implement delete functionality
        break
      case "markAsRead":
        // Implement mark as read functionality
        break
      case "snooze":
        // Implement snooze functionality
        break
      case "addToTasks":
        // Implement add to tasks functionality
        break
      case "move":
        // Implement move functionality
        console.log(`Moving mail to: ${data?.category}`)
        break
      case "createNewCategory":
        // Implement create new category functionality
        break
      case "editCategories":
        // Implement edit categories functionality
        break
      case "toggleLabel":
        // Implement toggle label functionality
        console.log(`Toggling label: ${data?.label}, checked: ${data?.checked}`)
        break
      case "createNewLabel":
        // Implement create new label functionality
        break
      case "editLabels":
        // Implement edit labels functionality
        break
      case "mute":
        // Implement mute functionality
        break
      default:
        console.log(`Unknown action: ${action}`)
    }
  }

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.map((item) => (
          <MailContextMenu
            key={item.id}
            mail={item}
            onAction={handleMailAction}
          >
            <DropdownMenuTrigger asChild>
              <div
                className={cn(
                  "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent w-full cursor-pointer",
                  mail.selected === item.id && "bg-muted"
                )}
                onClick={(e) => {
                  // Sol tık - mail detayını aç
                  e.preventDefault()
                  selectMail(item.id)
                }}
              >
                <div className="flex w-full flex-col gap-1">
                  <div className="flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-semibold">{item.name}</div>
                      {!item.read && (
                        <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "ml-auto text-xs",
                        mail.selected === item.id
                          ? "text-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {formatDistanceToNow(new Date(item.date), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="text-xs font-medium">{item.subject}</div>
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {item.text.substring(0, 300)}
                </div>
                {item.labels.length ? (
                  <div className="flex items-center gap-2">
                    {item.labels.map((label) => (
                      <Badge key={label} variant={getBadgeVariantFromLabel(label)}>
                        {label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </DropdownMenuTrigger>
          </MailContextMenu>
        ))}
      </div>
    </ScrollArea>
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
