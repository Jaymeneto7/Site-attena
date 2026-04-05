import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product, ProductSize } from '../models/product.model';
import { SupabaseService } from './supabase.service';


const STORAGE_KEY = 'athena_products_v1';

const SEED_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Top Sculpt',
    category: 'tops',
    categoryLabel: 'Top',
    price: 129,
    badge: 'novo',
    sizes: [
      { label: 'P', stock: 4 },
      { label: 'M', stock: 8 },
      { label: 'G', stock: 0 },
      { label: 'GG', stock: 3 },
    ],
    emoji: '🩱',
    bgColor: '#f0ede0',
    whatsappMessage: 'Olá! Tenho interesse no *Top Sculpt* (R$129). Poderia me ajudar?',
  },
  {
    id: 2,
    name: 'Legging Power',
    category: 'leggings',
    categoryLabel: 'Calça',
    price: 189,
    badge: 'hot',
    sizes: [
      { label: 'P', stock: 2 },
      { label: 'M', stock: 5 },
      { label: 'G', stock: 6 },
      { label: 'GG', stock: 0 },
    ],
    emoji: '🩲',
    bgColor: '#eaf0ea',
    whatsappMessage: 'Olá! Tenho interesse na *Legging Power* (R$189). Poderia me ajudar?',
  },
  {
    id: 3,
    name: 'Dry Fit Masculino',
    category: 'masculino',
    categoryLabel: 'Camiseta masculina',
    price: 89,
    originalPrice: 129,
    badge: 'sale',
    sizes: [
      { label: 'P', stock: 0 },
      { label: 'M', stock: 4 },
      { label: 'G', stock: 7 },
      { label: 'GG', stock: 5 },
    ],
    emoji: '👕',
    bgColor: '#f0ece8',
    whatsappMessage: 'Olá! Tenho interesse na *Camiseta Dry Fit Masculino* (R$89). Poderia me ajudar?',
  },
  {
    id: 4,
    name: 'Conjunto Run',
    category: 'conjuntos',
    categoryLabel: 'Conjunto feminino',
    price: 259,
    badge: 'novo',
    sizes: [
      { label: 'P', stock: 3 },
      { label: 'M', stock: 0 },
      { label: 'G', stock: 2 },
      { label: 'GG', stock: 0 },
    ],
    emoji: '🩳',
    bgColor: '#eaeaf0',
    whatsappMessage: 'Olá! Tenho interesse no *Conjunto Run* (R$259). Poderia me ajudar?',
  },
  {
    id: 5,
    name: 'Shorts Active',
    category: 'shorts',
    categoryLabel: 'Shorts masculino',
    price: 99,
    badge: 'hot',
    sizes: [
      { label: 'P', stock: 3 },
      { label: 'M', stock: 4 },
      { label: 'G', stock: 0 },
      { label: 'GG', stock: 2 },
    ],
    emoji: '🩳',
    bgColor: '#f0eae0',
    whatsappMessage: 'Olá! Tenho interesse no *Shorts Active* (R$99). Poderia me ajudar?',
  },
  {
    id: 6,
    name: 'Top Essential',
    category: 'tops',
    categoryLabel: 'Top',
    price: 99,
    originalPrice: 124,
    badge: 'sale',
    sizes: [
      { label: 'P', stock: 6 },
      { label: 'M', stock: 6 },
      { label: 'G', stock: 5 },
      { label: 'GG', stock: 4 },
    ],
    emoji: '🩱',
    bgColor: '#eaf0f0',
    whatsappMessage: 'Olá! Tenho interesse no *Top Essential* (R$99). Poderia me ajudar?',
  },
];

function normalizeSize(raw: unknown): ProductSize {
  if (typeof raw === 'string') return { label: raw.trim(), stock: 10 };
  const o = raw as { label?: string; stock?: number; available?: boolean };
  const label = String(o?.label ?? '').trim() || '?';
  let stock = typeof o?.stock === 'number' ? o.stock : NaN;
  if (Number.isNaN(stock)) stock = o?.available === false ? 0 : 5;
  return { label, stock: Math.max(0, Math.floor(stock)) };
}

function normalizeProduct(p: Product): Product {
  const sizes = (p.sizes ?? []).map(s => normalizeSize(s as unknown));
  
  // Preserva UUID (string) do Supabase; converte para número apenas IDs numéricos locais
  let id: number | string = p.id;
  if (id == null) {
    id = 0;
  } else if (typeof id === 'string') {
    const numId = Number(id);
    // Se não for um número puro (ex: UUID), mantém como string
    id = Number.isFinite(numId) && String(numId) === id.trim() ? numId : id;
  } else if (typeof id === 'number' && isNaN(id)) {
    id = 0;
  }
  
  return { 
    ...p, 
    id: id,
    sizes: sizes.length ? sizes : [{ label: 'Único', stock: 0 }] 
  };
}

// Converte produto do Supabase para o modelo local
function fromSupabase(row: Record<string, unknown>): Product {
  return normalizeProduct({
    id: row['id'] as string,
    name: row['name'] as string,
    description: row['description'] as string | undefined,
    price: Number(row['price']),
    originalPrice: row['original_price'] ? Number(row['original_price']) : undefined,
    category: row['category'] as 'tops' | 'leggings' | 'shorts' | 'conjuntos' | 'masculino' | undefined,
    categoryLabel: row['category_label'] as string | undefined,
    badge: row['badge'] as 'novo' | 'hot' | 'sale' | undefined,
    emoji: row['emoji'] as string | undefined,
    bgColor: row['bg_color'] as string | undefined,
    image: row['image'] as string | undefined,
    colors: row['colors'] as string[] | undefined,
    sizes: row['sizes'] as ProductSize[] ?? [],
    whatsappMessage: row['whatsapp_message'] as string | undefined,
    hidden: row['hidden'] as boolean | undefined,
  });
}

