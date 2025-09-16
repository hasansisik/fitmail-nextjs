"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Globe, Mail, Clock, Shield, Database } from "lucide-react"

export default function GeneralSettingsPage() {
  const [settings, setSettings] = useState({
    language: "tr",
    timezone: "Europe/Istanbul",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24",
    autoSave: true,
    autoReply: false,
    emailSignature: "Saygılarımla,\nHasan Yılmaz",
    maxAttachmentSize: "25",
    emailRetention: "365",
    spamFilter: true,
    virusScan: true,
    encryption: true
  })

  const handleSave = () => {
    // API çağrısı yapılabilir
    console.log("Settings saved:", settings)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Genel Ayarlar</h1>
        <p className="text-muted-foreground text-sm">
          Uygulama genelinde geçerli olan ayarları yönetin
        </p>
      </div>
      <Separator className="my-6" />

      {/* Language & Region */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Globe className="h-4 w-4" />
            Dil ve Bölge
          </h2>
          <p className="text-sm text-muted-foreground">
            Dil ve saat dilimi ayarlarınızı yapın
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <Select value={settings.language} onValueChange={(value) => setSettings({...settings, language: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Saat Dilimi</Label>
              <Select value={settings.timezone} onValueChange={(value) => setSettings({...settings, timezone: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                  <SelectItem value="Europe/London">Londra (UTC+0)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat">Tarih Formatı</Label>
              <Select value={settings.dateFormat} onValueChange={(value) => setSettings({...settings, dateFormat: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeFormat">Saat Formatı</Label>
              <Select value={settings.timeFormat} onValueChange={(value) => setSettings({...settings, timeFormat: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 Saat</SelectItem>
                  <SelectItem value="12">12 Saat (AM/PM)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Email Settings */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-4 w-4" />
            E-posta Ayarları
          </h2>
          <p className="text-sm text-muted-foreground">
            E-posta gönderim ve alım ayarlarınızı yapın
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Otomatik Kaydet</Label>
              <p className="text-sm text-muted-foreground">
                Taslaklar otomatik olarak kaydedilsin
              </p>
            </div>
            <Switch
              checked={settings.autoSave}
              onCheckedChange={(checked) => setSettings({...settings, autoSave: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Otomatik Yanıt</Label>
              <p className="text-sm text-muted-foreground">
                Gelen e-postalara otomatik yanıt gönder
              </p>
            </div>
            <Switch
              checked={settings.autoReply}
              onCheckedChange={(checked) => setSettings({...settings, autoReply: checked})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signature">E-posta İmzası</Label>
            <Input
              id="signature"
              placeholder="E-posta imzanızı girin"
              value={settings.emailSignature}
              onChange={(e) => setSettings({...settings, emailSignature: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxAttachment">Maksimum Ek Boyutu (MB)</Label>
            <Select value={settings.maxAttachmentSize} onValueChange={(value) => setSettings({...settings, maxAttachmentSize: value})}>
              <SelectTrigger>
                <SelectValue />
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
      <Separator className="my-6" />

      {/* Security Settings */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="h-4 w-4" />
            Güvenlik Ayarları
          </h2>
          <p className="text-sm text-muted-foreground">
            E-posta güvenliği ile ilgili ayarlar
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Spam Filtresi</Label>
              <p className="text-sm text-muted-foreground">
                Spam e-postaları otomatik olarak filtrele
              </p>
            </div>
            <Switch
              checked={settings.spamFilter}
              onCheckedChange={(checked) => setSettings({...settings, spamFilter: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Virüs Taraması</Label>
              <p className="text-sm text-muted-foreground">
                Ekleri virüs taramasından geçir
              </p>
            </div>
            <Switch
              checked={settings.virusScan}
              onCheckedChange={(checked) => setSettings({...settings, virusScan: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-posta Şifreleme</Label>
              <p className="text-sm text-muted-foreground">
                E-postaları şifreleyerek gönder
              </p>
            </div>
            <Switch
              checked={settings.encryption}
              onCheckedChange={(checked) => setSettings({...settings, encryption: checked})}
            />
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Data Management */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Database className="h-4 w-4" />
            Veri Yönetimi
          </h2>
          <p className="text-sm text-muted-foreground">
            E-posta verilerinizin saklanma süresi
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention">E-posta Saklama Süresi (Gün)</Label>
            <Select value={settings.emailRetention} onValueChange={(value) => setSettings({...settings, emailRetention: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 Gün</SelectItem>
                <SelectItem value="90">90 Gün</SelectItem>
                <SelectItem value="365">1 Yıl</SelectItem>
                <SelectItem value="1095">3 Yıl</SelectItem>
                <SelectItem value="unlimited">Sınırsız</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      <div className="flex justify-end">
        <Button onClick={handleSave}>Ayarları Kaydet</Button>
      </div>
    </div>
  )
}
