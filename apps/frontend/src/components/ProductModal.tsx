'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/database.types';

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ product, isOpen, onClose }: ProductModalProps) {
  const router = useRouter();

  useEffect(() => {
    if (isOpen && product) {
      // Create slug: id-name
      const slug = `${product.id}-${product.name.toLowerCase().replace(/\s+/g, '-')}`;
      
      // Navigate to product page
      router.push(`/producto/${slug}`);
      onClose();
    }
  }, [isOpen, product, router, onClose]);

  return null;
}
