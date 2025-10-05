"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"

interface Step4Props {
  formData: {
    password: string
    confirmPassword: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  showConfirmPassword: boolean
  setShowConfirmPassword: (show: boolean) => void
}

// Custom Password Input Component
const PasswordInput = ({ 
  id, 
  label, 
  value, 
  onChange, 
  showPassword, 
  setShowPassword,
  onKeyPress
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  showPassword: boolean
  setShowPassword: (show: boolean) => void
  onKeyPress?: (e: React.KeyboardEvent) => void
}) => {
  return (
    <div className="grid gap-3">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          className="pr-10"
          required
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  )
}

export function Step4Password({ 
  formData, 
  onInputChange, 
  onNext, 
  onBack, 
  showPassword, 
  setShowPassword, 
  showConfirmPassword, 
  setShowConfirmPassword 
}: Step4Props) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onNext()
    }
  }

  return (
    <div className="grid gap-6">
      <PasswordInput
        id="password"
        label="Şifre"
        value={formData.password}
        onChange={(e) => onInputChange("password", e.target.value)}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
        onKeyPress={handleKeyPress}
      />
      <PasswordInput
        id="confirm-password"
        label="Şifre Tekrar"
        value={formData.confirmPassword}
        onChange={(e) => onInputChange("confirmPassword", e.target.value)}
        showPassword={showConfirmPassword}
        setShowPassword={setShowConfirmPassword}
        onKeyPress={handleKeyPress}
      />
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
