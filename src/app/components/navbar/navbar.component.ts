import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, LoginModalComponent],
  template: `
    <header>
      <div class="strip">
        <span>Frete grátis acima de R$299</span>
        <span class="dot">•</span>
        <span>Peça pelo WhatsApp e receba em casa</span>
        <span class="dot">•</span>
        <span>Troca gratuita em 30 dias</span>
      </div>
      <nav>
        <div class="brand">
          <div class="logo-icon">A</div>
          <div>
            <div class="logo">ATTENA<span class="plus">+</span></div>
            <div class="slogan">Movimento • Força • Estilo</div>
          </div>
        </div>

        <!-- Usuário logado na navbar -->
        <div *ngIf="authService.isLogged" class="user-info">
          <span class="user-name">👋 {{ authService.currentUser?.name }}</span>
          <button class="logout-btn" (click)="logout()">Sair</button>
        </div>
      </nav>
    </header>

    <!-- Botão fixo "Entrar" — canto inferior DIREITO -->
    <button
      *ngIf="!authService.isLogged"
      class="login-float"
      (click)="showLogin = true"
    >
      🔑 Entrar
    </button>

    <!-- Modal de login -->
    <app-login-modal
      *ngIf="showLogin"
      (loginSuccess)="onLoginSuccess()"
      (closeModal)="showLogin = false"
    />
  `,
  styles: [`
    header { position: sticky; top: 0; z-index: 100; }

    .strip {
      background: var(--color-nav);
      padding: 8px 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 11px;
      color: var(--color-on-primary-85);
      letter-spacing: 0.03em;
    }
    .dot { opacity: 0.4; }

    nav {
      background: var(--color-primary);
      padding: 0 1.5rem;
      height: 58px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand { display: flex; align-items: center; gap: 10px; }

    .logo-icon {
      width: 36px; height: 36px;
      background: var(--color-accent);
      color: var(--color-on-primary);
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px; font-weight: 700;
      font-family: Georgia, serif;
    }

    .logo {
      font-size: 20px; font-weight: 600;
      color: var(--color-on-primary);
      letter-spacing: 0.1em;
      font-family: Georgia, serif;
      line-height: 1.1;
    }
    .plus { color: var(--color-accent); }
    .slogan { font-size: 11px; color: var(--color-on-primary-50); letter-spacing: 0.07em; }

    /* Usuário logado */
    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .user-name { font-size: 13px; color: var(--color-on-primary); font-weight: 500; }
    .logout-btn {
      background: none;
      border: 1px solid var(--color-on-primary-30);
      color: var(--color-on-primary-65);
      border-radius: 6px;
      padding: 4px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .logout-btn:hover { border-color: var(--color-on-primary); color: var(--color-on-primary); }

    /* Botão flutuante Entrar — canto inferior DIREITO */
    .login-float {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999;
      background: var(--color-primary);
      color: var(--color-on-primary);
      border: none;
      border-radius: 2rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: var(--shadow-primary);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .login-float:hover {
      transform: scale(1.05);
      box-shadow: var(--shadow-primary-lg);
    }
  `]
})
export class NavbarComponent {
  showLogin = false;

  constructor(public authService: AuthService) {}

  onLoginSuccess(): void {
    this.showLogin = false;
  }

  logout(): void {
    this.authService.logout();
  }
}