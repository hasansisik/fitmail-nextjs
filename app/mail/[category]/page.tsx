"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { getMailsByCategory } from "@/redux/actions/userActions"

import { Mail } from "@/components/mail"
import { accounts, mails } from "../data"

interface MailCategoryPageProps {
  params: {
    category: string
  }
}

export default function MailCategoryPage({ params }: MailCategoryPageProps) {
  const dispatch = useAppDispatch()
  const { user, loading } = useAppSelector((state) => state.user)
  const { category } = params
  const [categoryMails, setCategoryMails] = useState<any[]>([])
  const [mailsLoading, setMailsLoading] = useState(false)

  useEffect(() => {
    // Kategori maillerini yükle
    const loadCategoryMails = async () => {
      if (!user) return

      setMailsLoading(true)
      try {
        const result = await dispatch(getMailsByCategory({ 
          folder: category,
          page: 1,
          limit: 50
        })).unwrap()
        
        setCategoryMails(result.mails || [])
      } catch (error) {
        console.error("Failed to load category mails:", error)
        // Fallback to static data
        setCategoryMails(mails.filter(mail => mail.category === category))
      } finally {
        setMailsLoading(false)
      }
    }

    loadCategoryMails()
  }, [dispatch, category, user])

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

  // Loading state için fallback data
  const fallbackMails = mails.filter(mail => mail.category === category)
  const displayMails = categoryMails.length > 0 ? categoryMails : fallbackMails

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
  if (loading || mailsLoading) {
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
          mails={displayMails}
          defaultLayout={undefined}
          defaultCollapsed={false}
          navCollapsedSize={4}
          categoryTitle={getCategoryTitle(category)}
        />
      </div>
    </>
  )
}
