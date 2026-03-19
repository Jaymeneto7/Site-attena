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
        <h1>Descubra a força<br><em>e elegância</em><br>inspiradas na<br>Grécia antiga.</h1>
        <p>Roupas fitness que acompanham cada movimento. Do treino à rua, sem abrir mão da estética.</p>
        <button class="wpp-btn" (click)="openWpp()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Falar no WhatsApp
        </button>
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
      background: #8C1D12;
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
      background: #CA5417;
      color: #FCFAE5;
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
      color: #FCFAE5;
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
      color: rgba(252,250,229,0.65);
      line-height: 1.6;
      margin-bottom: 1.75rem;
    }

    .wpp-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #25D366;
      color: #fff;
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
      background: rgba(252,250,229,0.1);
      border: 0.5px solid rgba(252,250,229,0.18);
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
      color: #FCFAE5;
      font-family: Georgia, serif;
    }
    .stat-label {
      font-size: 11px;
      color: rgba(252,250,229,0.55);
      letter-spacing: 0.04em;
    }
  `]
})
export class HeroComponent {
  constructor(private productService: ProductService) {}
  openWpp() { this.productService.openWhatsAppGeneral(); }
}