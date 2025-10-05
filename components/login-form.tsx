"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/redux/hook"
import { login } from "@/redux/actions/userActions"
import { toast } from "sonner"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const dispatch = useAppDispatch()

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
    
    // Add @gozdedijital.xyz domain if not present
    const fullEmail = email.includes("@") ? email : `${email}@gozdedijital.xyz`
    
    const loginData = {
      email: fullEmail,
      password: password
    }
    
    console.log("Login data:", loginData)
    const loadingToastId = toast.loading("Giriş yapılıyor...")
    
    try {
      // Call Redux action for login
      const result = await dispatch(login(loginData)).unwrap()
      console.log("Login result:", result)
      
      // Dismiss loading toast
      toast.dismiss(loadingToastId)
      
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
          <Input id="email" name="email" type="email" placeholder="ornek@email.com" required />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Şifre</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Şifrenizi mi unuttunuz?
            </a>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Giriş Yap
        </Button>
      </div>
      <div className="text-center text-sm">
        Hesabınız yok mu?{" "}
        <a href="/register" className="underline underline-offset-4">
          Kayıt ol
        </a>
      </div>
    </form>
  )
}
