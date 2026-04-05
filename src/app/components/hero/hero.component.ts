import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
template: `
    <section class="hero">
      <div class="hero-content">
        <span class="tag">Coleção 2024</span>
        <h1>Força é sentir bem<br><em>na própria pele</em></h1>
        <p>Roupas fitness que acompanham cada movimento. Do treino à rua, sem abrir mão da estética.</p>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <span class="stat-val">80+</span>
          <span class="stat-label">Modelos</span>
        </div>
        <div class="stat">
          <span class="stat-val">4.9★</span>
          <span class="stat-label">Avaliação</span>
        </div>
        <div class="stat">
          <span class="stat-val">12k</span>
          <span class="stat-label">Entregas</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .hero {
      background: var(--color-hero-bg);
      padding: 3rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
      flex-wrap: wrap;
    }

    .hero-content { max-width: 400px; }

    .tag {
      display: inline-block;
      background: var(--color-accent-warm);
      color: var(--color-on-primary);
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 20px;
      margin-bottom: 1.25rem;
    }

    h1 {
      font-size: 36px;
      font-weight: 500;
      color: var(--color-on-primary);
      line-height: 1.15;
      margin-bottom: 1rem;
      font-family: Georgia, serif;
    }
    h1 em {
      font-style: italic;
      opacity: 0.65;
    }

    p {
      font-size: 14px;
      color: var(--color-on-primary-65);
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }

    .wpp-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: var(--whatsapp-brand);
      color: var(--color-surface);
      border: none;
      border-radius: 10px;
      padding: 12px 24px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .wpp-btn:hover { opacity: 0.92; transform: translateY(-1px); }
    .wpp-btn svg { width: 16px; height: 16px; }

    .hero-stats {
      display: flex;
      gap: 12px;
    }

    .stat {
      background: var(--color-on-primary-10);
      border: 0.5px solid var(--color-on-primary-18);
      border-radius: 12px;
      padding: 1.25rem 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .stat-val {
      font-size: 22px;
      font-weight: 500;
      color: var(--color-on-primary);
      font-family: Georgia, serif;
    }
    .stat-label {
      font-size: 11px;
      color: var(--color-on-primary-55);
      letter-spacing: 0.04em;
    }
  `]
})
export class HeroComponent {
  constructor(private productService: ProductService) {}
  openWpp() { this.productService.openWhatsAppGeneral(); }
}