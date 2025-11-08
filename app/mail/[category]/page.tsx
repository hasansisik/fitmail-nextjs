"use client"

import Image from "next/image"
import React, { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getMailsByCategory, getMailsByLabelCategory, getMailStats, getScheduledMails } from "@/redux/actions/mailActions"
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
  const [resolvedCategory, setResolvedCategory] = React.useState<string | null>(null)

  // Kategori başlıklarını tanımla
  const getCategoryTitle = React.useCallback((category: string) => {
    const titles: Record<string, string> = {
      inbox: "Gelen Kutusu",
      sent: "Gönderilenler",
      scheduled: "Planlanan",
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
  }, [])

  // Params'ı bir kez resolve et
  useEffect(() => {
    let isMounted = true
    
    params.then(({ category: categoryParam }) => {
      if (isMounted) {
        setResolvedCategory(categoryParam)
        setCategory(categoryParam)
        setCategoryTitle(getCategoryTitle(categoryParam))
      }
    })
    
    return () => {
      isMounted = false
    }
  }, [params, getCategoryTitle])

  // Kategori değiştiğinde mailleri yükle (sadece bir kez)
  useEffect(() => {
    if (!user || !resolvedCategory) return
    
    // Kategori sayfaları için label category kullan
    if (['social', 'updates', 'forums', 'shopping', 'promotions'].includes(resolvedCategory)) {
      dispatch(getMailsByLabelCategory({
        category: resolvedCategory,
        page: 1,
        limit: 50
      }))
    } 
    // Planlanan mailler için özel action kullan
    else if (resolvedCategory === 'scheduled') {
      dispatch(getScheduledMails({
        page: 1,
        limit: 50
      }))
    } 
    else {
      // Klasör sayfaları için normal category kullan
      dispatch(getMailsByCategory({
        folder: resolvedCategory,
        page: 1,
        limit: 50
      }))
    }
    
    // Mail stats'ı da güncelle
    dispatch(getMailStats())
  }, [dispatch, user, resolvedCategory])

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
