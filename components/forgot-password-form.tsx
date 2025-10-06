"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { forgotPassword } from "@/redux/actions/userActions"
import { toast } from "sonner"
import { useState } from "react"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    
    // Validate input
    if (!email || email.trim() === '') {
      toast.error("Lütfen e-posta adresinizi girin!")
      return
    }
    
    // Remove @ symbol if user tries to type it
    const cleanEmail = email.replace('@', '').trim()
    
    // Add @gozdedijital.xyz domain
    const fullEmail = `${cleanEmail}@gozdedijital.xyz`
    
    console.log("Forgot password email:", fullEmail)
    const loadingToastId = toast.loading("Şifre sıfırlama kodu gönderiliyor...")
    
    try {
      // Call Redux action for forgot password
      const result = await dispatch(forgotPassword(fullEmail)).unwrap()
      console.log("Forgot password result:", result)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Success
      toast.success("Şifre sıfırlama kodu kurtarıcı e-posta adresinize gönderildi!")
      setIsSubmitted(true)
    } catch (error: any) {
      console.error("Forgot password failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Şifre sıfırlama e-postası gönderilirken bir hata oluştu"
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
          <h1 className="text-2xl font-bold">E-posta Gönderildi!</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Şifre sıfırlama kodu kurtarıcı e-posta adresinize gönderildi. 
            Lütfen e-posta kutunuzu kontrol edin ve kodu kullanarak şifrenizi sıfırlayın.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => router.push("/giris")}
            className="w-full"
          >
            Giriş Sayfasına Dön
          </Button>
          <Button 
            variant="outline"
            onClick={() => setIsSubmitted(false)}
            className="w-full"
          >
            Tekrar Dene
          </Button>
        </div>
      </div>
    )
  }

  const { onSubmit, ...formProps } = props as any;
  
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleSubmit} {...formProps}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Şifremi Unuttum</h1>
        <p className="text-muted-foreground text-sm text-balance">
          E-posta adresinizi girerek kurtarıcı e-postanıza şifre sıfırlama kodu alın
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
              required 
              onKeyPress={handleKeyPress}
              className="rounded-r-none h-10"
            />
            <span className="bg-muted border border-l-0 border-input px-3 h-10 flex items-center text-sm text-muted-foreground rounded-r-md">
              @gozdedijital.xyz
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Şifre sıfırlama kodu kurtarıcı e-posta adresinize gönderilecektir
          </p>
        </div>
        <Button type="submit" className="w-full">
          Şifre Sıfırlama Kodu Gönder
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
