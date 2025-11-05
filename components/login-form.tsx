"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/redux/hook"
import { login, verify2FALogin } from "@/redux/actions/userActions"
import { toast } from "sonner"
import { useState, useEffect } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { twoFactor } = useAppSelector((state) => state.user)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [show2FAStep, setShow2FAStep] = useState(false)

  // Check if 2FA is required
  useEffect(() => {
    if (twoFactor.requires2FA) {
      setShow2FAStep(true)
    }
  }, [twoFactor.requires2FA])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    
    // Validate inputs
    if (!email || !password) {
      toast.error("Lütfen tüm alanları doldurun!")
      return
    }
    
    // Add @fitmail.com domain if not present
    const fullEmail = email.includes("@") ? email : `${email}@fitmail.com`
    
    const loginData = {
      email: fullEmail,
      password: password
    }
    
    const loadingToastId = toast.loading("Giriş yapılıyor...")
    
    try {
      // Call Redux action for login
      const result = await dispatch(login(loginData)).unwrap()
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Check if 2FA is required
      if ((result as any).requires2FA) {
        toast.info("2FA kodu gerekli. Lütfen doğrulama kodunuzu girin.")
        return
      }
      
      // Login successful
      toast.success("Giriş başarılı!")
      // Redirect to mail page
      router.push("/mail")
    } catch (error: any) {
      console.error("Login failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Giriş yapılırken bir hata oluştu"
      toast.error(errorMessage)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!twoFactorCode || twoFactorCode.length !== 6) {
      toast.error("Lütfen 6 haneli doğrulama kodunu girin!")
      return
    }
    
    const loadingToastId = toast.loading("Doğrulama yapılıyor...")
    
    try {
      const result = await dispatch(verify2FALogin({
        tempToken: twoFactor.tempToken!,
        token: twoFactorCode
      })).unwrap()
      
      toast.dismiss(loadingToastId)
      toast.success("2FA doğrulaması başarılı!")
      router.push("/mail")
    } catch (error: any) {
      console.error("2FA verification failed:", error)
      toast.dismiss(loadingToastId)
      
      const errorMessage = typeof error === 'string' ? error : error?.message || "Doğrulama başarısız"
      toast.error(errorMessage)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Create a synthetic form event for handleSubmit
      const form = e.currentTarget.closest('form')
      if (form) {
        const syntheticEvent = {
          preventDefault: () => {},
          currentTarget: form
        } as React.FormEvent<HTMLFormElement>
        handleSubmit(syntheticEvent)
      }
    }
  }

  // Show 2FA form if required
  if (show2FAStep) {
    return (
      <form className={cn("flex flex-col gap-6", className)} onSubmit={handle2FASubmit} {...props}>
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">İki Faktörlü Doğrulama</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Authenticator uygulamanızdan 6 haneli kodu girin
          </p>
        </div>
        <div className="grid gap-6">
          <div className="grid gap-3">
            <Label htmlFor="twoFactorCode">Doğrulama Kodu</Label>
            <Input 
              id="twoFactorCode" 
              name="twoFactorCode" 
              type="text" 
              placeholder="000000" 
              maxLength={6}
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
              required 
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full">
            Doğrula
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            className="w-full"
            onClick={() => {
              setShow2FAStep(false)
              setTwoFactorCode("")
            }}
          >
            Geri Dön
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Hesabınıza giriş yapın</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Hesabınıza giriş yapmak için e-posta adresinizi girin
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">E-posta</Label>
          <Input 
            id="email" 
            name="email" 
            type="email" 
            placeholder="ornek@email.com" 
            required 
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Şifre</Label>
            <a
              href="/sifremi-unuttum"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Şifrenizi mi unuttunuz?
            </a>
          </div>
          <Input 
            id="password" 
            name="password" 
            type="password" 
            placeholder="Şifrenizi girin"
            required 
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button type="submit" className="w-full">
          Giriş Yap
        </Button>
      </div>
      <div className="text-center text-sm">
        Hesabınız yok mu?{" "}
        <a href="/kayit-ol" className="underline underline-offset-4">
          Kayıt ol
        </a>
      </div>
    </form>
  )
}
