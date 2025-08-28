import React from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';

interface LinkButtonProps {
  href: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  external?: boolean; // Para links externos
}

export default function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className,
  external = false,
  ...props
}: LinkButtonProps) {
  // Reutilizamos exactamente los mismos estilos que Button
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    primary: 'bg-argentinian-blue text-white hover:bg-primary-700 focus:ring-argentinian-blue',
    secondary: 'bg-cinereous text-white hover:bg-secondary-700 focus:ring-cinereous',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-argentinian-blue',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-argentinian-blue',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
  };

  const linkClasses = clsx(
    baseStyles,
    variants[variant],
    sizes[size],
    fullWidth && 'w-full',
    className
  );

  // Si es external, usar <a> normal, sino usar Next.js Link
  if (external) {
    return (
      <a
        href={href}
        className={linkClasses}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </a>
    );
  }

  return (
    <Link href={href} className={linkClasses} {...props}>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </Link>
  );
}