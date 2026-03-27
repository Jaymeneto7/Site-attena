import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  // O BehaviorSubject guarda o estado (true = aberto, false = fechado)
  private cartOpen = new BehaviorSubject<boolean>(false);
  
  // Observable para os componentes "escutarem"
  isCartOpen$ = this.cartOpen.asObservable();

  toggleCart() {
    this.cartOpen.next(!this.cartOpen.value);
  }
}