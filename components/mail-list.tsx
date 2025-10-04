import { ScrollArea } from "@/components/ui/scroll-area"
import { useMail } from "@/app/dashboard/mail/use-mail"
import { MailItem } from "@/components/mail-item"

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

interface MailListProps {
  items: ApiMail[]
  loading?: boolean
  error?: string | null
}

export function MailList({ items, loading = false, error = null }: MailListProps) {
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

  if (loading) {
    return (
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Mailler yükleniyor...</div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  if (error) {
    return (
      <ScrollArea className="h-screen">
        <div className="flex flex-col gap-2 p-4 pt-0">
          <div className="flex items-center justify-center h-32">
            <div className="text-destructive">Hata: {error}</div>
          </div>
        </div>
      </ScrollArea>
    )
  }

  return (
    <ScrollArea className="h-screen">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Bu kategoride mail bulunamadı</div>
          </div>
        ) : (
          items.map((item, index) => (
            <MailItem
              key={item._id || `mail-${index}`}
              mail={item}
              onAction={handleMailAction}
            />
          ))
        )}
      </div>
    </ScrollArea>
  )
}
