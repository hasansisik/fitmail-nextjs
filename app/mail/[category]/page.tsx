"use client"

import Image from "next/image"
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getMailsByCategory, getMailsByLabelCategory, getMailStats } from "@/redux/actions/mailActions"
import { Mail } from "@/components/mail"

interface MailCategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default function MailCategoryPage({ params }: MailCategoryPageProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.user)
  
  // Mail state'ini Redux'tan al
  const mails = useAppSelector((state) => state.mail.mails || [])
  const mailsLoading = useAppSelector((state) => state.mail.mailsLoading || false)
  const mailsError = useAppSelector((state) => state.mail.mailsError)
  
  // Kategori state'i
  const [category, setCategory] = React.useState<string>("")
  const [categoryTitle, setCategoryTitle] = React.useState<string>("Yükleniyor...")

  // Kategori başlıklarını tanımla
  const getCategoryTitle = (category: string) => {
    const titles: Record<string, string> = {
      inbox: "Gelen Kutusu",
      sent: "Gönderilenler",
      drafts: "Taslaklar", 
      spam: "Spam",
      trash: "Çöp Kutusu",
      archive: "Arşiv",
      social: "Sosyal",
      updates: "Güncellemeler",
      forums: "Forumlar",
      shopping: "Alışveriş",
      promotions: "Promosyonlar"
    }
    return titles[category] || "Bilinmeyen Kategori"
  }

  // Kategori değiştiğinde mailleri yükle
  useEffect(() => {
    if (user && params) {
      params.then(({ category: categoryParam }) => {
        console.log('Category page loading mails for:', categoryParam)
        
        // Kategori state'ini güncelle
        setCategory(categoryParam)
        setCategoryTitle(getCategoryTitle(categoryParam))
        
        // Kategori sayfaları için label category kullan
        if (['social', 'updates', 'forums', 'shopping', 'promotions'].includes(categoryParam)) {
          dispatch(getMailsByLabelCategory({
            category: categoryParam,
            page: 1,
            limit: 50
          }))
        } else {
          // Klasör sayfaları için normal category kullan
          dispatch(getMailsByCategory({
            folder: categoryParam,
            page: 1,
            limit: 50
          }))
        }
        
        // Mail stats'ı da güncelle
        dispatch(getMailStats())
      })
    }
  }, [dispatch, user, params])

  return (
    <div className="h-full flex flex-col">
      <Mail
        mails={mails}
        mailsLoading={mailsLoading}
        mailsError={mailsError}
        defaultLayout={undefined}
        defaultCollapsed={false}
        navCollapsedSize={4}
        categoryTitle={categoryTitle}
        listOnly={true}
      />
    </div>
  )
}
