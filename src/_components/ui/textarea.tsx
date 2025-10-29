import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none",
        "focus:border-gray-400 focus:ring-1 focus:ring-gray-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
