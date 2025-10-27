"use client"

import Image from "next/image"
import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getMailsByCategory, getMailStats } from "@/redux/actions/mailActions"
import { Mail } from "@/components/mail"

export default function MailPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.user)
  
  // Mail state'ini Redux'tan al
  const mails = useAppSelector((state) => state.mail.mails || [])
  const mailsLoading = useAppSelector((state) => state.mail.mailsLoading || false)
  const mailsError = useAppSelector((state) => state.mail.mailsError)

  useEffect(() => {
    // Sayfa yüklendiğinde gelen kutusu maillerini çek
    if (user) {
      dispatch(getMailsByCategory({
        folder: "inbox",
        page: 1,
        limit: 50
      }))
      dispatch(getMailStats())
    }
  }, [dispatch, user])

  return (
    <div className="h-full flex flex-col page-transition">
      <Mail
        mails={mails}
        mailsLoading={mailsLoading}
        mailsError={mailsError}
        defaultLayout={undefined}
        defaultCollapsed={false}
        navCollapsedSize={4}
        categoryTitle="Gelen Kutusu"
      />
    </div>
  )
}
