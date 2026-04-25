import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, Router } from '@angular/router';
import { CartService, CartItem } from './services/cart.service';
import { OrderService } from './services/order.service';
import { ProductService } from './services/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Attena';
  showCart = false;
  showConfirmModal = false;
  confirmLoading = false;
  confirmError = '';
  customerName = '';
  cartItems: CartItem[] = [];
  private cartSubscription?: Subscription;

  constructor(public cartService: CartService, public router: Router, private orderService: OrderService, private productService: ProductService) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.items$.subscribe(items => {
      this.cartItems = items;
    });
    this.cartService.openCart$.subscribe(() => { this.showCart = true; });
  }

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  }

  get isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }

  closeCart(): void { this.showCart = false; }

  clearCart(): void { this.cartService.clearCart(); }

  removeItem(id: string | number, size?: string, color?: string): void {
    this.cartService.removeItem(id, size, color);
  }

  openConfirmModal(): void {
    this.confirmError = '';
    this.showConfirmModal = true;
  }

  closeConfirmModal(): void {
    if (this.confirmLoading) return;
    this.showConfirmModal = false;
    this.confirmError = '';
  }

  async finalizeOrder(): Promise<void> {
    const items = this.cartService.getItems();
    if (!items.length) return;

    this.confirmLoading = true;
    this.confirmError = '';

    try {
      const total = this.cartService.getTotalPrice();
      await this.orderService.saveOrder(items, total, this.customerName.trim() || undefined);
      await this.productService.decrementStockForOrder(items);

      const WHATSAPP_NUMBER = '5562982437603';
      const namePrefix = this.customerName.trim() ? `*Cliente:* ${this.customerName.trim()}\n\n` : '';
      const lines = items.map(i => {
        const details = [i.size, i.color].filter(Boolean).join(', ');
        const detailsInfo = details ? ` (${details})` : '';
        return `• ${i.name}${detailsInfo} x${i.quantity ?? 1} — R$ ${i.price.toFixed(2).replace('.', ',')}`;
      }).join('\n');
      const totalStr = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const msg = `*Novo Pedido:*\n\n${namePrefix}${lines}\n\n*Total: ${totalStr}*`;

      this.cartService.clearCart();
      this.showCart = false;
      this.showConfirmModal = false;
      this.customerName = '';
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    } catch (err) {
      console.error('Erro ao finalizar pedido:', err);
      this.confirmError = 'Erro ao registrar o pedido. Tente novamente.';
    } finally {
      this.confirmLoading = false;
    }
  }
}