import { cn } from "@/lib/utils"
import { AppLogoWithLoading } from "@/components/app-logo"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = "md", 
  text,
  className 
}: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <AppLogoWithLoading size={size} />
      
      {/* Optional Text */}
      {text && (
        <p className="text-sm text-muted-foreground mt-1">
          {text}
        </p>
      )}
    </div>
  )
}

// Tam sayfa loading komponenti
export function FullPageLoader({ text = "Yükleniyor..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px] h-full w-full">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

// Inline loading komponenti (küçük)
export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-8">
      <LoadingSpinner size="sm" text={text} />
    </div>
  )
}

