"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    day: "",
    month: "",
    year: "",
    gender: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
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
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  required 
                />
              </div>
            </div>
            <Button type="button" onClick={handleNext} className="w-full">
              İleri
            </Button>
          </div>
        )
      
      case 2:
        return (
          <div className="flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-2 w-full">
                <div className="flex-1">
                  <Label htmlFor="day" className="text-sm font-medium">Gün</Label>
                  <Select value={formData.day} onValueChange={(value) => handleInputChange("day", value)}>
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
                  <Select value={formData.month} onValueChange={(value) => handleInputChange("month", value)}>
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
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
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
                <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
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
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Geri
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                İleri
              </Button>
            </div>
          </div>
        )
      
      case 3:
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
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="rounded-r-none h-10"
                  required 
                />
                <span className="bg-muted border border-l-0 border-input px-3 h-10 flex items-center text-sm text-muted-foreground rounded-r-md">
                  @fitmail.com
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Geri
              </Button>
              <Button type="button" onClick={handleNext} className="flex-1">
                İleri
              </Button>
            </div>
          </div>
        )
      
      case 4:
        return (
          <div className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="password">Şifre</Label>
              <Input 
                id="password" 
                type="password" 
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required 
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirm-password">Şifre Tekrar</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                required 
              />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                Geri
              </Button>
              <Button type="submit" className="flex-1">
                Hesap Oluştur
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Bir Fitmail Hesabı Oluşturun"
      case 2:
        return "Temel Bilgiler"
      case 3:
        return "E-posta adresiniz nedir?"
      case 4:
        return "Şifre oluşturun"
      default:
        return "Hesap oluşturun"
    }
  }

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Adınızı ve soyadınızı girin"
      case 2:
        return "Doğum tarihinizi ve cinsiyetinizi seçin"
      case 3:
        return "E-posta adresinizi girin"
      case 4:
        return "Güvenli bir şifre seçin"
      default:
        return "Hesabınızı oluşturmak için bilgilerinizi girin"
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
        <p className="text-muted-foreground text-sm text-balance">
          {getStepDescription()}
        </p>
      </div>
      {renderStep()}
      <div className="text-center text-sm">
        Zaten hesabınız var mı?{" "}
        <a href="/login" className="underline underline-offset-4">
          Giriş yap
        </a>
      </div>
    </form>
  )
}
