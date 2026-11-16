/** Tamanho com quantidade em estoque (0 = indisponível no catálogo) */
export interface ProductSize {
  label: string;
  stock: number;
}

export interface Product {
  id: number | string;
  name: string;
  category?: string;
  categoryLabel?: string;
  collection?: string;
  price: number;
  originalPrice?: number;
  badge?: 'novo' | 'hot' | 'sale';
  sizes: ProductSize[];
  emoji?: string;
  bgColor?: string;
  whatsappMessage?: string;
  description?: string;
  colors?: string[];
  /** URL, caminho em /assets ou data:image (upload admin) */
  image?: string;
  /** Oculto no catálogo público */
  hidden?: boolean;
}
