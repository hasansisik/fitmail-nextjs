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
  const [email, setEmail] = useState('')

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
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
      
      // Success - redirect to reset password page
      toast.success("Şifre sıfırlama kodu kurtarıcı e-posta adresinize gönderildi!")
      // Redirect to reset password page with email parameter
      router.push(`/sifre-sifirla?email=${encodeURIComponent(cleanEmail)}`)
    } catch (error: any) {
      console.error("Forgot password failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Şifre sıfırlama e-postası gönderilirken bir hata oluştu"
      toast.error(errorMessage)
    }
  }


  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleEmailSubmit}>
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
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
