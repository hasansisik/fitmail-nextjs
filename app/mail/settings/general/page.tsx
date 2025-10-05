"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Globe } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { updateSettings } from "@/redux/actions/userActions"
import { toast } from "sonner"

export default function GeneralSettingsPage() {
  const dispatch = useAppDispatch()
  const { user, loading, error, message } = useAppSelector((state) => state.user)
  
  const [settings, setSettings] = useState({
    language: "tr",
    timezone: "Europe/Istanbul",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24"
  })

  // Load user settings when component mounts
  useEffect(() => {
    if (user?.settings) {
      setSettings(prev => ({
        ...prev,
        ...user.settings
      }))
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

  const handleSave = async () => {
    try {
      await dispatch(updateSettings(settings)).unwrap()
    } catch (error) {
      console.error('Settings update failed:', error)
    }
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

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </Button>
      </div>
    </div>
  )
}
