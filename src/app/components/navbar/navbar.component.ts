import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { WishlistService } from '../../services/wishlist.service';
import { LoginModalComponent } from '../login-modal/login-modal.component';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, LoginModalComponent],
  template: `
    <header>
      <nav>
        <a routerLink="/" class="brand">
          <div class="logo-icon">A</div>
          <div>
            <div class="logo">ATTENA<span class="plus">+</span></div>
            <div class="slogan">Movimento • Força • Estilo</div>
          </div>
        </a>

        <div class="nav-actions">
          <div *ngIf="authService.isLogged" class="user-info">
            <span class="user-name">👋 {{ firstName }}</span>
            <a routerLink="/minha-conta" class="account-btn">
              Minha conta
              <span *ngIf="wishlistService.count() > 0" class="wish-count">{{ wishlistService.count() }}</span>
            </a>
            <button class="logout-btn" (click)="logout()">Sair</button>
          </div>
          <button *ngIf="!authService.isLogged" class="login-btn-nav" (click)="showLogin = true">
            🔑 Entrar
          </button>
          <button *ngIf="showCartBtn" class="cart-btn" (click)="openCart.emit()">
            🛒 <span>Sacola</span>
            <span class="cart-count" *ngIf="cartService.getTotalItems() > 0">{{ cartService.getTotalItems() }}</span>
          </button>
        </div>
      </nav>
    </header>

    <app-login-modal
      *ngIf="showLogin"
      (loginSuccess)="onLoginSuccess()"
      (closeModal)="showLogin = false"
    />
  `,
  styles: [`
    header { position: sticky; top: 0; z-index: 100; }

    nav {
      background: #395531;
      padding: 0 1.5rem;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand { display: flex; align-items: center; gap: 10px; text-decoration: none; cursor: pointer; }

    .logo-icon {
      width: 36px; height: 36px;
      background: #CA5417;
      color: #FCFAE5;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700;
      font-family: Georgia, serif;
    }

    .logo {
      font-size: 20px; font-weight: 600;
      color: #FCFAE5;
      letter-spacing: 0.1em;
      font-family: Georgia, serif;
      line-height: 1.1;
    }
    .plus { color: #CA5417; }
    .slogan { font-size: 11px; color: rgba(252,250,229,0.5); letter-spacing: 0.07em; }

    .nav-actions { display: flex; align-items: center; gap: 0.75rem; }

    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .user-name {
      font-size: 13px; color: #FCFAE5; font-weight: 500;
      max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    }
    .account-btn {
      display: flex; align-items: center; gap: 5px;
      background: rgba(252,250,229,0.12); border: 1px solid rgba(252,250,229,0.25);
      color: #FCFAE5; border-radius: 6px; padding: 5px 14px;
      font-size: 13px; font-weight: 500; cursor: pointer;
      text-decoration: none; transition: background 0.15s;
    }
    .account-btn:hover { background: rgba(252,250,229,0.2); }
    .wish-count {
      background: #CA5417; color: #fff; border-radius: 20px;
      padding: 1px 6px; font-size: 10px; font-weight: 700;
    }
    .logout-btn {
      background: none; border: 1px solid rgba(252,250,229,0.3);
      color: rgba(252,250,229,0.7); border-radius: 6px;
      padding: 4px 12px; font-size: 12px; cursor: pointer; transition: all 0.15s;
    }
    .logout-btn:hover { border-color: #FCFAE5; color: #FCFAE5; }

    .login-btn-nav {
      background: rgba(252,250,229,0.12); border: 1px solid rgba(252,250,229,0.25);
      color: #FCFAE5; border-radius: 6px; padding: 5px 14px;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
    }
    .login-btn-nav:hover { background: rgba(252,250,229,0.2); }

    .cart-btn {
      display: flex; align-items: center; gap: 6px;
      background: rgba(252,250,229,0.12); border: 1px solid rgba(252,250,229,0.25);
      color: #FCFAE5; border-radius: 6px; padding: 5px 14px;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
      position: relative;
    }
    .cart-btn:hover { background: rgba(252,250,229,0.2); }
    .cart-count {
      background: #CA5417; color: #fff; border-radius: 50%;
      width: 18px; height: 18px; font-size: 10px; font-weight: 700;
      display: flex; align-items: center; justify-content: center;
    }
  `]
})
export class NavbarComponent {
  @Input() showCartBtn = false;
  @Output() openCart = new EventEmitter<void>();
  showLogin = false;

  constructor(public authService: AuthService, public cartService: CartService, public wishlistService: WishlistService) {}

  onLoginSuccess(): void { this.showLogin = false; }
  logout(): void { this.authService.logout().catch(console.error); }

  get firstName(): string {
    const name = this.authService.currentUser?.name ?? '';
    return name.split(' ')[0];
  }
}