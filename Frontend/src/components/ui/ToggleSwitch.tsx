import React from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

interface ToggleSwitchProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  isLoading?: boolean;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  enabled,
  onChange,
  isLoading = false,
  label,
  disabled = false,
  size = 'md',
}) => {
  const handleToggle = () => {
    if (!disabled && !isLoading) {
      onChange(!enabled);
    }
  };

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-2 cursor-pointer" onClick={handleToggle}>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        disabled={disabled || isLoading}
        className={clsx(
          'relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-dinora-gold focus:ring-offset-2 disabled:opacity-50',
          isSmall ? 'h-5 w-9' : 'h-6 w-11',
          enabled ? 'bg-emerald-500' : 'bg-gray-300'
        )}
      >
        <span
          className={clsx(
            'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out flex items-center justify-center',
            isSmall ? 'h-4 w-4 translate-y-0.5' : 'h-5 w-5 translate-y-0.5',
            enabled
              ? isSmall
                ? 'translate-x-4.5'
                : 'translate-x-5.5'
              : 'translate-x-0.5'
          )}
        >
          {isLoading && <Loader2 className="w-3 h-3 text-dinora-chocolate animate-spin" />}
        </span>
      </button>
      {label && <span className="text-xs font-medium text-dinora-chocolate select-none">{label}</span>}
    </div>
  );
};
