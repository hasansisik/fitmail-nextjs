"use client"

import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getStarredMails, getMailStats } from "@/redux/actions/mailActions"
import { Mail } from "@/components/mail"

export default function StarredMailPage() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.user)
  
  // Mail state'ini Redux'tan al
  const mails = useAppSelector((state) => state.mail.mails || [])
  const mailsLoading = useAppSelector((state) => state.mail.mailsLoading || false)
  const mailsError = useAppSelector((state) => state.mail.mailsError)

  // Yıldızlı mailleri yükle
  useEffect(() => {
    if (user) {
      
      dispatch(getStarredMails({
        page: 1,
        limit: 50
      }))
      
      // Mail stats'ı da güncelle
      dispatch(getMailStats())
    }
  }, [dispatch, user])

  return (
    <div className="h-full flex flex-col">
      <Mail
        mails={mails}
        mailsLoading={mailsLoading}
        mailsError={mailsError}
        defaultLayout={undefined}
        defaultCollapsed={false}
        navCollapsedSize={4}
        categoryTitle="Yıldızlı"
        listOnly={true}
      />
    </div>
  )
}

