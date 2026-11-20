import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform,filter] duration-150 ease-out active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'btn-primary hover:shadow-[0_6px_16px_-6px_color-mix(in_oklab,var(--accent)_70%,transparent)]',
        dark: 'surface-graphite hover:brightness-125',
        destructive:
          'bg-danger text-white hover:brightness-110 hover:shadow-[0_6px_16px_-6px_color-mix(in_oklab,var(--danger)_70%,transparent)]',
        outline:
          'border border-line-strong bg-surface text-ink hover:border-ink-3 hover:shadow-[0_4px_12px_-6px_rgb(23_24_28/0.18)]',
        secondary: 'bg-surface-3 text-ink hover:bg-line-strong',
        ghost: 'text-ink-2 hover:bg-surface-3 hover:text-ink',
        link: 'text-accent underline-offset-4 hover:underline px-0',
        soft: 'bg-accent-soft text-accent-soft-ink hover:brightness-95',
      },
      size: {
        default: 'h-9 px-4',
        sm: 'h-8 px-3.5 text-[13px]',
        xs: 'h-7 px-2.5 text-xs',
        lg: 'h-11 px-6 text-[15px]',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends ComponentProps<'button'>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { buttonVariants }
