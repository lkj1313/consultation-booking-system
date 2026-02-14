import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes, FC } from 'react';
import { cn } from './cn';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-slate-900 text-slate-50 shadow hover:bg-slate-700',
        outline: 'border border-slate-300 bg-white shadow-sm hover:bg-slate-100',
      },
      size: {
        default: 'h-11 px-4 py-2',
        lg: 'h-12 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  variant?: 'default' | 'outline';
  size?: 'default' | 'lg';
}

export const Button: FC<ButtonProps> = ({ className, variant, size, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
);
