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
      <nav>
        <div class="brand">
          <div class="logo-icon">A</div>
          <div>
            <div class="logo">ATTENA<span class="plus">+</span></div>
            <div class="slogan">Movimento • Força • Estilo</div>
          </div>
        </div>

        <div *ngIf="authService.isLogged" class="user-info">
          <span class="user-name">👋 {{ firstName }}</span>
          <button class="logout-btn" (click)="logout()">Sair</button>
        </div>
      </nav>
    </header>

    <button
      *ngIf="!authService.isLogged"
      class="login-float"
      (click)="showLogin = true"
    >
      🔑 Entrar
    </button>

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

    .brand { display: flex; align-items: center; gap: 10px; }

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

    .user-info { display: flex; align-items: center; gap: 0.75rem; }
    .user-name {
      font-size: 13px;
      color: #FCFAE5;
      font-weight: 500;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .logout-btn {
      background: none;
      border: 1px solid rgba(252,250,229,0.3);
      color: rgba(252,250,229,0.7);
      border-radius: 6px;
      padding: 4px 12px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s;
    }
    .logout-btn:hover { border-color: #FCFAE5; color: #FCFAE5; }

    .login-float {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999;
      background: #395531;
      color: #FCFAE5;
      border: none;
      border-radius: 2rem;
      padding: 0.75rem 1.5rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(57,85,49,0.35);
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .login-float:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px rgba(57,85,49,0.45);
    }
  `]
})
export class NavbarComponent {
  showLogin = false;

  constructor(public authService: AuthService) {}

  onLoginSuccess(): void { this.showLogin = false; }
  logout(): void { this.authService.logout().catch(console.error); }

  get firstName(): string {
    const name = this.authService.currentUser?.name ?? '';
    return name.split(' ')[0];
  }
}