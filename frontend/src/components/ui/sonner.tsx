"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle2, Info, AlertTriangle, AlertCircle, Loader2 } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0" />
        ),
        info: (
          <Info className="size-4.5 text-sky-500 shrink-0" />
        ),
        warning: (
          <AlertTriangle className="size-4.5 text-amber-500 shrink-0" />
        ),
        error: (
          <AlertCircle className="size-4.5 text-rose-500 shrink-0" />
        ),
        loading: (
          <Loader2 className="size-4.5 animate-spin text-primary shrink-0" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border/80 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:font-sans",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-lg group-[.toast]:font-semibold group-[.toast]:text-xs",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-foreground group-[.toast]:rounded-lg group-[.toast]:font-medium group-[.toast]:text-xs",
          success:
            "group-[.toaster]:border-emerald-500/20 group-[.toaster]:bg-emerald-500/5 dark:group-[.toaster]:bg-emerald-950/20",
          error:
            "group-[.toaster]:border-rose-500/20 group-[.toaster]:bg-rose-500/5 dark:group-[.toaster]:bg-rose-950/20",
          warning:
            "group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-amber-500/5 dark:group-[.toaster]:bg-amber-950/20",
          info:
            "group-[.toaster]:border-sky-500/20 group-[.toaster]:bg-sky-500/5 dark:group-[.toaster]:bg-sky-950/20",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
