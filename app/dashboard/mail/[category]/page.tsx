import Image from "next/image"
import { mails, accounts } from "../data"
import { Mail } from "@/components/mail"

interface MailCategoryPageProps {
  params: Promise<{
    category: string
  }>
}

export default async function MailCategoryPage({ params }: MailCategoryPageProps) {
  const { category } = await params

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

  // Kategoriye göre mailleri filtrele
  const categoryMails = mails.filter(mail => mail.category === category)

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
          mails={categoryMails}
          defaultLayout={undefined}
          defaultCollapsed={false}
          navCollapsedSize={4}
          categoryTitle={getCategoryTitle(category)}
        />
      </div>
    </>
  )
}
