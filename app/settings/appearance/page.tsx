"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Palette, Monitor, Sun, Moon, Eye, Type, Layout } from "lucide-react"

export default function AppearanceSettingsPage() {
  const [appearance, setAppearance] = useState({
    theme: "system",
    colorScheme: "blue",
    fontSize: "medium",
    density: "comfortable",
    sidebarCollapsed: false,
    showPreview: true,
    showLabels: true,
    showAvatars: true,
    compactMode: false,
    animations: true,
    highContrast: false
  })

  const handleSave = () => {
    // API çağrısı yapılabilir
    console.log("Appearance settings saved:", appearance)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Görünüm Ayarları</h1>
        <p className="text-muted-foreground text-sm">
          Uygulamanın görünümünü kişiselleştirin
        </p>
      </div>
      <Separator className="my-6" />

      {/* Theme Settings */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Palette className="h-4 w-4" />
            Tema Ayarları
          </h2>
          <p className="text-sm text-muted-foreground">
            Uygulamanın genel görünümünü seçin
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select value={appearance.theme} onValueChange={(value) => setAppearance({...appearance, theme: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Açık Tema
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Koyu Tema
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    Sistem Ayarı
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Renk Şeması</Label>
            <Select value={appearance.colorScheme} onValueChange={(value) => setAppearance({...appearance, colorScheme: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blue">Mavi</SelectItem>
                <SelectItem value="green">Yeşil</SelectItem>
                <SelectItem value="purple">Mor</SelectItem>
                <SelectItem value="red">Kırmızı</SelectItem>
                <SelectItem value="orange">Turuncu</SelectItem>
                <SelectItem value="gray">Gri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Yazı Boyutu</Label>
            <Select value={appearance.fontSize} onValueChange={(value) => setAppearance({...appearance, fontSize: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Küçük</SelectItem>
                <SelectItem value="medium">Orta</SelectItem>
                <SelectItem value="large">Büyük</SelectItem>
                <SelectItem value="extra-large">Çok Büyük</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Layout Settings */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Layout className="h-4 w-4" />
            Düzen Ayarları
          </h2>
          <p className="text-sm text-muted-foreground">
            E-posta listesi ve görünüm düzenini ayarlayın
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Yoğunluk</Label>
            <Select value={appearance.density} onValueChange={(value) => setAppearance({...appearance, density: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Kompakt</SelectItem>
                <SelectItem value="comfortable">Rahat</SelectItem>
                <SelectItem value="spacious">Geniş</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Yan Çubuk Kapalı</Label>
              <p className="text-sm text-muted-foreground">
                Yan çubuğu varsayılan olarak kapalı başlat
              </p>
            </div>
            <Switch
              checked={appearance.sidebarCollapsed}
              onCheckedChange={(checked) => setAppearance({...appearance, sidebarCollapsed: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Kompakt Mod</Label>
              <p className="text-sm text-muted-foreground">
                E-posta listesinde daha az boşluk kullan
              </p>
            </div>
            <Switch
              checked={appearance.compactMode}
              onCheckedChange={(checked) => setAppearance({...appearance, compactMode: checked})}
            />
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Display Options */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Eye className="h-4 w-4" />
            Görüntüleme Seçenekleri
          </h2>
          <p className="text-sm text-muted-foreground">
            E-posta listesinde gösterilecek öğeleri seçin
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Önizleme Göster</Label>
              <p className="text-sm text-muted-foreground">
                E-posta önizlemesini göster
              </p>
            </div>
            <Switch
              checked={appearance.showPreview}
              onCheckedChange={(checked) => setAppearance({...appearance, showPreview: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Etiketleri Göster</Label>
              <p className="text-sm text-muted-foreground">
                E-posta etiketlerini göster
              </p>
            </div>
            <Switch
              checked={appearance.showLabels}
              onCheckedChange={(checked) => setAppearance({...appearance, showLabels: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Avatar Göster</Label>
              <p className="text-sm text-muted-foreground">
                Gönderen kişinin avatarını göster
              </p>
            </div>
            <Switch
              checked={appearance.showAvatars}
              onCheckedChange={(checked) => setAppearance({...appearance, showAvatars: checked})}
            />
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Accessibility Settings */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Type className="h-4 w-4" />
            Erişilebilirlik
          </h2>
          <p className="text-sm text-muted-foreground">
            Erişilebilirlik özelliklerini yönetin
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Animasyonlar</Label>
              <p className="text-sm text-muted-foreground">
                Geçiş animasyonlarını etkinleştir
              </p>
            </div>
            <Switch
              checked={appearance.animations}
              onCheckedChange={(checked) => setAppearance({...appearance, animations: checked})}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Yüksek Kontrast</Label>
              <p className="text-sm text-muted-foreground">
                Daha yüksek kontrast kullan
              </p>
            </div>
            <Switch
              checked={appearance.highContrast}
              onCheckedChange={(checked) => setAppearance({...appearance, highContrast: checked})}
            />
          </div>
        </div>
      </div>
      <Separator className="my-6" />

      {/* Preview */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="text-lg font-semibold">Önizleme</h2>
          <p className="text-sm text-muted-foreground">
            Seçtiğiniz ayarların nasıl görüneceğini görün
          </p>
        </div>
        <div>
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                  WS
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">William Smith</span>
                    <span className="text-sm text-muted-foreground">2 saat önce</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Yarın Toplantı</p>
                  {appearance.showPreview && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Merhaba, projeyi görüşmek için yarın bir toplantı yapalım...
                    </p>
                  )}
                </div>
                {appearance.showLabels && (
                  <div className="flex gap-1">
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">toplantı</span>
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">iş</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Ayarları Kaydet</Button>
      </div>
    </div>
  )
}
