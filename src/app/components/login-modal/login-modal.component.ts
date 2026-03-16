import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms'; // 1. Importar para [(ngModel)]
import { CommonModule } from '@angular/common'; // 2. Importar para *ngIf (se usado)

@Component({
  selector: 'app-login-modal',
  // CORREÇÃO CRÍTICA 1: Componente deve ser Standalone
  standalone: true, 
  // CORREÇÃO CRÍTICA 2: Importar FormsModule e CommonModule
  imports: [FormsModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {

  @Output() loginSuccess = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  loginData = { email: '', password: '' };
  errorMessage = '';

  constructor(private authService: AuthService) {}

  login(): void {
    const email = this.loginData.email.trim();
    const password = this.loginData.password.trim();

    if (email === 'admin@attena.com' && password === 'attena2024') {
      this.authService.login('auth-token-OK');
      this.loginSuccess.emit();
      this.errorMessage = '';
    } else {
      // O erro 'errorMessage' provavelmente é exibido com *ngIf no template, por isso CommonModule é crucial.
      this.errorMessage = 'Credenciais inválidas! Use admin@attena.com / attena2024';
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onModalClick(event: Event): void {
    event.stopPropagation();
  }
}