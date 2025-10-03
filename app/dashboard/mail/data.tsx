export const mails = [
  // Gelen Kutusu - Genel Mailler
  {
    id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
    name: "William Smith",
    email: "williamsmith@example.com",
    subject: "Yarın Toplantı",
    text: "Merhaba, projeyi görüşmek için yarın bir toplantı yapalım. Proje detaylarını inceliyorum ve paylaşmak istediğim bazı fikirlerim var. Projenin başarısı için bir sonraki adımlarımızda uyumlu olmamız çok önemli.\n\nLütfen sorularınız veya görüşlerinizle hazırlıklı gelin. Toplantımızı dört gözle bekliyorum!\n\nSaygılarımla, William",
    date: "2023-10-22T09:00:00",
    read: true,
    labels: ["toplantı", "iş", "önemli"],
    category: "inbox",
  },
  {
    id: "110e8400-e29b-11d4-a716-446655440000",
    name: "Alice Smith",
    email: "alicesmith@example.com",
    subject: "Yanıt: Proje Güncellemesi",
    text: "Proje güncellemesi için teşekkürler. Harika görünüyor! Raporu inceledim ve ilerleme etkileyici. Ekip harika bir iş çıkardı ve herkesin gösterdiği çabayı takdir ediyorum.\n\nEkli belgede yer alacak birkaç küçük önerim var.\n\nBunları bir sonraki toplantımızda tartışalım. Mükemmel işe devam edin!\n\nSaygılarımla, Alice",
    date: "2023-10-22T10:30:00",
    read: true,
    labels: ["iş", "önemli"],
    category: "inbox",
  },
  {
    id: "3e7c3f6d-bdf5-46ae-8d90-171300f27ae2",
    name: "Bob Johnson",
    email: "bobjohnson@example.com",
    subject: "Hafta Sonu Planları",
    text: "Hafta sonu için planların var mı? Yakındaki dağlarda yürüyüş yapmayı düşünüyordum. Açık havada eğlenmeyeli uzun zaman oldu.\n\nİlgileniyorsan, bana haber ver, detayları planlayabiliriz. Rahatlamak ve doğanın tadını çıkarmak için harika bir yol olacak.\n\nYanıtını dört gözle bekliyorum!\n\nEn iyisi, Bob",
    date: "2023-04-10T11:45:00",
    read: true,
    labels: ["kişisel"],
    category: "inbox",
  },
  {
    id: "61c35085-72d7-42b4-8d62-738f700d4b92",
    name: "Emily Davis",
    email: "emilydavis@example.com",
    subject: "Yanıt: Bütçe Hakkında Soru",
    text: "Yaklaşan proje için bütçe hakkında bir sorum var. Kaynak tahsisinde bir tutarsızlık var gibi görünüyor.\n\nBütçe raporunu inceledim ve projenin kalitesinden ödün vermeden harcamalarımızı optimize edebileceğimiz birkaç alan belirledim.\n\nReferansınız için detaylı bir analiz ekledim. Bunu bir sonraki toplantımızda daha detaylı tartışalım.\n\nTeşekkürler, Emily",
    date: "2023-03-25T13:15:00",
    read: false,
    labels: ["iş", "bütçe"],
    category: "inbox",
  },
  {
    id: "8f7b5db9-d935-4e42-8e05-1f1d0a3dfb97",
    name: "Michael Wilson",
    email: "michaelwilson@example.com",
    subject: "Önemli Duyuru",
    text: "Ekip toplantımızda yapmak istediğim önemli bir duyurum var. Yaklaşan ürün lansmanına yaklaşımımızda stratejik bir değişiklikle ilgili. Beta test kullanıcılarımızdan değerli geri bildirimler aldık ve müşterilerimizin ihtiyaçlarını daha iyi karşılamak için bazı ayarlamalar yapma zamanının geldiğine inanıyorum.\n\nBu değişiklik başarımız için çok önemli ve bunu ekip ile tartışmayı dört gözle bekliyorum. Lütfen toplantı sırasında görüşlerinizi paylaşmaya hazır olun.\n\nSaygılarımla, Michael",
    date: "2023-03-10T15:00:00",
    read: false,
    labels: ["toplantı", "iş", "önemli"],
    category: "inbox",
  },

  // Taslaklar
  {
    id: "draft-1",
    name: "Sen",
    email: "sen@example.com",
    subject: "Proje Raporu Taslağı",
    text: "Bu hafta proje ilerlemesi hakkında detaylı bir rapor hazırladım. Ana başarılarımız ve karşılaştığımız zorluklar...",
    date: "2023-10-23T14:30:00",
    read: true,
    labels: ["iş", "rapor"],
    category: "drafts",
  },
  {
    id: "draft-2",
    name: "Sen",
    email: "sen@example.com",
    subject: "Ekip Toplantısı Notları",
    text: "Bugünkü toplantıda ele aldığımız konular:\n1. Proje zaman çizelgesi\n2. Bütçe güncellemeleri\n3. Yeni üye ekleme...",
    date: "2023-10-23T16:45:00",
    read: true,
    labels: ["toplantı", "notlar"],
    category: "drafts",
  },
  {
    id: "draft-3",
    name: "Sen",
    email: "sen@example.com",
    subject: "Müşteri Sunumu",
    text: "Yarınki müşteri sunumu için hazırladığım slaytlar. Ana noktalar:\n- Proje özeti\n- İlerleme durumu\n- Gelecek planları...",
    date: "2023-10-23T18:20:00",
    read: true,
    labels: ["sunum", "müşteri"],
    category: "drafts",
  },

  // Gönderilenler
  {
    id: "sent-1",
    name: "Sen",
    email: "sen@example.com",
    subject: "Proje Durumu Güncellemesi",
    text: "Merhaba ekip,\n\nBu hafta proje ilerlemesi hakkında güncelleme paylaşmak istiyorum. Ana hedeflerimize ulaşma konusunda iyi bir ilerleme kaydettik...",
    date: "2023-10-22T11:00:00",
    read: true,
    labels: ["iş", "güncelleme"],
    category: "sent",
  },
  {
    id: "sent-2",
    name: "Sen",
    email: "sen@example.com",
    subject: "Toplantı Davetiyesi",
    text: "Merhaba,\n\nYarın saat 14:00'da proje değerlendirme toplantısı yapacağız. Lütfen hazırlıklı gelin...",
    date: "2023-10-21T15:30:00",
    read: true,
    labels: ["toplantı", "davetiye"],
    category: "sent",
  },

  // Spam
  {
    id: "spam-1",
    name: "Kazanan Sen!",
    email: "kazanan@spam.com",
    subject: "1 Milyon TL Kazandınız!",
    text: "Tebrikler! Büyük ödülü kazandınız. Hemen tıklayın ve paranızı alın!",
    date: "2023-10-20T08:00:00",
    read: false,
    labels: ["spam"],
    category: "spam",
  },
  {
    id: "spam-2",
    name: "Ücretsiz Kredi",
    email: "kredi@spam.com",
    subject: "Hemen 50.000 TL Kredi Alın",
    text: "Hiçbir belge istemeden, anında onay! Tıklayın ve kredinizi alın!",
    date: "2023-10-19T12:00:00",
    read: false,
    labels: ["spam", "kredi"],
    category: "spam",
  },
  {
    id: "spam-3",
    name: "Süper Fırsat",
    email: "firsat@spam.com",
    subject: "Son 24 Saat! %90 İndirim",
    text: "Kaçırılmayacak fırsat! Tüm ürünlerde %90 indirim. Hemen alışverişe başlayın!",
    date: "2023-10-18T20:00:00",
    read: false,
    labels: ["spam", "indirim"],
    category: "spam",
  },

  // Çöp Kutusu
  {
    id: "trash-1",
    name: "Eski Müşteri",
    email: "eski@musteri.com",
    subject: "Eski Proje Hakkında",
    text: "Geçen yılki proje hakkında bir sorum var...",
    date: "2022-05-15T10:00:00",
    read: true,
    labels: ["eski"],
    category: "trash",
  },

  // Arşiv
  {
    id: "archive-1",
    name: "Tamamlanan Proje",
    email: "proje@tamamlandi.com",
    subject: "Proje Başarıyla Tamamlandı",
    text: "Proje başarıyla tamamlandı. Tüm ekip üyelerine teşekkürler...",
    date: "2023-08-15T16:00:00",
    read: true,
    labels: ["tamamlandı", "proje"],
    category: "archive",
  },

  // Sosyal
  {
    id: "social-1",
    name: "LinkedIn",
    email: "noreply@linkedin.com",
    subject: "Yeni Bağlantı İsteği",
    text: "Ahmet Yılmaz sizinle bağlantı kurmak istiyor...",
    date: "2023-10-23T09:15:00",
    read: false,
    labels: ["sosyal", "linkedin"],
    category: "social",
  },
  {
    id: "social-2",
    name: "Facebook",
    email: "noreply@facebook.com",
    subject: "Yeni Mesaj Bildirimi",
    text: "Arkadaşınız Mehmet'ten yeni bir mesaj aldınız...",
    date: "2023-10-23T08:30:00",
    read: false,
    labels: ["sosyal", "facebook"],
    category: "social",
  },
  {
    id: "social-3",
    name: "Twitter",
    email: "noreply@twitter.com",
    subject: "Yeni Takipçi",
    text: "Sizi 5 kişi takip etmeye başladı...",
    date: "2023-10-22T19:45:00",
    read: false,
    labels: ["sosyal", "twitter"],
    category: "social",
  },

  // Güncellemeler
  {
    id: "updates-1",
    name: "GitHub",
    email: "noreply@github.com",
    subject: "Yeni Commit Bildirimi",
    text: "Proje deposunda yeni bir commit yapıldı...",
    date: "2023-10-23T14:20:00",
    read: false,
    labels: ["güncelleme", "github"],
    category: "updates",
  },
  {
    id: "updates-2",
    name: "Slack",
    email: "noreply@slack.com",
    subject: "Yeni Mesaj Bildirimi",
    text: "#genel kanalında yeni mesajlar var...",
    date: "2023-10-23T13:10:00",
    read: false,
    labels: ["güncelleme", "slack"],
    category: "updates",
  },

  // Forumlar
  {
    id: "forums-1",
    name: "Stack Overflow",
    email: "noreply@stackoverflow.com",
    subject: "Soru Yanıtlandı",
    text: "Soru sorduğunuz konuda yeni bir yanıt aldınız...",
    date: "2023-10-23T12:00:00",
    read: false,
    labels: ["forum", "stackoverflow"],
    category: "forums",
  },
  {
    id: "forums-2",
    name: "Reddit",
    email: "noreply@reddit.com",
    subject: "Yeni Yorum Bildirimi",
    text: "Gönderinize yeni bir yorum yapıldı...",
    date: "2023-10-22T21:30:00",
    read: false,
    labels: ["forum", "reddit"],
    category: "forums",
  },

  // Alışveriş
  {
    id: "shopping-1",
    name: "Amazon",
    email: "noreply@amazon.com",
    subject: "Siparişiniz Kargoya Verildi",
    text: "Siparişiniz kargoya verildi. Takip numarası: 123456789...",
    date: "2023-10-23T10:00:00",
    read: false,
    labels: ["alışveriş", "amazon"],
    category: "shopping",
  },
  {
    id: "shopping-2",
    name: "Trendyol",
    email: "noreply@trendyol.com",
    subject: "İndirim Fırsatı",
    text: "Favori markalarınızda %30'a varan indirimler...",
    date: "2023-10-22T15:00:00",
    read: false,
    labels: ["alışveriş", "indirim"],
    category: "shopping",
  },

  // Promosyonlar
  {
    id: "promotions-1",
    name: "Netflix",
    email: "noreply@netflix.com",
    subject: "Yeni Dizi Önerileri",
    text: "Sizin için seçtiğimiz yeni diziler...",
    date: "2023-10-23T18:00:00",
    read: false,
    labels: ["promosyon", "netflix"],
    category: "promotions",
  },
  {
    id: "promotions-2",
    name: "Spotify",
    email: "noreply@spotify.com",
    subject: "Haftalık Müzik Önerileri",
    text: "Bu hafta için size özel müzik listesi...",
    date: "2023-10-22T20:00:00",
    read: false,
    labels: ["promosyon", "müzik"],
    category: "promotions",
  },
]

export const accounts = [
  {
    label: "Alicia Koch",
    email: "alicia.koch@email.com",
    icon: (
      <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
        <path
          fill="currentColor"
          d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75-3 3m0 0 3 3m-3-3h11.25m-1.5 0V9.75m0 0h-7.5m7.5 0v7.5"
        />
      </svg>
    ),
  },
  {
    label: "John Doe",
    email: "john.doe@email.com",
    icon: (
      <svg role="img" viewBox="0 0 24 24" className="h-4 w-4">
        <path
          fill="currentColor"
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        />
      </svg>
    ),
  },
]

export type Mail = (typeof mails)[number]

export type Account = (typeof accounts)[number]