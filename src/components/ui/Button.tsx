import { clsx } from 'clsx'
import type { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export default function Button({ className, variant = 'primary', ...props }: Props) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60'
  const styles = {
    primary: 'bg-zinc-900 text-zinc-50 hover:bg-zinc-800',
    secondary: 'border border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50',
    ghost: 'text-zinc-700 hover:bg-zinc-100',
  } as const

  return <button className={clsx(base, styles[variant], className)} {...props} />
}
