import * as React from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'ghost' | 'accent-outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-ui font-medium cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-base transition-transform duration-instant ease-standard active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

    const variantStyles = {
      primary:
        'bg-accent-500 hover:bg-accent-600 text-text-on-accent shadow-accent-glow font-semibold',
      secondary:
        'bg-bg-elevated hover:bg-bg-surface text-text-primary border border-border hover:border-border-hover',
      glass:
        'glass text-text-primary border border-border hover:border-border-hover hover:bg-bg-elevated',
      ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-bg-elevated',
      'accent-outline':
        'bg-transparent border border-accent-500 text-accent-400 hover:bg-accent-soft hover:text-accent-300',
    }

    const sizeStyles = {
      sm: 'text-caption py-1.5 px-3 gap-1.5 rounded-sm',
      md: 'text-body-sm py-2.5 px-4 gap-2 rounded-md',
      lg: 'text-body py-3.5 px-6 gap-2.5 rounded-md font-semibold',
      icon: 'p-2.5 rounded-full aspect-square',
    }

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variantStyles[variant], sizeStyles[size], className))}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'
