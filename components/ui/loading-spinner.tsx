import { GalleryVerticalEnd } from "lucide-react"
import { cn } from "@/lib/utils"

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
  const logoSizes = {
    sm: "size-5",
    md: "size-6",
    lg: "size-7"
  }

  const iconSizes = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5"
  }

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl"
  }

  const barWidths = {
    sm: "w-16",
    md: "w-20",
    lg: "w-24"
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {/* Fitmail Logo + Text */}
      <div className={cn("flex items-center gap-2 font-bold", textSizes[size])}>
        <div className={cn(
          "bg-primary text-primary-foreground flex items-center justify-center rounded-md animate-pulse",
          logoSizes[size]
        )}>
          <GalleryVerticalEnd className={iconSizes[size]} />
        </div>
        <span className="animate-pulse">Fitmail</span>
      </div>
      
      {/* Animated Loading Bar */}
      <div className={cn("h-1 bg-primary/20 rounded-full overflow-hidden", barWidths[size])}>
        <div className="h-full bg-primary animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
      
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

