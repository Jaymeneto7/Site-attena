export interface Product {
  id: number | string;
  name: string;
  category?: 'tops' | 'leggings' | 'shorts' | 'conjuntos' | 'masculino';
  categoryLabel?: string;
  price: number;
  originalPrice?: number;
  badge?: 'novo' | 'hot' | 'sale';
  sizes: { label: string; available: boolean }[] | string[];
  emoji?: string;
  bgColor?: string;
  whatsappMessage?: string;
  description?: string;
  colors?: string[];
  image?: string;
}