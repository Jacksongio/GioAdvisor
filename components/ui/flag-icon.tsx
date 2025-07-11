import { cn } from "@/lib/utils"

interface FlagIconProps {
  countryCode: string
  className?: string
}

export function FlagIcon({ countryCode, className }: FlagIconProps) {
  if (!countryCode || countryCode.length !== 2) {
    return <div className={cn("inline-block w-6 h-4 bg-gray-300 rounded", className)} />
  }
  
  return (
    <span 
      className={cn("fi", `fi-${countryCode.toLowerCase()}`, "inline-block", className)} 
    />
  )
} 