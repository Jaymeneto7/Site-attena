import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // 1. Importar RouterModule para o botão 'Admin'
import { CommonModule } from '@angular/common'; // 2. Importar CommonModule para *ngIf, *ngFor
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-catalog',
  // CORREÇÃO CRÍTICA 1: Componente deve ser Standalone
  standalone: true, 
  // CORREÇÃO CRÍTICA 2: Importar todas as dependências usadas no template (HTML)
  imports: [CommonModule, RouterModule],
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css']
})
export class CatalogComponent implements OnInit {

  products: Product[] = []; 

  // O Router é injetado no construtor e não precisa ser importado aqui novamente
  constructor(
    private productService: ProductService,
    private router: Router 
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    // Assumindo que este método carrega os produtos para a grade
    this.products = this.productService.getProducts(); 
  }

  /**
   * Navega para o painel administrativo.
   */
  openAdmin(): void {
    this.router.navigate(['/admin']); 
  }

  /**
   * Redireciona o usuário para o WhatsApp em uma nova aba.
   */
  redirectToWhatsApp(): void {
    // *** AJUSTAR AQUI: Substitua pelo seu número de telefone com código do país/área ***
    const phoneNumber = 'SEU_NUMERO_DE_TELEFONE'; 
    const message = encodeURIComponent('Olá, gostaria de saber mais sobre a Coleção ATTENA 2024!');
    
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  }
}