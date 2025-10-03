import Image from "next/image"
import { Mail } from "@/components/mail"
import { accounts, mails } from "./data"

export default function MailPage() {
  // Gelen kutusu mailleri filtrele
  const inboxMails = mails.filter(mail => mail.category === "inbox")

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/mail-dark.png"
          width={1280}
          height={727}
          alt="Mail"
          className="hidden dark:block"
        />
        <Image
          src="/examples/mail-light.png"
          width={1280}
          height={727}
          alt="Mail"
          className="block dark:hidden"
        />
      </div>
      <div className="hidden flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={inboxMails}
          defaultLayout={undefined}
          defaultCollapsed={false}
          navCollapsedSize={4}
          categoryTitle="Gelen Kutusu"
        />
      </div>
    </>
  )
}