// Converte produto local para o formato do Supabase
function toSupabase(p: Omit<Product, 'id'>): Record<string, unknown> {
  return {
    name: p.name,
    description: p.description ?? null,
    price: p.price,
    original_price: p.originalPrice ?? null,
    category: p.category ?? null,
    category_label: p.categoryLabel ?? null,
    badge: p.badge ?? null,
    emoji: p.emoji ?? null,
    bg_color: p.bgColor ?? null,
    image: p.image ?? null,
    colors: p.colors ?? null,
    sizes: p.sizes ?? [],
    whatsapp_message: p.whatsappMessage ?? null,
    hidden: p.hidden ?? false,
  };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private whatsappNumber = '5562982437603';
  private products: Product[] = [];
  private useSupabase = false;
  productsLoaded = new BehaviorSubject<Product[]>([]);

  constructor(private supabaseService: SupabaseService, private ngZone: NgZone) {
    this.init();
  }

  private async init(): Promise<void> {
  try {
    const { data, error } = await this.supabaseService.client
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (data && data.length > 0) {
      this.products = data.map(row => fromSupabase(row as Record<string, unknown>));
      this.useSupabase = true;
    } else {
      this.loadFromStorage();
      await this.migrateToSupabase();
    }
  } catch (err) {
    console.warn('⚠️ Supabase indisponível, usando localStorage:', err);
    this.loadFromStorage();
  }

  // Notifica que os produtos estão prontos (dentro da zone para disparar change detection)
  this.ngZone.run(() => this.productsLoaded.next(this.products));
}

  private async migrateToSupabase(): Promise<void> {
    try {
      for (const p of this.products) {
        const { id, ...rest } = p;
        await this.supabaseService.client
          .from('products')
          .insert(toSupabase(rest));
      }
      this.useSupabase = true;
      console.log('✅ Produtos migrados para o Supabase!');
      // Recarrega com IDs do Supabase
      const { data } = await this.supabaseService.client
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      if (data) this.products = data.map(row => fromSupabase(row as Record<string, unknown>));
    } catch (err) {
      console.warn('⚠️ Falha na migração:', err);
    }
    this.ngZone.run(() => this.productsLoaded.next(this.products));
  }

  private loadFromStorage(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Product[];
        this.products = parsed.map(normalizeProduct);
        return;
      } catch { /* fallback seed */ }
    }
    this.products = SEED_PRODUCTS.map(p => normalizeProduct({ ...p }));
    this.save();
  }

  private save(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
  }

  private nextId(): number {
    const nums = this.products.map(p => { const n = Number(p.id); return Number.isFinite(n) ? n : 0; });
    return (nums.length ? Math.max(...nums) : 0) + 1;
  }

  getProducts(): Product[] {
    return this.products.map(p => ({ ...p, sizes: p.sizes.map(s => ({ ...s })) }));
  }

  getProductById(id: string | number): Product | undefined {
    return this.products.find(p => String(p.id) === String(id));
  }

  async createProduct(data: Omit<Product, 'id'>): Promise<Product> {
    if (this.useSupabase) {
      const { data: rows, error } = await this.supabaseService.client
        .from('products')
        .insert(toSupabase(data))
        .select()
        .single();
      if (error) throw error;
      const product = fromSupabase(rows as Record<string, unknown>);
      this.products.push(product);
      return product;
    }
    // fallback localStorage
    const id = this.nextId();
    const normalized = normalizeProduct({ ...data, id, whatsappMessage: data.whatsappMessage ?? this.defaultWhatsappMessage({ ...data, id } as Product) });
    this.products.push(normalized);
    this.save();
    return normalized;
  }

  async updateProduct(product: Product): Promise<void> {
    if (this.useSupabase) {
      const { id, ...rest } = product;
      const payload = toSupabase(rest);
      console.log('🔄 Supabase update payload:', { id, payload });

      const { data, error } = await this.supabaseService.client
        .from('products')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Supabase update failed:', error, { id, payload });
        throw error;
      }

      if (data) {
        this.products = this.products.map(p => String(p.id) === String(id) ? fromSupabase(data as Record<string, unknown>) : p);
      }
    }
    const i = this.products.findIndex(p => String(p.id) === String(product.id));
    if (i !== -1) {
      this.products[i] = normalizeProduct({ ...product });
      if (!this.useSupabase) this.save();
    }
  }

  async deleteProduct(id: string | number): Promise<void> {
    if (this.useSupabase) {
      const { error } = await this.supabaseService.client
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
    this.products = this.products.filter(p => String(p.id) !== String(id));
    if (!this.useSupabase) this.save();
  }

  async toggleHidden(id: string | number): Promise<void> {
    const product = this.products.find(p => String(p.id) === String(id));
    if (!product) return;
    const newHidden = !product.hidden;
    if (this.useSupabase) {
      const { error } = await this.supabaseService.client
        .from('products')
        .update({ hidden: newHidden })
        .eq('id', id);
      if (error) throw error;
    }
    product.hidden = newHidden;
    if (!this.useSupabase) this.save();
  }

  totalStock(p: Product): number {
    return p.sizes.reduce((acc, s) => acc + s.stock, 0);
  }

  private defaultWhatsappMessage(p: Product): string {
    return `Olá! Tenho interesse no *${p.name}* (R$${p.price}). Poderia me ajudar?`;
  }

  openWhatsApp(message: string): void {
    window.open(`https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  }

  openWhatsAppGeneral(): void {
    this.openWhatsApp('Olá! Visitei o catálogo da Attena e gostaria de fazer um pedido.');
  }
}