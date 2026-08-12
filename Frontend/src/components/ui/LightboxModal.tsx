import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
  title?: string;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Rasm ko\'rish',
}) => {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dinora-chocolate/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative max-w-4xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl border border-dinora-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-dinora-bg border-b border-dinora-border">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-5 h-5 text-dinora-gold" />
            <span className="font-serif font-bold text-dinora-chocolate">{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dinora-chocolate rounded-lg hover:bg-dinora-gold-light transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 flex items-center justify-center bg-stone-900 min-h-[350px] max-h-[75vh]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-lg"
          />
        </div>
      </div>
    </div>
  );
};
