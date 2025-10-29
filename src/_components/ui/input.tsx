import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-gray-300 bg-white px-3 py-1 text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none",
        "focus:border-gray-400 focus:ring-1 focus:ring-gray-400",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-gray-900",
        "aria-invalid:border-red-500 aria-invalid:focus:ring-red-500",
        className
      )}
      {...props}
    />
  )
}

export { Input }
