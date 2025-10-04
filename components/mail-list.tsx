import { ScrollArea } from "@/components/ui/scroll-area"
import { Mail } from "@/app/dashboard/mail/data"
import { useMail } from "@/app/dashboard/mail/use-mail"
import { MailItem } from "@/components/mail-item"

interface MailListProps {
  items: Mail[]
}

export function MailList({ items }: MailListProps) {
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
          <MailItem
            key={item.id}
            mail={item}
            onAction={handleMailAction}
          />
        ))}
      </div>
    </ScrollArea>
  )
}
