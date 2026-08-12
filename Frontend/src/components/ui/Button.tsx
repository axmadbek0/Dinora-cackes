import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-dinora-chocolate text-white hover:bg-dinora-chocolate-hover focus:ring-dinora-chocolate shadow-sm hover:shadow',
    secondary:
      'bg-white text-dinora-chocolate border border-dinora-border hover:bg-dinora-bg focus:ring-dinora-gold shadow-sm',
    gold:
      'bg-dinora-gold text-dinora-chocolate font-semibold hover:bg-dinora-gold-hover focus:ring-dinora-gold shadow-sm',
    outline:
      'border-2 border-dinora-chocolate text-dinora-chocolate hover:bg-dinora-chocolate hover:text-white focus:ring-dinora-chocolate',
    danger:
      'bg-dinora-pink text-white hover:bg-dinora-pink-hover focus:ring-dinora-pink shadow-sm',
    ghost:
      'text-dinora-chocolate hover:bg-dinora-gold-light/40 focus:ring-dinora-gold',
  };

  return (
    <button
      className={clsx(baseStyles, sizeStyles[size], variantStyles[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        icon && <span className="inline-flex shrink-0">{icon}</span>
      )}
      <span>{children}</span>
    </button>
  );
};
