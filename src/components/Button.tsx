import { motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../utils/cn'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  type = 'button',
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-900 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl',
    secondary: 'bg-dark-700 hover:bg-dark-600 text-white border border-dark-600 hover:border-dark-500',
    outline: 'border border-primary-600 text-primary-400 hover:bg-primary-600 hover:text-white',
    ghost: 'text-dark-400 hover:text-white hover:bg-dark-700',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
      )}
      {children}
    </motion.button>
  )
}

export default Button