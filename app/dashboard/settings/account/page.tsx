"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Mail, Calendar, Shield, Trash2, Eye, EyeOff, Edit, CheckCircle, AlertCircle } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { editProfile, changePassword, verifyPassword } from "@/redux/actions/userActions"
import { toast } from "sonner"
import { uploadImageToCloudinary } from "@/utils/cloudinary"
import ReactCrop, { centerCrop, makeAspectCrop, Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

export default function AccountSettingsPage() {
  const dispatch = useAppDispatch()
  const { user, loading, error, message } = useAppSelector((state) => state.user)
  
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
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showCropModal, setShowCropModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const imgRef = useRef<HTMLImageElement>(null)
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    recoveryEmail: "",
    birthDate: "",
    location: "",
    gender: ""
  })
  
  // Mail adresi ayarlama state'leri
  const [mailAddress, setMailAddress] = useState("")
  const [isSettingMail, setIsSettingMail] = useState(false)
  const [mailSetupStatus, setMailSetupStatus] = useState<'idle' | 'checking' | 'available' | 'setting' | 'success' | 'error'>('idle')
  const [mailError, setMailError] = useState("")

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        recoveryEmail: user.recoveryEmail || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
        location: user.address ? `${user.address.city}, ${user.address.state}` : "",
        gender: user.gender || ""
      })
      setAvatarUrl(user.profile?.picture || "")
    }
  }, [user])

  // Show success/error messages
  useEffect(() => {
    if (message) {
      toast.success(message)
    }
    if (error) {
      toast.error(error)
    }
  }, [message, error])

  // Dosya seçme fonksiyonu
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Dosya tipini kontrol et
    if (!file.type.startsWith('image/')) {
      toast.error('Lütfen geçerli bir resim dosyası seçin')
      return
    }

    // Dosya boyutunu kontrol et (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır')
      return
    }

    setSelectedFile(file)
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setShowCropModal(true)
  }

  // Kırpma tamamlandığında
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    )
    setCrop(crop)
  }, [])

  // Kırpılmış resmi canvas'a çizme
  const getCroppedImg = (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      throw new Error('Canvas context not available')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    
    canvas.width = crop.width
    canvas.height = crop.height

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    )

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty')
        }
        resolve(blob)
      }, 'image/jpeg', 0.9)
    })
  }

  // Kırpma işlemini tamamla
  const handleCropComplete = async () => {
    if (!selectedFile || !completedCrop || !imgRef.current) return

    setIsUploading(true)
    try {
      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop)
      const croppedFile = new File([croppedImageBlob], selectedFile.name, {
        type: 'image/jpeg',
      })

      const uploadedUrl = await uploadImageToCloudinary(croppedFile)
      setAvatarUrl(uploadedUrl)
      
      // Otomatik olarak profile güncelle
      await dispatch(editProfile({ picture: uploadedUrl })).unwrap()
      toast.success('Profil fotoğrafı başarıyla güncellendi')
      
      // Modal'ı kapat ve temizle
      setShowCropModal(false)
      setSelectedFile(null)
      setPreviewUrl('')
      setCrop(undefined)
      setCompletedCrop(undefined)
    } catch (error) {
      console.error('Avatar upload failed:', error)
      toast.error('Profil fotoğrafı yüklenirken hata oluştu')
    } finally {
      setIsUploading(false)
    }
  }

  // Modal'ı kapat
  const handleCloseCropModal = () => {
    setShowCropModal(false)
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl('')
    }
    setCrop(undefined)
    setCompletedCrop(undefined)
  }

  const handleSave = async () => {
    try {
      const updateData = {
        name: formData.name,
        surname: formData.surname,
        recoveryEmail: formData.recoveryEmail,
        birthDate: formData.birthDate,
        gender: formData.gender,
        address: {
          city: formData.location.split(',')[0]?.trim() || "",
          state: formData.location.split(',')[1]?.trim() || "",
        }
      }

      await dispatch(editProfile(updateData)).unwrap()
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update failed:', error)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || "",
        surname: user.surname || "",
        email: user.email || "",
        recoveryEmail: user.recoveryEmail || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
        location: user.address ? `${user.address.city}, ${user.address.state}` : "",
        gender: user.gender || ""
      })
    }
  }

  // Şifre değiştirme fonksiyonları
  const handlePasswordChange = () => {
    setShowPasswordDialog(true)
    setPasswordStep('current')
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    setPasswordError('')
  }

  const handleCurrentPasswordSubmit = async () => {
    try {
      setPasswordError('')
      const result = await dispatch(verifyPassword(passwordData.currentPassword)).unwrap()
      
      if (result.isValid) {
        setPasswordStep('new')
        setPasswordError('')
      } else {
        setPasswordError('Mevcut şifre yanlış')
      }
    } catch (error: any) {
      setPasswordError(error || 'Şifre doğrulama sırasında hata oluştu')
    }
  }

  const handleNewPasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Yeni şifreler eşleşmiyor')
      return
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError('Yeni şifre en az 6 karakter olmalı')
      return
    }
    
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })).unwrap()
      
      setShowPasswordDialog(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setPasswordError('')
      setPasswordStep('current')
    } catch (error) {
      setPasswordError('Şifre değiştirme sırasında hata oluştu')
    }
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

  // Mail adresi kontrol etme
  const checkMailAddress = async () => {
    if (!mailAddress) return
    
    setMailSetupStatus('checking')
    setMailError('')
    
    try {
      const response = await fetch('/api/v1/mail/check-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: mailAddress })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMailSetupStatus('available')
      } else {
        setMailSetupStatus('error')
        setMailError(data.message || 'Mail adresi kontrol edilemedi')
      }
    } catch (error) {
      setMailSetupStatus('error')
      setMailError('Mail adresi kontrol edilirken hata oluştu')
    }
  }

  // Mail adresini ayarla
  const setupMailAddress = async () => {
    if (!mailAddress) return
    
    setMailSetupStatus('setting')
    setMailError('')
    
    try {
      const response = await fetch('/api/v1/mail/setup-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: mailAddress })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMailSetupStatus('success')
        toast.success('Mail adresi başarıyla ayarlandı! Artık bu adrese gelen mailleri alabilirsiniz.')
        // User state'ini güncelle
        if (user) {
          user.mailAddress = mailAddress
        }
      } else {
        setMailSetupStatus('error')
        setMailError(data.message || 'Mail adresi ayarlanamadı')
      }
    } catch (error) {
      setMailSetupStatus('error')
      setMailError('Mail adresi ayarlanırken hata oluştu')
    }
  }

  // Mailbox oluştur (sadece mailbox, route değil)
  const createMailbox = async () => {
    if (!mailAddress) return
    
    setMailSetupStatus('setting')
    setMailError('')
    
    try {
      const response = await fetch('/api/v1/mail/create-mailbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ email: mailAddress })
      })
      
      const data = await response.json()
      
      if (data.success) {
        setMailSetupStatus('success')
        toast.success(`Mailbox başarıyla oluşturuldu! Şifre: ${data.password}`)
        // User state'ini güncelle
        if (user) {
          user.mailAddress = mailAddress
        }
      } else {
        setMailSetupStatus('error')
        setMailError(data.message || 'Mailbox oluşturulamadı')
      }
    } catch (error) {
      setMailSetupStatus('error')
      setMailError('Mailbox oluşturulurken hata oluştu')
    }
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
                    <div className="relative">
                      <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                        <AvatarImage src={avatarUrl || "/placeholder-avatar.jpg"} />
                        <AvatarFallback className="text-sm">
                          {formData.name?.[0]}{formData.surname?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        </div>
                      )}
                      {/* Edit Icon */}
                      <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg">
                        <Edit className="h-3 w-3" />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-medium">{formData.name} {formData.surname}</h3>
                      <p className="text-sm text-muted-foreground">{formData.email}</p>
                    </div>
                  </div>

          <Separator />

          <div className="space-y-6">
            {/* Kişisel Bilgiler */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="border-0 bg-muted/50 cursor-not-allowed"
                    readOnly={!isEditing}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="surname">Soyad</Label>
                  <Input
                    id="surname"
                    value={formData.surname}
                    onChange={(e) => setFormData({...formData, surname: e.target.value})}
                    className="border-0 bg-muted/50 cursor-not-allowed"
                    readOnly={!isEditing}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    className="border-0 bg-muted/50 cursor-not-allowed"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">E-posta adresi değiştirilemez</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recoveryEmail">Kurtarıcı E-posta</Label>
                  <Input
                    id="recoveryEmail"
                    type="email"
                    value={formData.recoveryEmail || ""}
                    onChange={(e) => setFormData({...formData, recoveryEmail: e.target.value})}
                    placeholder="Kurtarıcı e-posta adresinizi girin"
                    className="border-0 bg-muted/50 cursor-not-allowed"
                    readOnly={!isEditing}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Kişisel Detaylar */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground">Kişisel Detaylar</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Doğum Tarihi</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                    className="border-0 bg-muted/50 cursor-not-allowed"
                    readOnly={!isEditing}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Cinsiyet</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({...formData, gender: value})}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className="border-0 bg-muted/50 cursor-not-allowed">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Erkek</SelectItem>
                      <SelectItem value="female">Kadın</SelectItem>
                      <SelectItem value="other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Konum</Label>
                  <Input
                    id="location"
                    value={formData.location || ""}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="Şehir, İl"
                    className="border-0 bg-muted/50 cursor-not-allowed"
                    readOnly={!isEditing}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
                <Button variant="outline" onClick={handleCancel} disabled={loading}>
                  İptal
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} disabled={loading}>
                Düzenle
              </Button>
            )}
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Mail Address Section */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-4 w-4" />
            Mail Adresi
          </h2>
          <p className="text-sm text-muted-foreground">
            Mail adresinizi ayarlayın ve gelen mailleri alın
          </p>
        </div>
        <div className="space-y-4">
          {/* Mevcut mail adresi */}
          {user?.mailAddress && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Mail adresiniz: {user.mailAddress}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Bu adrese gelen mailler otomatik olarak alınacak
                </p>
              </div>
            </div>
          )}

          {/* Mail adresi ayarlama */}
          {!user?.mailAddress && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mailAddress">Mail Adresi</Label>
                <div className="flex gap-2">
                  <Input
                    id="mailAddress"
                    type="email"
                    value={mailAddress}
                    onChange={(e) => setMailAddress(e.target.value)}
                    placeholder="ornek@gozdedijital.xyz"
                    className="flex-1"
                    disabled={mailSetupStatus === 'checking' || mailSetupStatus === 'setting'}
                  />
                  <Button
                    onClick={checkMailAddress}
                    disabled={!mailAddress || mailSetupStatus === 'checking' || mailSetupStatus === 'setting'}
                    variant="outline"
                  >
                    {mailSetupStatus === 'checking' ? 'Kontrol Ediliyor...' : 'Kontrol Et'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mail adresiniz @gozdedijital.xyz ile bitmelidir
                </p>
              </div>

              {/* Mail adresi durumu */}
              {mailSetupStatus === 'available' && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      Mail adresi kullanılabilir
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Bu adresi ayarlayabilirsiniz
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={setupMailAddress}
                      disabled={mailSetupStatus === 'setting'}
                      size="sm"
                    >
                      {mailSetupStatus === 'setting' ? 'Ayarlanıyor...' : 'Ayarla (Route + Mailbox)'}
                    </Button>
                    <Button
                      onClick={createMailbox}
                      disabled={mailSetupStatus === 'setting'}
                      size="sm"
                      variant="outline"
                    >
                      {mailSetupStatus === 'setting' ? 'Oluşturuluyor...' : 'Sadece Mailbox Oluştur'}
                    </Button>
                  </div>
                </div>
              )}

              {mailSetupStatus === 'error' && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">
                      Hata
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {mailError}
                    </p>
                  </div>
                </div>
              )}

              {mailSetupStatus === 'success' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      Mail adresi başarıyla ayarlandı!
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Artık {mailAddress} adresine gelen mailleri alabilirsiniz
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
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

      {/* Kırpma Modal'ı */}
      <Dialog open={showCropModal} onOpenChange={handleCloseCropModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profil Fotoğrafını Kırp</DialogTitle>
            <DialogDescription>
              Fotoğrafınızı istediğiniz şekilde kırpın ve kaydedin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewUrl && (
              <div className="flex justify-center">
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={previewUrl}
                    onLoad={onImageLoad}
                    className="max-h-96"
                  />
                </ReactCrop>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseCropModal}>
              İptal
            </Button>
            <Button 
              onClick={handleCropComplete}
              disabled={!completedCrop || isUploading}
            >
              {isUploading ? 'Yükleniyor...' : 'Kaydet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
