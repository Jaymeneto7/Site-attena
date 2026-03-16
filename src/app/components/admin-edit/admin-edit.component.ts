import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-admin-edit',
  // CORREÇÃO CRÍTICA 1: Tornar o componente Standalone
  standalone: true,
  // CORREÇÃO CRÍTICA 2: Importar CommonModule e FormsModule
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-edit.component.html',
  styleUrls: ['./admin-edit.component.css']
})
export class AdminEditComponent implements OnInit {

  // O produto original que está sendo editado (recebido do AdminPanel)
  @Input() product: Product | null = null;

  // Cópia local para edição, para não modificar o produto original diretamente
  // O template HTML fará o binding com 'working'
  working: Product | null = null; 

  // Emite o produto editado para o AdminPanelComponent salvar
  @Output() saveProduct = new EventEmitter<Product>();

  // Emite um sinal para o AdminPanelComponent fechar o formulário
  @Output() cancelEdit = new EventEmitter<void>();

  ngOnInit(): void {
    // Ao iniciar, cria uma cópia profunda do produto recebido
    if (this.product) {
      this.working = JSON.parse(JSON.stringify(this.product));
    }
  }

  save(): void {
    if (this.working) {
      // Emite o produto editado para o pai
      this.saveProduct.emit(this.working);
    }
  }

  cancel(): void {
    // Emite o evento de cancelamento
    this.cancelEdit.emit();
  }
}