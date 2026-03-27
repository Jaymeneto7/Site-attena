import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
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
      </nav>
    </header>
  `,
  styles: [`
    header { position: sticky; top: 0; z-index: 100; }

    .strip {
      background: #07567B;
      padding: 8px 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      font-size: 11px;
      color: rgba(252,250,229,0.85);
      letter-spacing: 0.03em;
    }
    .dot { opacity: 0.4; }

    nav {
      background: #395531;
      padding: 0 1.5rem;
      height: 58px;
      display: flex;
      align-items: center;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: #CA5417;
      color: #FCFAE5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      font-family: Georgia, serif;
    }

    .logo {
      font-size: 20px;
      font-weight: 600;
      color: #FCFAE5;
      letter-spacing: 0.1em;
      font-family: Georgia, serif;
      line-height: 1.1;
    }
    .plus { color: #CA5417; }

    .slogan {
      font-size: 11px;
      color: rgba(252,250,229,0.5);
      letter-spacing: 0.07em;
    }
  `]
})
export class NavbarComponent {}