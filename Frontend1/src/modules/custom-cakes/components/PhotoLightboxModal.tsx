import React from 'react';
import { LightboxModal } from '../../../components/ui/LightboxModal';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
}) => {
  return (
    <LightboxModal
      isOpen={isOpen}
      onClose={onClose}
      imageUrl={imageUrl}
      title="Mijoz Yuklagan Rasm (Buyurtma Tort)"
    />
  );
};
