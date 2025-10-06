"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step3Props {
  formData: {
    email: string
    recoveryEmail: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
  emailCheck?: {
    loading: boolean
    available: boolean | null
    message: string | null
  }
}

export function Step3Email({ formData, onInputChange, onNext, onBack, emailCheck }: Step3Props) {
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    // Remove @ symbol if user tries to type it
    value = value.replace('@', '');
    // Remove gmail, google, yahoo, hotmail, outlook if user tries to type them
    value = value.replace(/gmail|google|yahoo|hotmail|outlook/gi, '');
    // Only allow alphanumeric characters, dots, underscores, and hyphens
    value = value.replace(/[^a-zA-Z0-9._-]/g, '');
    onInputChange("email", value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onNext()
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="email">E-posta</Label>
        <div className="flex items-center">
          <div className="relative flex-1">
            <Input 
              id="email" 
              type="text" 
              placeholder="kullaniciadi" 
              value={formData.email}
              onChange={handleEmailChange}
              onKeyPress={handleKeyPress}
              className="rounded-r-none h-10 pr-8"
              required 
            />
            {emailCheck?.loading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>
          <span className="bg-muted border border-l-0 border-input px-3 h-10 flex items-center text-sm text-muted-foreground rounded-r-md">
            @gozdedijital.xyz
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Sadece harf, rakam, nokta, alt çizgi ve tire kullanabilirsiniz.
        </p>
        {emailCheck?.message && (
          <p className={`text-xs ${
            emailCheck.available === true 
              ? 'text-green-600' 
              : emailCheck.available === false 
                ? 'text-red-600' 
                : 'text-muted-foreground'
          }`}>
            {emailCheck.message}
          </p>
        )}
      </div>
      <div className="grid gap-3">
        <Label htmlFor="recoveryEmail">Kurtarıcı E-posta</Label>
        <Input 
          id="recoveryEmail" 
          type="email" 
          placeholder="ornek@gmail.com" 
          value={formData.recoveryEmail}
          onChange={(e) => onInputChange("recoveryEmail", e.target.value)}
          onKeyPress={handleKeyPress}
          required
        />
        <p className="text-xs text-muted-foreground">
          Şifrenizi unuttuğunuzda kullanılacak e-posta adresi
        </p>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Geri
        </Button>
        <Button type="button" onClick={onNext} className="flex-1">
          İleri
        </Button>
      </div>
    </div>
  )
}
