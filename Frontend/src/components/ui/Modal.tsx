import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dinora-chocolate/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-6 text-center">
        <div
          className={clsx(
            'relative w-full transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white text-left align-middle shadow-2xl transition-all border border-dinora-border animate-in zoom-in-95 duration-200',
            maxWidthStyles[maxWidth]
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-dinora-border px-4 sm:px-6 py-3.5 sm:py-4 bg-dinora-bg/50">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-dinora-chocolate font-serif leading-tight">{title}</h3>
              {subtitle && <p className="text-[11px] sm:text-xs text-dinora-gray mt-0.5 line-clamp-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-dinora-gray hover:bg-dinora-bg hover:text-dinora-chocolate transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-[85vh] overflow-y-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};

