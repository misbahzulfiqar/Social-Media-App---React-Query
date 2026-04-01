import type { ComponentProps } from "react"

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

export function Loading({ className, ...props }: ComponentProps<"svg">) {
  return <Spinner {...props} className={cn("text-white", className)} />
}

