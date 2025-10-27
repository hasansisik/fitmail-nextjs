"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { useAppDispatch } from "@/redux/hook"
import { checkPremiumCode } from "@/redux/actions/userActions"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface Step3Props {
  formData: {
    email: string
    recoveryEmail: string
    premiumCode?: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
  emailCheck?: {
    loading: boolean
    available: boolean | null
    message: string | null
    isPremium?: boolean
  }
  premiumCodeCheck?: {
    loading: boolean
    valid: boolean | null
    message: string | null
  }
}

export function Step3Email({ formData, onInputChange, onNext, onBack, emailCheck, premiumCodeCheck }: Step3Props) {
  const dispatch = useAppDispatch();

  // Premium kod kontrolü
  useEffect(() => {
    if (emailCheck?.isPremium && formData.premiumCode && formData.premiumCode.length === 5) {
      const fullEmail = `${formData.email}@gozdedijital.xyz`;
      dispatch(checkPremiumCode({ 
        email: fullEmail, 
        code: formData.premiumCode 
      }));
    }
  }, [formData.premiumCode, formData.email, emailCheck?.isPremium, dispatch]);

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
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
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
      
      {/* Premium Code Field - Only show if domain is premium */}
      {emailCheck?.isPremium && (
        <div className="grid gap-3">
          <Label htmlFor="premiumCode">Premium Kod</Label>
          <div className="flex justify-center">
            <InputOTP
              maxLength={5}
              value={formData.premiumCode || ''}
              onChange={(value) => onInputChange("premiumCode", value)}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          
          {/* Premium Code Validation Message */}
          {formData.premiumCode && formData.premiumCode.length === 5 && (
            <p className={`text-xs text-center ${
              premiumCodeCheck?.loading 
                ? 'text-blue-600' 
                : premiumCodeCheck?.valid === true 
                  ? 'text-green-600' 
                  : premiumCodeCheck?.valid === false 
                    ? 'text-red-600' 
                    : 'text-muted-foreground'
            }`}>
              {premiumCodeCheck?.loading 
                ? 'Kod kontrol ediliyor...' 
                : premiumCodeCheck?.message || 'Kod kontrol ediliyor...'}
            </p>
          )}
          
          <p className="text-xs text-muted-foreground text-center">
            Bu domain premium bir domaindir. Kayıt olmak için yöneticinizden aldığınız 5 haneli premium kodunu giriniz.
          </p>
        </div>
      )}
      
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
