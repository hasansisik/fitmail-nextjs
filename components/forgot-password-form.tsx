"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { verifyRecoveryEmail, forgotPassword } from "@/redux/actions/userActions"
import { toast } from "sonner"
import { useState } from "react"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [email, setEmail] = useState('')
  const [step, setStep] = useState<'email' | 'recovery' | 'sending'>('email')
  const [recoveryEmailMask, setRecoveryEmailMask] = useState('')
  const [recoveryHint, setRecoveryHint] = useState('')

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
    
    console.log("Verifying recovery email for:", fullEmail)
    const loadingToastId = toast.loading("Kurtarıcı e-posta kontrol ediliyor...")
    
    try {
      // Step 1: Verify that user has a recovery email
      const result = await dispatch(verifyRecoveryEmail({ email: fullEmail })).unwrap()
      console.log("Recovery email verification result:", result)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Success - show recovery email mask and ask for verification
      setRecoveryEmailMask(result.recoveryEmailMask)
      setStep('recovery')
      toast.success("Kurtarıcı e-posta bulundu!")
    } catch (error: any) {
      console.error("Recovery email verification failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Kurtarıcı e-posta adresi kontrol edilirken bir hata oluştu"
      toast.error(errorMessage)
    }
  }

  const handleRecoveryVerification = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Validate input
    if (!recoveryHint || recoveryHint.trim() === '') {
      toast.error("Lütfen kurtarıcı e-posta adresinizi eksiksiz girin!")
      return
    }
    
    const cleanEmail = email.replace('@', '').trim()
    const fullEmail = `${cleanEmail}@gozdedijital.xyz`
    
    console.log("Verifying recovery email hint:", recoveryHint)
    const loadingToastId = toast.loading("Doğrulanıyor...")
    
    try {
      // Verify recovery email hint
      await dispatch(verifyRecoveryEmail({ 
        email: fullEmail, 
        recoveryEmailHint: recoveryHint 
      })).unwrap()
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Step 2: Send password reset code
      setStep('sending')
      const sendingToastId = toast.loading("Şifre sıfırlama kodu gönderiliyor...")
      
      const result = await dispatch(forgotPassword(fullEmail)).unwrap()
      console.log("Forgot password result:", result)
      
      // Dismiss loading toast
      toast.dismiss(sendingToastId)
      
      // Success - redirect to reset password page
      toast.success("Şifre sıfırlama kodu kurtarıcı e-posta adresinize gönderildi! (10 dakika geçerli)")
      // Redirect to reset password page with email parameter
      router.push(`/sifre-sifirla?email=${encodeURIComponent(cleanEmail)}`)
    } catch (error: any) {
      console.error("Recovery verification or password reset failed:", error)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
      // Show error message
      const errorMessage = typeof error === 'string' ? error : error?.message || "Bir hata oluştu"
      toast.error(errorMessage)
      
      // If verification failed, allow them to try again
      if (errorMessage.includes("doğrulanamadı")) {
        setRecoveryHint('')
      }
    }
  }


  // Step 1: Enter Fitmail email
  if (step === 'email') {
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
            Devam Et
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

  // Step 2: Verify recovery email
  return (
    <form className={cn("flex flex-col gap-6", className)} onSubmit={handleRecoveryVerification}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Kurtarıcı E-posta Doğrulama</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Güvenlik için kurtarıcı e-posta adresinizi doğrulayın
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label>Kurtarıcı E-posta Adresiniz</Label>
          <div className="bg-muted p-3 rounded-md border text-center">
            <p className="font-mono text-sm">{recoveryEmailMask}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Bu e-posta adresine şifre sıfırlama kodu gönderilecek
          </p>
        </div>
        <div className="grid gap-3">
          <Label htmlFor="recoveryHint">Kurtarıcı E-posta Adresiniz</Label>
          <Input 
            id="recoveryHint" 
            name="recoveryHint" 
            type="text" 
            placeholder="ornek@gmail.com" 
            value={recoveryHint}
            onChange={(e) => setRecoveryHint(e.target.value)}
            required 
            className="h-10"
          />
          <p className="text-xs text-muted-foreground">
            Lütfen kayıtlı olan kurtarıcı e-posta adresinizi eksiksiz girin.
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              setStep('email')
              setRecoveryHint('')
              setRecoveryEmailMask('')
            }}
          >
            Geri
          </Button>
          <Button type="submit" className="flex-1">
            Kod Gönder
          </Button>
        </div>
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
