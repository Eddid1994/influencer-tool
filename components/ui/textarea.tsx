import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[120px] w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm",
        "resize-none transition-all duration-200 placeholder:text-gray-400",
        "hover:bg-white hover:border-gray-300",
        "focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gray-700 dark:bg-gray-900/50 dark:hover:bg-gray-900 dark:focus:bg-gray-900",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
