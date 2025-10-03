"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Mail, Calendar, Shield, Trash2, Eye, EyeOff } from "lucide-react"

export default function AccountSettingsPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordStep, setPasswordStep] = useState<'current' | 'new'>('current')
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState('')
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

  // Şifre değiştirme fonksiyonları
  const handlePasswordChange = () => {
    setShowPasswordDialog(true)
    setPasswordStep('current')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
  }

  const handleCurrentPasswordSubmit = () => {
    // Burada gerçek API çağrısı yapılacak
    if (passwordData.currentPassword === '123456') { // Örnek doğrulama
      setPasswordStep('new')
      setPasswordError('')
    } else {
      setPasswordError('Mevcut şifre yanlış')
    }
  }

  const handleNewPasswordSubmit = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalı')
      return
    }
    
    // Burada gerçek API çağrısı yapılacak
    console.log('Password changed successfully')
    setShowPasswordDialog(false)
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
    setPasswordStep('current')
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handlePasswordDialogClose = () => {
    setShowPasswordDialog(false)
    setPasswordStep('current')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
    setShowPasswords({ current: false, new: false, confirm: false })
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
            <Button variant="outline" size="sm" onClick={handlePasswordChange}>Değiştir</Button>
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

      {/* Şifre Değiştirme Dialog'u */}
      <Dialog open={showPasswordDialog} onOpenChange={handlePasswordDialogClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {passwordStep === 'current' ? 'Mevcut Şifrenizi Girin' : 'Yeni Şifre Belirleyin'}
            </DialogTitle>
            <DialogDescription>
              {passwordStep === 'current' 
                ? 'Şifrenizi değiştirmek için önce mevcut şifrenizi girin.'
                : 'Hesabınız için yeni bir şifre belirleyin.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {passwordStep === 'current' ? (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    placeholder="Mevcut şifrenizi girin"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      placeholder="Yeni şifrenizi girin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('new')}
                    >
                      {showPasswords.new ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      placeholder="Yeni şifrenizi tekrar girin"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => togglePasswordVisibility('confirm')}
                    >
                      {showPasswords.confirm ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handlePasswordDialogClose}>
              İptal
            </Button>
            <Button 
              onClick={passwordStep === 'current' ? handleCurrentPasswordSubmit : handleNewPasswordSubmit}
              disabled={
                passwordStep === 'current' 
                  ? !passwordData.currentPassword 
                  : !passwordData.newPassword || !passwordData.confirmPassword
              }
            >
              {passwordStep === 'current' ? 'Devam Et' : 'Şifreyi Değiştir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
