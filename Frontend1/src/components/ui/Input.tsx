import React from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-dinora-gray">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              'block w-full rounded-xl border border-dinora-border bg-white px-3.5 py-2.5 text-sm text-dinora-chocolate placeholder-dinora-gray/60 transition-all focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 disabled:bg-dinora-bg disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-dinora-pink focus:border-dinora-pink focus:ring-dinora-pink/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-dinora-gray">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-dinora-pink font-medium">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-dinora-gray">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
