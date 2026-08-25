import React from 'react';
import { ToggleSwitch } from '../../../components/ui/ToggleSwitch';
import { useUpdateStock } from '../hooks/useProducts';

interface StockToggleProps {
  productId: string;
  isAvailable: boolean;
}

export const StockToggle: React.FC<StockToggleProps> = ({ productId, isAvailable }) => {
  const { mutate: updateStock, isPending } = useUpdateStock();

  const handleToggle = (newValue: boolean) => {
    updateStock({ id: productId, isAvailable: newValue });
  };

  return (
    <div className="flex items-center gap-2">
      <ToggleSwitch
        enabled={isAvailable}
        onChange={handleToggle}
        isLoading={isPending}
        size="sm"
      />
      <span
        className={`text-xs font-semibold select-none ${
          isAvailable ? 'text-emerald-700' : 'text-dinora-pink'
        }`}
      >
        {isAvailable ? 'Sotuvda mavjud' : 'Sotuvda tugagan'}
      </span>
    </div>
  );
};
