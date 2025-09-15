"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step3Props {
  formData: {
    email: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export function Step3Email({ formData, onInputChange, onNext, onBack }: Step3Props) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-3">
        <Label htmlFor="email">E-posta</Label>
        <div className="flex items-center">
          <Input 
            id="email" 
            type="text" 
            placeholder="hasan" 
            value={formData.email}
            onChange={(e) => onInputChange("email", e.target.value)}
            className="rounded-r-none h-10"
            required 
          />
          <span className="bg-muted border border-l-0 border-input px-3 h-10 flex items-center text-sm text-muted-foreground rounded-r-md">
            @fitmail.com
          </span>
        </div>
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
