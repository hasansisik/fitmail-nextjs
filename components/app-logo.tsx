"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

type LogoSize = "sm" | "md" | "lg"

const imageSizes: Record<LogoSize, { width: number; height: number }> = {
  sm: { width: 120, height: 32 },
  md: { width: 130, height: 34 },
  lg: { width: 140, height: 36 },
}

const barWidths: Record<LogoSize, string> = {
  sm: "w-16",
  md: "w-20",
  lg: "w-24",
}

interface AppLogoProps {
  size?: LogoSize
  className?: string
  priority?: boolean
}

export function AppLogo({ size = "md", className, priority = true }: AppLogoProps) {
  const dims = imageSizes[size]
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/logotext.png" alt="Fitmail" width={dims.width} height={dims.height} priority={priority} />
    </div>
  )
}

interface AppLogoWithLoadingProps extends AppLogoProps {
  barClassName?: string
}

export function AppLogoWithLoading({ size = "md", className, barClassName, priority = true }: AppLogoWithLoadingProps) {
  const dims = imageSizes[size]
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center gap-2 font-bold">
        <Image src="/logotext.png" alt="Fitmail" width={dims.width} height={dims.height} priority={priority} />
      </div>
      <div className={cn("h-1 bg-purple/20 rounded-full overflow-hidden", barWidths[size], barClassName)}>
        <div className="h-full bg-purple animate-[loading_1.5s_ease-in-out_infinite]" />
      </div>
    </div>
  )
}


