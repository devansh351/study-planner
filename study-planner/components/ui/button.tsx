import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: 'default' | 'destructive' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
  }
>(({ className, variant = 'default', size = 'default', ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        {
          'default': 'bg-primary text-primary-foreground hover:bg-primary/90',
          'destructive': 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
          'outline': 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
          'ghost': 'hover:bg-accent hover:text-accent-foreground'
        }[variant],
        {
          'default': 'h-10 px-4 py-2',
          'sm': 'h-9 rounded-md px-3',
          'lg': 'h-11 rounded-md px-8'
        }[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }