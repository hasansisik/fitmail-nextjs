"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Step2Props {
  formData: {
    day: string
    month: string
    year: string
    gender: string
  }
  onInputChange: (field: string, value: string) => void
  onNext: () => void
  onBack: () => void
}

export function Step2BasicInfo({ formData, onInputChange, onNext, onBack }: Step2Props) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex gap-2 w-full">
          <div className="flex-1">
            <Label htmlFor="day" className="text-sm font-medium">Gün</Label>
            <Select value={formData.day} onValueChange={(value) => onInputChange("day", value)}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Gün" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="month" className="text-sm font-medium">Ay</Label>
            <Select value={formData.month} onValueChange={(value) => onInputChange("month", value)}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Ay" />
              </SelectTrigger>
              <SelectContent>
                {[
                  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
                ].map((month, index) => (
                  <SelectItem key={month} value={(index + 1).toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label htmlFor="year" className="text-sm font-medium">Yıl</Label>
            <Select value={formData.year} onValueChange={(value) => onInputChange("year", value)}>
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="Yıl" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="w-full">
          <Label htmlFor="gender" className="text-sm font-medium">Cinsiyet</Label>
          <Select value={formData.gender} onValueChange={(value) => onInputChange("gender", value)}>
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Cinsiyet seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Erkek</SelectItem>
              <SelectItem value="female">Kadın</SelectItem>
              <SelectItem value="other">Diğer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-full">
          <p className="text-xs text-muted-foreground">
            ⚠️ 13 yaşından küçük kullanıcılar kayıt olamaz
          </p>
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
