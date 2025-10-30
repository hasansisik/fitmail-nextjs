"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { resetPassword } from "@/redux/actions/userActions"
import { toast } from "sonner"
import { useState, useEffect } from "react"

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const searchParams = useSearchParams()
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  // Get email from URL parameters
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const passwordToken = formData.get("passwordToken") as string
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string
    
    // Validate inputs
    if (!email || !passwordToken || !newPassword || !confirmPassword) {
      toast.error("Lütfen tüm alanları doldurun!")
      return
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor!")
      return
    }
    
    if (newPassword.length < 6) {
      toast.error("Şifre en az 6 karakter olmalıdır!")
      return
    }
    
    // Remove @ symbol if user tries to type it and add @gozdedijital.xyz domain
    const cleanEmail = email.replace('@', '').trim()
    const fullEmail = `${cleanEmail}@gozdedijital.xyz`
    
    // Validate password token is 6 digits
    if (passwordToken.length !== 6 || !/^\d{6}$/.test(passwordToken)) {
      toast.error("Doğrulama kodu 6 haneli bir sayı olmalıdır!")
      return
    }
    
    const resetData = {
      email: fullEmail,
      passwordToken: parseInt(passwordToken),
      newPassword: newPassword
    }
    
    const loadingToastId = toast.loading("Şifre sıfırlanıyor...")
    
    try {
      // Call Redux action for reset password
      const result = await dispatch(resetPassword(resetData)).unwrap()
      console.log("Reset password result:", result)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Success
      toast.success("Şifreniz başarıyla sıfırlandı!")
      setIsSubmitted(true)
      
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        router.push("/giris")
      }, 2000)
    } catch (error: any) {
      console.error("Reset password failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Şifre sıfırlanırken bir hata oluştu"
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

  if (isSubmitted) {
    return (
      <div className={cn("flex flex-col gap-6 text-center", className)} {...props}>
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Şifre Sıfırlandı!</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Şifreniz başarıyla sıfırlandı. Giriş sayfasına yönlendiriliyorsunuz...
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push("/giris")}
            className="w-full"
          >
            Giriş Yap
          </Button>
        </div>
      </div>
    )
  }

  const { onSubmit, ...formProps } = props as any;
  
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...formProps}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Şifre Sıfırla</h1>
        <p className="text-muted-foreground text-sm text-balance">
          E-posta adresinizi, doğrulama kodunuzu ve yeni şifrenizi girin
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Fitmail E-posta Adresiniz</Label>
          <div className="flex items-center">
            <Input 
              id="email" 
              name="email" 
              type="text" 
              placeholder="mail" 
              value={email}
              disabled
              className="rounded-r-none h-10 bg-muted"
            />
            <span className="bg-muted border border-l-0 border-input px-3 h-10 flex items-center text-sm text-muted-foreground rounded-r-md">
              @gozdedijital.xyz
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            E-posta adresiniz otomatik olarak dolduruldu
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="passwordToken">Doğrulama Kodu</Label>
          <Input 
            id="passwordToken" 
            name="passwordToken" 
            type="text" 
            placeholder="123456" 
            maxLength={6}
            required 
            onKeyPress={handleKeyPress}
            pattern="[0-9]{6}"
            className="font-mono tracking-widest text-center text-lg"
          />
          <p className="text-xs text-muted-foreground">
            Kurtarıcı e-postanıza gönderilen 6 haneli kodu girin (10 dakika geçerli)
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="newPassword">Yeni Şifre</Label>
          <Input 
            id="newPassword" 
            name="newPassword" 
            type="password" 
            placeholder="En az 6 karakter" 
            required 
            onKeyPress={handleKeyPress}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
          <Input 
            id="confirmPassword" 
            name="confirmPassword" 
            type="password" 
            placeholder="Şifrenizi tekrar girin" 
            required 
            onKeyPress={handleKeyPress}
          />
        </div>
        <Button type="submit" className="w-full">
          Şifreyi Sıfırla
        </Button>
      </div>
      <div className="text-center text-sm">
        Şifrenizi hatırladınız mı?{" "}
        <a href="/giris" className="underline underline-offset-4">
          Giriş yap
        </a>
      </div>
    </form>
  )
}
