import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent text-white shadow-subtle hover:bg-accent-hover',
  secondary: 'border border-line bg-elevated text-ink hover:border-line-strong hover:bg-raised',
  ghost: 'text-ink-muted hover:bg-elevated hover:text-ink',
  danger: 'border border-line bg-transparent text-danger hover:bg-danger-soft',
}

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm sm:h-8',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-[0.9375rem]',
}

/* Com `wrap`, o rótulo longo quebra em vez de passar da borda: a altura deixa
   de ser fixa e vira um mínimo. Existe para a tela estreita — um rótulo de
   quatro palavras não cabe numa linha em 320 px. */
const WRAP_SIZES: Record<Size, string> = {
  sm: 'min-h-9 px-3 py-1.5 text-sm',
  md: 'min-h-10 px-4 py-2 text-sm',
  lg: 'min-h-11 px-5 py-2.5 text-[0.9375rem]',
}

const sizeClass = (size: Size, wrap: boolean) =>
  wrap ? `${WRAP_SIZES[size]} text-left whitespace-normal` : `${SIZES[size]} whitespace-nowrap`

interface CommonProps {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  /** Deixa o rótulo quebrar linha, para rótulos longos em tela estreita. */
  wrap?: boolean
  className?: string
  children: ReactNode
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  wrap = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANTS[variant], sizeClass(size, wrap), fullWidth && 'w-full', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}

interface ButtonLinkProps extends CommonProps {
  to: string
}

export function ButtonLink({
  to,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  wrap = false,
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      className={cn(BASE, VARIANTS[variant], sizeClass(size, wrap), fullWidth && 'w-full', className)}
    >
      {children}
    </Link>
  )
}
