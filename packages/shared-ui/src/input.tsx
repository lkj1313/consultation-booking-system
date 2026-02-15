import type { InputHTMLAttributes } from 'react';
import { cn } from './cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({ className, type, ...props }: InputProps) => (
  <input
    type={type}
    className={cn(
      'flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-700 disabled:cursor-not-allowed disabled:opacity-50',
      className,
    )}
    {...props}
  />
);
