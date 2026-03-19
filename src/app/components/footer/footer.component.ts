import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer>
      <div class="cta">
        <h2>Gostou de alguma peça?</h2>
        <p>Fale com a gente pelo WhatsApp e finalize seu pedido agora. Atendimento rápido e personalizado.</p>
        <button class="wpp-btn" (click)="openWpp()">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Chamar no WhatsApp
        </button>
      </div>
      <div class="bottom">
        <span class="logo">ATTENA<span class="plus">+</span></span>
        <span class="copy">© 2024 Attena. Todos os direitos reservados.</span>
      </div>
    </footer>

    <!-- Botão flutuante WhatsApp -->
    <button class="wpp-float" (click)="openWpp()" title="Falar no WhatsApp">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    </button>
  `,
  styles: [`
    footer { background: #395531; }

    .cta {
      padding: 3rem 1.5rem;
      text-align: center;
      border-bottom: 0.5px solid rgba(252,250,229,0.12);
    }

    h2 {
      font-size: 22px;
      font-weight: 500;
      color: #FCFAE5;
      margin-bottom: 8px;
      font-family: Georgia, serif;
    }

    p {
      font-size: 14px;
      color: rgba(252,250,229,0.6);
      margin-bottom: 1.75rem;
      line-height: 1.6;
    }

    .wpp-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: #25D366;
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 14px 30px;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: opacity 0.15s, transform 0.1s;
    }
    .wpp-btn:hover { opacity: 0.9; transform: translateY(-1px); }
    .wpp-btn svg { width: 18px; height: 18px; }

    .bottom {
      padding: 1rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }

    .logo {
      font-size: 16px;
      font-weight: 600;
      color: #FCFAE5;
      letter-spacing: 0.1em;
      font-family: Georgia, serif;
    }
    .plus { color: #CA5417; }

    .copy {
      font-size: 11px;
      color: rgba(252,250,229,0.4);
    }

    .wpp-float {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: #25D366;
      color: #fff;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(37,211,102,0.35);
      transition: transform 0.15s, box-shadow 0.15s;
      z-index: 999;
    }
    .wpp-float:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 20px rgba(37,211,102,0.45);
    }
    .wpp-float svg { width: 26px; height: 26px; }
  `]
})
export class FooterComponent {
  constructor(private productService: ProductService) {}
  openWpp() { this.productService.openWhatsAppGeneral(); }
}