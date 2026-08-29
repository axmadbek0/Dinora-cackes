import React, { useState, useEffect } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { CustomCakeRequest, CustomCakeStatus } from '../../../types/custom-cake.types';
import { DollarSign, FileText } from 'lucide-react';

interface PriceOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: CustomCakeRequest | null;
  onSubmit: (id: string, estimatedPrice: number, adminNotes?: string) => void;
  isLoading?: boolean;
}

export const PriceOfferModal: React.FC<PriceOfferModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmit,
  isLoading = false,
}) => {
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (request) {
      setPrice(request.estimatedPrice ? String(request.estimatedPrice) : '');
      setNotes(request.adminNotes || '');
      setError('');
    }
  }, [request, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      setError("Iltimos, to'g'ri baholash narxini kiriting (masalan: 350000)");
      return;
    }

    if (request) {
      onSubmit(request.id, Number(price), notes.trim() || undefined);
    }
  };

  if (!request) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`#${request.requestNumber} - Tort Buyurtma Narxini Belgilash`}
      subtitle="Mijoz yuklagan rasm va tavsif asosida narx belgilang"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Custom Details Summary */}
        <div className="bg-dinora-bg p-3.5 rounded-xl border border-dinora-border text-xs text-dinora-chocolate space-y-1">
          <p>
            <strong>Shakli:</strong>{' '}
            {request.customDetails?.shape || (request.description.match(/Shakli:\s*([^|]+)/i)?.[1]?.trim()) || 'Belgilanmagan'}
          </p>
          <p>
            <strong>Krem:</strong>{' '}
            {request.customDetails?.cream || (request.description.match(/Krem:\s*([^|]+)/i)?.[1]?.trim()) || 'Slivki'}
          </p>
          <p>
            <strong>Yozuv:</strong> "
            {request.customDetails?.customText || (request.description.match(/Yozuv:\s*"([^"]+)"/i)?.[1]?.trim()) || request.description}"
          </p>
          <p>
            <strong>Masofa:</strong>{' '}
            {request.distanceKm || (request.description.match(/Masofa:\s*([\d.]+)\s*km/i)?.[1]) || '2.0'} km (Delivery:{' '}
            {request.deliveryFee !== undefined && request.deliveryFee !== null
              ? typeof request.deliveryFee === 'number'
                ? request.deliveryFee.toLocaleString('uz-UZ')
                : request.deliveryFee
              : request.description.match(/Yetkazish:\s*([\d,\s]+)\s*UZS/i)?.[1] || '0'}{' '}
            UZS)
          </p>
        </div>

        {/* Estimated Price Input */}
        <Input
          label="Taxminiy Narx (so'm)"
          type="number"
          placeholder="masalan: 350000"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setError('');
          }}
          error={error}
          leftIcon={<DollarSign className="w-4 h-4" />}
          required
        />

        {/* Admin Notes */}
        <div>
          <label className="block text-xs font-semibold text-dinora-chocolate uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5 text-dinora-gold" />
            <span>Admin izohi (Mijozga Telegram orqali yuboriladi)</span>
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tort Og'irligi ~3kg, pishirish muddati 1 kun..."
            className="w-full rounded-xl border border-dinora-border bg-white p-3 text-sm text-dinora-chocolate focus:border-dinora-gold focus:outline-none focus:ring-2 focus:ring-dinora-gold/30 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dinora-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button type="submit" variant="gold" isLoading={isLoading}>
            💰 Narxni Taklif Qilish
          </Button>
        </div>
      </form>
    </Modal>
  );
};
