import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Hesabınıza giriş yapın</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Hesabınıza giriş yapmak için e-posta adresinizi girin
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">E-posta</Label>
          <Input id="email" type="email" placeholder="ornek@email.com" required />
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
          <Input id="password" type="password" required />
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
