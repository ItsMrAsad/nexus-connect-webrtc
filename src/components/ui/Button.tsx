'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  isActive?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, isActive, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    // Separate motion-specific props from standard button props if necessary, 
    // or just ensure standard button props don't collide with motion internal types.
    // In this case, we'll cast props to any to avoid the complex motion.button vs ButtonHTMLAttributes conflict
    // which is common in Framer Motion + React 19.
    const buttonProps = props as any;
    
    const variants = {
      primary: 'btn-premium',
      glass: cn('btn-glass', isActive && 'active'),
      danger: 'btn-danger',
      ghost: 'hover:bg-white/5 text-slate-400 hover:text-white',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-6 py-3 text-sm',
      lg: 'px-8 py-4 text-base',
      icon: 'p-2.5 w-10 h-10',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          size !== 'icon' && sizes[size],
          size === 'icon' && sizes.icon,
          className
        )}
        {...buttonProps}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
