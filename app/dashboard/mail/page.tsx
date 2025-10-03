"use client"

import Image from "next/image"
import { useAppSelector } from "@/redux/hook"

import { Mail } from "@/components/mail"
import { accounts, mails } from "./data"

export default function MailPage() {
  const { user, loading } = useAppSelector((state) => state.user)

  // Gelen kutusu mailleri filtrele
  const inboxMails = mails.filter(mail => mail.category === "inbox")

  // Kullanıcı bilgilerini accounts'a ekle
  const userAccounts = user ? [
    {
      label: `${user.name} ${user.surname}`,
      email: user.email,
      icon: (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
          {user.name?.charAt(0)}{user.surname?.charAt(0)}
        </div>
      )
    },
    ...accounts
  ] : accounts

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

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
          accounts={userAccounts}
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
