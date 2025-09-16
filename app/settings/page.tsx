"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Mail, 
  Bell, 
  Palette, 
  Shield, 
  Globe, 
  Zap,
  Settings as SettingsIcon
} from "lucide-react"

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    username: "Hasan Yılmaz",
    email: "hasan@example.com",
    bio: "E-posta yönetimi konusunda uzman. Modern web teknolojileri ile çalışıyorum.",
    website: "https://hasan.com",
    twitter: "https://twitter.com/hasan"
  })

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Profile
          </h2>
          <p className="text-muted-foreground text-sm">
            This is how others will see you on the site.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={profile.username}
              onChange={(e) => setProfile({...profile, username: e.target.value})}
              placeholder="Name"
            />
            <p className="text-xs text-muted-foreground">
              This is your public display name. It can be your real name or a pseudonym. You can only change this once every 30 days.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select a verified email to display" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hasan@example.com">hasan@example.com</SelectItem>
                <SelectItem value="hasan.work@example.com">hasan.work@example.com</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              You can manage verified email addresses in your email settings.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile({...profile, bio: e.target.value})}
              placeholder="Type your message here."
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              You can @mention other users and organizations to link to them.
            </p>
          </div>

          <div className="space-y-2">
            <Label>URLs</Label>
            <p className="text-xs text-muted-foreground">
              Add links to your website, blog, or social media profiles.
            </p>
            <div className="space-y-2">
              <Input
                value={profile.website}
                onChange={(e) => setProfile({...profile, website: e.target.value})}
                placeholder="https://shadcn.com"
              />
              <Input
                value={profile.twitter}
                onChange={(e) => setProfile({...profile, twitter: e.target.value})}
                placeholder="http://twitter.com/shadcn"
              />
              <Button variant="ghost" size="sm">
                Add URL
              </Button>
            </div>
          </div>
        </div>

        <Button>Update Profile</Button>
      </div>

      {/* General Settings */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            Genel Ayarlar
          </h2>
          <p className="text-muted-foreground text-sm">
            Uygulama genelinde geçerli olan ayarları yönetin
          </p>
        </div>

        <div className="space-y-6">
          {/* Language and Region */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Dil ve Bölge</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Dil ve saat dilimi ayarlarınızı yapın
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Dil</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Türkçe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Türkçe</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tarih Formatı</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="DD/MM/YYYY" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saat Dilimi</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="İstanbul (UTC+3)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                    <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                    <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Saat Formatı</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="24 Saat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 Saat</SelectItem>
                    <SelectItem value="12">12 Saat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Email Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-semibold">E-posta Ayarları</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              E-posta gönderim ve alım ayarlarınızı yapın
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Otomatik Kaydet</Label>
                  <p className="text-sm text-muted-foreground">Taslaklar otomatik olarak kaydedilsin</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Otomatik Yanıt</Label>
                  <p className="text-sm text-muted-foreground">Gelen e-postalara otomatik yanıt gönder</p>
                </div>
                <Switch />
              </div>
              
              <div className="space-y-2">
                <Label>E-posta İmzası</Label>
                <Textarea
                  placeholder="İmzanızı buraya yazın"
                  defaultValue="Saygılarımla, Hasan Yılmaz"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Maksimum Ek Boyutu (MB)</Label>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="25 MB" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 MB</SelectItem>
                    <SelectItem value="25">25 MB</SelectItem>
                    <SelectItem value="50">50 MB</SelectItem>
                    <SelectItem value="100">100 MB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Güvenlik Ayarları</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              E-posta güvenliği ile ilgili ayarlar
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Spam Filtresi</Label>
                  <p className="text-sm text-muted-foreground">Spam e-postaları otomatik olarak filtrele</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>İki Faktörlü Kimlik Doğrulama</Label>
                  <p className="text-sm text-muted-foreground">Hesabınızı ek güvenlik katmanı ile koruyun</p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6" />
            Bildirimler
          </h2>
          <p className="text-muted-foreground text-sm">
            Bildirim tercihlerinizi yönetin
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-posta Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">Yeni e-posta geldiğinde bildirim al</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Push Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">Tarayıcı push bildirimleri</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Masaüstü Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">Masaüstü bildirimleri</p>
            </div>
            <Switch />
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Palette className="h-6 w-6" />
            Görünüm
          </h2>
          <p className="text-muted-foreground text-sm">
            Arayüz görünümünü özelleştirin
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Açık Tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Açık Tema</SelectItem>
                <SelectItem value="dark">Koyu Tema</SelectItem>
                <SelectItem value="system">Sistem</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Yazı Boyutu</Label>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Orta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Küçük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="large">Büyük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Entegrasyonlar
          </h2>
          <p className="text-muted-foreground text-sm">
            E-posta servisleri ve diğer entegrasyonları yönetin
          </p>
        </div>

        <div className="space-y-6">
          {/* Mailgun Integration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Mailgun Entegrasyonu</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Mailgun ile e-posta gönderimi ve yönetimi
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Mailgun API</h4>
                    <p className="text-sm text-muted-foreground">Güvenilir e-posta teslimat servisi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Pasif</span>
                  <Switch />
                </div>
              </div>
            </div>
          </div>

          {/* Integration Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Entegrasyon Durumu</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Aktif entegrasyonlarınızın durumunu görüntüleyin
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Mailgun</h4>
                    <p className="text-sm text-muted-foreground">E-posta Servisi</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-sm text-muted-foreground">Pasif</span>
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <SettingsIcon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Diğer Entegrasyonlar</h4>
                    <p className="text-sm text-muted-foreground">Yakında gelecek</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-sm text-muted-foreground">Beklemede</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
