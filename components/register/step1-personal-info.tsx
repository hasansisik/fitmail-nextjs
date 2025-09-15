"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step1Props {
  formData: {
    firstName: string
    lastName: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
}

export function Step1PersonalInfo({ formData, onInputChange, onNext }: Step1Props) {
  return (
    <div className="grid gap-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-3">
          <Label htmlFor="firstName">Ad</Label>
          <Input 
            id="firstName" 
            type="text" 
            placeholder="Ahmet" 
            value={formData.firstName}
            onChange={(e) => onInputChange("firstName", e.target.value)}
            required 
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="lastName">Soyad</Label>
          <Input 
            id="lastName" 
            type="text" 
            placeholder="Yılmaz" 
            value={formData.lastName}
            onChange={(e) => onInputChange("lastName", e.target.value)}
            required 
          />
        </div>
      </div>
      <Button type="button" onClick={onNext} className="w-full">
        İleri
      </Button>
    </div>
  )
}
