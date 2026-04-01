import { clsx } from 'clsx'
import type { TextareaHTMLAttributes } from 'react'

type Props = TextareaHTMLAttributes<HTMLTextAreaElement>

export default function Textarea({ className, ...props }: Props) {
  return (
    <textarea
      className={clsx(
        'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-4 focus:ring-zinc-200',
        className,
      )}
      {...props}
    />
  )
}
