import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

type Tab = 'login' | 'cadastro';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.css']
})
export class LoginModalComponent {
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  tab: Tab = 'login';
  errorMessage = '';

  loginData = { email: '', password: '' };
  cadastroData = { name: '', email: '', password: '', confirm: '' };

  constructor(private authService: AuthService) {}

  setTab(t: Tab) {
    this.tab = t;
    this.errorMessage = '';
  }

  login(): void {
    const { email, password } = this.loginData;
    if (!email || !password) { this.errorMessage = 'Preencha todos os campos.'; return; }

    // tenta admin primeiro
    if (this.authService.loginAdmin(email, password)) {
      this.loginSuccess.emit(); return;
    }
    // tenta cliente
    if (this.authService.loginCliente(email, password)) {
      this.loginSuccess.emit(); return;
    }
    this.errorMessage = 'E-mail ou senha incorretos.';
  }

  cadastrar(): void {
    const { name, email, password, confirm } = this.cadastroData;
    if (!name || !email || !password) { this.errorMessage = 'Preencha todos os campos.'; return; }
    if (password !== confirm) { this.errorMessage = 'As senhas não coincidem.'; return; }
    if (password.length < 6) { this.errorMessage = 'Senha deve ter ao menos 6 caracteres.'; return; }

    const ok = this.authService.registerCliente(name, email, password);
    if (ok) { this.loginSuccess.emit(); }
    else { this.errorMessage = 'Este e-mail já está cadastrado.'; }
  }

  loginGoogle(): void {
    this.authService.loginGoogle();
    this.loginSuccess.emit();
  }

  onClose(): void { this.closeModal.emit(); }
  onModalClick(e: Event): void { e.stopPropagation(); }
}