"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Mail, 
  CheckCircle, 
  AlertCircle, 
  Settings, 
  Key, 
  Globe,
  Activity,
  Zap
} from "lucide-react"

export default function IntegrationsPage() {
  const [mailgunConfig, setMailgunConfig] = useState({
    apiKey: "",
    domain: "",
    region: "us",
    enabled: false,
    webhookUrl: "",
    testMode: true
  })

  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    setIsEditing(false)
    // API çağrısı yapılabilir
    console.log("Mailgun config saved:", mailgunConfig)
  }

  const handleTest = () => {
    // Test email gönderme
    console.log("Testing Mailgun integration...")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Entegrasyonlar</h1>
        <p className="text-muted-foreground text-sm">
          E-posta servisleri ve diğer entegrasyonları yönetin
        </p>
      </div>
      <Separator className="my-6" />

      {/* Mailgun Integration */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Mail className="h-4 w-4" />
            Mailgun Entegrasyonu
          </h2>
          <p className="text-sm text-muted-foreground">
            Mailgun ile e-posta gönderimi ve yönetimi
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium">Mailgun API</h3>
                <p className="text-sm text-muted-foreground">
                  Güvenilir e-posta teslimat servisi
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {mailgunConfig.enabled ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Aktif
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Pasif
                </Badge>
              )}
              <Switch
                checked={mailgunConfig.enabled}
                onCheckedChange={(checked) => setMailgunConfig({...mailgunConfig, enabled: checked})}
              />
            </div>
          </div>

          {mailgunConfig.enabled && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Yapılandırma</CardTitle>
                <CardDescription>
                  Mailgun API ayarlarınızı yapılandırın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="apiKey">API Key</Label>
                    {isEditing ? (
                      <Input
                        id="apiKey"
                        type="password"
                        placeholder="key-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={mailgunConfig.apiKey}
                        onChange={(e) => setMailgunConfig({...mailgunConfig, apiKey: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Key className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {mailgunConfig.apiKey ? "••••••••••••••••" : "API Key girilmedi"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain</Label>
                    {isEditing ? (
                      <Input
                        id="domain"
                        placeholder="mg.example.com"
                        value={mailgunConfig.domain}
                        onChange={(e) => setMailgunConfig({...mailgunConfig, domain: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {mailgunConfig.domain || "Domain girilmedi"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="region">Bölge</Label>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {mailgunConfig.region === "us" ? "Amerika (US)" : "Avrupa (EU)"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl">Webhook URL</Label>
                    {isEditing ? (
                      <Input
                        id="webhookUrl"
                        placeholder="https://yourdomain.com/webhooks/mailgun"
                        value={mailgunConfig.webhookUrl}
                        onChange={(e) => setMailgunConfig({...mailgunConfig, webhookUrl: e.target.value})}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {mailgunConfig.webhookUrl || "Webhook URL girilmedi"}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={mailgunConfig.testMode}
                      onCheckedChange={(checked) => setMailgunConfig({...mailgunConfig, testMode: checked})}
                    />
                    <Label>Test Modu</Label>
                  </div>
                  <Badge variant={mailgunConfig.testMode ? "secondary" : "default"}>
                    {mailgunConfig.testMode ? "Test" : "Canlı"}
                  </Badge>
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave}>Kaydet</Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>İptal</Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)}>Düzenle</Button>
                  )}
                  <Button variant="outline" onClick={handleTest}>
                    <Activity className="h-4 w-4 mr-2" />
                    Test Et
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Separator className="my-6" />

      {/* Integration Status */}
      <div className="space-y-4">
        <div className="pb-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Settings className="h-4 w-4" />
            Entegrasyon Durumu
          </h2>
          <p className="text-sm text-muted-foreground">
            Aktif entegrasyonlarınızın durumunu görüntüleyin
          </p>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Mailgun</h3>
                      <p className="text-sm text-muted-foreground">E-posta Servisi</p>
                    </div>
                  </div>
                  <Badge variant={mailgunConfig.enabled ? "default" : "secondary"}>
                    {mailgunConfig.enabled ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Settings className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Diğer Entegrasyonlar</h3>
                      <p className="text-sm text-muted-foreground">Yakında gelecek</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Beklemede</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
