import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "aqua-focus inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-normal disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // The blue "default button" Return activates. One per window.
        default: "aqua-default text-primary-foreground",
        destructive: "aqua-danger text-destructive-foreground",
        outline: "aqua-push text-foreground",
        secondary: "aqua-push text-foreground",
        ghost: "hover:bg-black/10 dark:hover:bg-white/10",
        link: "text-primary underline-offset-2 hover:underline",
      },
      size: {
        default: "h-8 px-4 py-1",
        sm: "h-7 rounded-md px-3 text-xs",
        lg: "h-9 rounded-md px-8",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
