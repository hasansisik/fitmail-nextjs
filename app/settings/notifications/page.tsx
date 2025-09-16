"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Mail, Smartphone, Monitor, Volume2, VolumeX } from "lucide-react"

export default function NotificationSettingsPage() {
  const [notifications, setNotifications] = useState({
    // Email notifications
    newEmail: true,
    importantEmail: true,
    emailReminders: false,
    emailDigest: true,
    
    // Push notifications
    pushNewEmail: true,
    pushImportantEmail: true,
    pushReminders: false,
    pushDigest: false,
    
    // Desktop notifications
    desktopNewEmail: true,
    desktopImportantEmail: true,
    desktopReminders: true,
    desktopDigest: false,
    
    // Sound settings
    soundEnabled: true,
    soundVolume: "medium",
    soundType: "default",
    
    // Frequency settings
    digestFrequency: "daily",
    reminderTime: "09:00",
    quietHours: false,
    quietStart: "22:00",
    quietEnd: "08:00"
  })

  const handleSave = () => {
    // API çağrısı yapılabilir
    console.log("Notification settings saved:", notifications)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bildirim Ayarları</h1>
        <p className="text-muted-foreground text-sm">
          Hangi bildirimleri almak istediğinizi seçin
        </p>
      </div>
      <Separator className="my-6" />

      {/* Email Notifications */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-4 w-4" />
            E-posta Bildirimleri
          </h2>
          <p className="text-sm text-muted-foreground">
            E-posta ile bildirim almak istediğiniz durumlar
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Yeni E-posta</Label>
              <p className="text-sm text-muted-foreground">
                Yeni e-posta geldiğinde bildirim al
              </p>
            </div>
            <Switch
              checked={notifications.newEmail}
              onCheckedChange={(checked) => setNotifications({...notifications, newEmail: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Önemli E-posta</Label>
              <p className="text-sm text-muted-foreground">
                Önemli olarak işaretlenen e-postalar için bildirim al
              </p>
            </div>
            <Switch
              checked={notifications.importantEmail}
              onCheckedChange={(checked) => setNotifications({...notifications, importantEmail: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>E-posta Hatırlatıcıları</Label>
              <p className="text-sm text-muted-foreground">
                Okunmamış e-postalar için hatırlatıcı al
              </p>
            </div>
            <Switch
              checked={notifications.emailReminders}
              onCheckedChange={(checked) => setNotifications({...notifications, emailReminders: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Günlük Özet</Label>
              <p className="text-sm text-muted-foreground">
                Günlük e-posta özeti al
              </p>
            </div>
            <Switch
              checked={notifications.emailDigest}
              onCheckedChange={(checked) => setNotifications({...notifications, emailDigest: checked})}
            />
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Push Notifications */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Smartphone className="h-4 w-4" />
            Mobil Bildirimler
          </h2>
          <p className="text-sm text-muted-foreground">
            Mobil cihazınıza gönderilecek bildirimler
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Yeni E-posta</Label>
              <p className="text-sm text-muted-foreground">
                Mobil cihazınıza anlık bildirim gönder
              </p>
            </div>
            <Switch
              checked={notifications.pushNewEmail}
              onCheckedChange={(checked) => setNotifications({...notifications, pushNewEmail: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Önemli E-posta</Label>
              <p className="text-sm text-muted-foreground">
                Önemli e-postalar için mobil bildirim
              </p>
            </div>
            <Switch
              checked={notifications.pushImportantEmail}
              onCheckedChange={(checked) => setNotifications({...notifications, pushImportantEmail: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hatırlatıcılar</Label>
              <p className="text-sm text-muted-foreground">
                Mobil cihazınıza hatırlatıcı gönder
              </p>
            </div>
            <Switch
              checked={notifications.pushReminders}
              onCheckedChange={(checked) => setNotifications({...notifications, pushReminders: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Günlük Özet</Label>
              <p className="text-sm text-muted-foreground">
                Mobil cihazınıza günlük özet gönder
              </p>
            </div>
            <Switch
              checked={notifications.pushDigest}
              onCheckedChange={(checked) => setNotifications({...notifications, pushDigest: checked})}
            />
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Desktop Notifications */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Monitor className="h-4 w-4" />
            Masaüstü Bildirimleri
          </h2>
          <p className="text-sm text-muted-foreground">
            Masaüstü uygulamasından alacağınız bildirimler
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Yeni E-posta</Label>
              <p className="text-sm text-muted-foreground">
                Masaüstünde bildirim göster
              </p>
            </div>
            <Switch
              checked={notifications.desktopNewEmail}
              onCheckedChange={(checked) => setNotifications({...notifications, desktopNewEmail: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Önemli E-posta</Label>
              <p className="text-sm text-muted-foreground">
                Önemli e-postalar için masaüstü bildirimi
              </p>
            </div>
            <Switch
              checked={notifications.desktopImportantEmail}
              onCheckedChange={(checked) => setNotifications({...notifications, desktopImportantEmail: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Hatırlatıcılar</Label>
              <p className="text-sm text-muted-foreground">
                Masaüstünde hatırlatıcı göster
              </p>
            </div>
            <Switch
              checked={notifications.desktopReminders}
              onCheckedChange={(checked) => setNotifications({...notifications, desktopReminders: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Günlük Özet</Label>
              <p className="text-sm text-muted-foreground">
                Masaüstünde günlük özet göster
              </p>
            </div>
            <Switch
              checked={notifications.desktopDigest}
              onCheckedChange={(checked) => setNotifications({...notifications, desktopDigest: checked})}
            />
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Sound Settings */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-4 w-4" />
            Ses Ayarları
          </h2>
          <p className="text-sm text-muted-foreground">
            Bildirim seslerini yönetin
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Ses Bildirimleri</Label>
              <p className="text-sm text-muted-foreground">
                Bildirimlerde ses çalsın
              </p>
            </div>
            <Switch
              checked={notifications.soundEnabled}
              onCheckedChange={(checked) => setNotifications({...notifications, soundEnabled: checked})}
            />
          </div>

          {notifications.soundEnabled && (
            <>
              <div className="space-y-2">
                <Label>Ses Seviyesi</Label>
                <Select value={notifications.soundVolume} onValueChange={(value) => setNotifications({...notifications, soundVolume: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ses Türü</Label>
                <Select value={notifications.soundType} onValueChange={(value) => setNotifications({...notifications, soundType: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Varsayılan</SelectItem>
                    <SelectItem value="gentle">Yumuşak</SelectItem>
                    <SelectItem value="classic">Klasik</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
      </div>
      <Separator className="my-6" />

      {/* Frequency Settings */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Bell className="h-4 w-4" />
            Sıklık Ayarları
          </h2>
          <p className="text-sm text-muted-foreground">
            Bildirim sıklığını ve zamanlamasını ayarlayın
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Özet Sıklığı</Label>
            <Select value={notifications.digestFrequency} onValueChange={(value) => setNotifications({...notifications, digestFrequency: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Saatlik</SelectItem>
                <SelectItem value="daily">Günlük</SelectItem>
                <SelectItem value="weekly">Haftalık</SelectItem>
                <SelectItem value="never">Asla</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Hatırlatıcı Saati</Label>
            <Select value={notifications.reminderTime} onValueChange={(value) => setNotifications({...notifications, reminderTime: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="09:00">09:00</SelectItem>
                <SelectItem value="12:00">12:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="18:00">18:00</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Sessiz Saatler</Label>
              <p className="text-sm text-muted-foreground">
                Belirli saatlerde bildirim almayın
              </p>
            </div>
            <Switch
              checked={notifications.quietHours}
              onCheckedChange={(checked) => setNotifications({...notifications, quietHours: checked})}
            />
          </div>

          {notifications.quietHours && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç Saati</Label>
                <Select value={notifications.quietStart} onValueChange={(value) => setNotifications({...notifications, quietStart: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="22:00">22:00</SelectItem>
                    <SelectItem value="23:00">23:00</SelectItem>
                    <SelectItem value="00:00">00:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Bitiş Saati</Label>
                <Select value={notifications.quietEnd} onValueChange={(value) => setNotifications({...notifications, quietEnd: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">06:00</SelectItem>
                    <SelectItem value="07:00">07:00</SelectItem>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      <Separator className="my-6" />

      <div className="flex justify-end">
        <Button onClick={handleSave}>Ayarları Kaydet</Button>
      </div>
    </div>
  )
}
