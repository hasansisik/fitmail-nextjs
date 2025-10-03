"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface PolicyDialogProps {
  showPolicyDialog: boolean
  setShowPolicyDialog: (show: boolean) => void
  policyType: 'privacy' | 'terms'
  hasScrolledToBottom: boolean
  setHasScrolledToBottom: (scrolled: boolean) => void
  onPolicyAccept: () => void
  onScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

export function PolicyDialog({ 
  showPolicyDialog, 
  setShowPolicyDialog, 
  policyType, 
  hasScrolledToBottom, 
  setHasScrolledToBottom, 
  onPolicyAccept, 
  onScroll 
}: PolicyDialogProps) {
  const renderPrivacyPolicy = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">1. Kişisel Verilerin Toplanması</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Gözde Dijital olarak, hizmetlerimizi sunabilmek için belirli kişisel verilerinizi topluyoruz. Bu veriler arasında adınız, e-posta adresiniz, doğum tarihiniz ve cinsiyet bilginiz bulunmaktadır.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">2. Verilerin Kullanımı</h3>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          Topladığımız kişisel verileri aşağıdaki amaçlarla kullanırız:
        </p>
        <ul className="text-sm text-foreground list-disc list-inside space-y-2 ml-4">
          <li>Hesabınızı oluşturmak ve yönetmek</li>
          <li>E-posta hizmetlerimizi sunmak</li>
          <li>Müşteri desteği sağlamak</li>
          <li>Hizmet kalitemizi artırmak</li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">3. Veri Güvenliği</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri alıyoruz. Verileriniz şifrelenerek saklanır ve yetkisiz erişime karşı korunur.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">4. Veri Paylaşımı</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Kişisel verilerinizi üçüncü taraflarla paylaşmayız, ancak yasal yükümlülüklerimizi yerine getirmek veya mahkeme kararı gereği paylaşım yapmak zorunda kalırsak, bu durumda sizi bilgilendiririz.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">5. Veri Saklama</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Kişisel verilerinizi, hesabınız aktif olduğu sürece saklarız. Hesabınızı sildiğinizde, verileriniz 30 gün içinde sistemimizden tamamen silinir.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">6. Haklarınız</h3>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          KVKK kapsamında aşağıdaki haklara sahipsiniz:
        </p>
        <ul className="text-sm text-foreground list-disc list-inside space-y-2 ml-4">
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>İşlenen kişisel verileriniz hakkında bilgi talep etme</li>
          <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
          <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
          <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
          <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">7. İletişim</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz.
        </p>
      </div>
    </div>
  )

  const renderTermsOfService = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">1. Hizmet Tanımı</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Gözde Dijital, kullanıcılara e-posta hizmeti sunan bir platformdur. Hizmetimizi kullanarak e-posta gönderebilir, alabilir ve yönetebilirsiniz.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">2. Hesap Sorumluluğu</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Hesabınızı oluştururken doğru ve güncel bilgiler vermeniz gerekmektedir. Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle paylaşmayın.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">3. Kullanım Kuralları</h3>
        <p className="text-sm text-foreground leading-relaxed mb-3">
          Hizmetimizi kullanırken aşağıdaki kurallara uymanız gerekmektedir:
        </p>
        <ul className="text-sm text-foreground list-disc list-inside space-y-2 ml-4">
          <li>Yasalara aykırı içerik göndermeyin</li>
          <li>Spam veya zararlı içerik göndermeyin</li>
          <li>Başkalarının haklarını ihlal etmeyin</li>
          <li>Hizmetimizi kötüye kullanmayın</li>
        </ul>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">4. İçerik Sorumluluğu</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Gönderdiğiniz e-postaların içeriğinden siz sorumlusunuz. Yasadışı, zararlı veya uygunsuz içerik gönderdiğinizde hesabınız askıya alınabilir veya kapatılabilir.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">5. Hizmet Kesintileri</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Bakım, güncelleme veya teknik sorunlar nedeniyle hizmetimizde kesintiler yaşanabilir. Bu durumlardan sorumlu değiliz.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">6. Hesap Kapatma</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Hesabınızı istediğiniz zaman kapatabilirsiniz. Hesap kapatma işlemi geri alınamaz ve tüm verileriniz silinir.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">7. Değişiklikler</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Bu kullanım şartlarını önceden bildirim yaparak değiştirebiliriz. Değişiklikler yürürlüğe girdiğinde hizmetimizi kullanmaya devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
        </p>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-3 text-foreground">8. Sorumluluk Sınırı</h3>
        <p className="text-sm text-foreground leading-relaxed">
          Hizmetimizden kaynaklanan doğrudan veya dolaylı zararlardan sorumlu değiliz. Hizmetimizi "olduğu gibi" sunuyoruz.
        </p>
      </div>
    </div>
  )

  return (
    <Dialog open={showPolicyDialog} onOpenChange={(open) => {
      if (!open) {
        setShowPolicyDialog(false)
        setHasScrolledToBottom(false)
      }
    }}>
      <DialogContent className="max-w-3xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="flex-shrink-0 p-6 pb-4">
          <DialogTitle className="text-xl font-bold">
            {policyType === 'privacy' ? 'Gizlilik Politikası' : 'Kullanım Şartları'}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Lütfen aşağıdaki metni tamamen okuyun ve kabul etmek için aşağıya kaydırın.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 px-6">
          <div 
            className="h-full overflow-y-auto pr-2 border rounded-md p-4 bg-muted/30"
            onScroll={onScroll}
          >
            {policyType === 'privacy' ? renderPrivacyPolicy() : renderTermsOfService()}
          </div>
        </div>
        
        <DialogFooter className="flex-shrink-0 p-6 pt-4 border-t bg-background">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowPolicyDialog(false)
                setHasScrolledToBottom(false)
              }}
              className="flex-1 sm:flex-none"
            >
              İptal
            </Button>
            <Button 
              onClick={onPolicyAccept}
              disabled={!hasScrolledToBottom}
              className={`flex-1 sm:flex-none font-semibold transition-all duration-200 ${
                hasScrolledToBottom 
                  ? 'bg-black hover:bg-gray-800 text-white shadow-lg' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {hasScrolledToBottom ? '✓ Kabul Et ve Onayla' : '📖 Metni tamamen okuyun'}
            </Button>
          </div>
          {!hasScrolledToBottom && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Lütfen metni aşağıya kaydırarak tamamen okuyun
            </p>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
