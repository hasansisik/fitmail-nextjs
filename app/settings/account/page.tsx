"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Calendar, Shield, Trash2 } from "lucide-react"

export default function AccountSettingsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "Hasan Yılmaz",
    email: "hasan@fitmail.com",
    phone: "+90 555 123 45 67",
    birthDate: "1990-01-15",
    location: "İstanbul, Türkiye"
  })

  const handleSave = () => {
    setIsEditing(false)
    // Burada API çağrısı yapılabilir
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Form verilerini sıfırla
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hesap Ayarları</h1>
        <p className="text-muted-foreground text-sm">
          Hesap bilgilerinizi görüntüleyin ve düzenleyin
        </p>
      </div>
      <Separator className="my-6" />

      {/* Profile Section */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <User className="h-4 w-4" />
            Profil Bilgileri
          </h2>
          <p className="text-sm text-muted-foreground">
            Kişisel bilgilerinizi yönetin
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback className="text-sm">HY</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h3 className="text-base font-medium">{formData.name}</h3>
              <p className="text-sm text-muted-foreground">{formData.email}</p>
              <div className="flex gap-1">
                <Badge variant="secondary" className="text-xs">Premium Üye</Badge>
                <Badge variant="outline" className="text-xs">Doğrulanmış</Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{formData.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{formData.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{formData.phone}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Doğum Tarihi</Label>
              {isEditing ? (
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{formData.birthDate}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="location">Konum</Label>
              {isEditing ? (
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              ) : (
                <p className="text-sm py-2 px-3 bg-muted rounded-md">{formData.location}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave}>Kaydet</Button>
                <Button variant="outline" onClick={handleCancel}>İptal</Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
            )}
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Security Section */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-4 w-4" />
            Güvenlik
          </h2>
          <p className="text-sm text-muted-foreground">
            Hesap güvenliğinizi yönetin
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Şifre</h4>
              <p className="text-sm text-muted-foreground">Son değişiklik: 3 ay önce</p>
            </div>
            <Button variant="outline" size="sm">Değiştir</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">İki Faktörlü Doğrulama</h4>
              <p className="text-sm text-muted-foreground">Hesabınızı ekstra güvenlik ile koruyun</p>
            </div>
            <Button variant="outline" size="sm">Etkinleştir</Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Oturum Açma Geçmişi</h4>
              <p className="text-sm text-muted-foreground">Son oturum açma işlemlerinizi görüntüleyin</p>
            </div>
            <Button variant="outline" size="sm">Görüntüle</Button>
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Danger Zone */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-destructive">
            <Trash2 className="h-4 w-4" />
            Tehlikeli Bölge
          </h2>
          <p className="text-sm text-muted-foreground">
            Bu işlemler geri alınamaz
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Hesabı Sil</h4>
              <p className="text-sm text-muted-foreground">
                Hesabınızı ve tüm verilerinizi kalıcı olarak silin
              </p>
            </div>
            <Button variant="destructive" size="sm">Hesabı Sil</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
