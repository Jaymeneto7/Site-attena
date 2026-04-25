import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
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
export class LoginModalComponent implements OnInit {
  @Input() initialTab: Tab = 'login';
  @Output() loginSuccess = new EventEmitter<void>();
  @Output() closeModal = new EventEmitter<void>();

  tab: Tab = 'login';

  ngOnInit(): void { this.tab = this.initialTab; }
  errorMessage = '';
  loading = false;

  loginData = { email: '', password: '' };
  cadastroData = { name: '', email: '', password: '', confirm: '' };

  constructor(private authService: AuthService) {}

  setTab(t: Tab) {
    this.tab = t;
    this.errorMessage = '';
  }

  async login(): Promise<void> {
    const { email, password } = this.loginData;
    if (!email || !password) { this.errorMessage = 'Preencha todos os campos.'; return; }

    this.loading = true;
    this.errorMessage = '';
    const result = await this.authService.login(email, password);
    this.loading = false;

    if (result.ok) { this.loginSuccess.emit(); }
    else { this.errorMessage = result.error ?? 'E-mail ou senha incorretos.'; }
  }

  async cadastrar(): Promise<void> {
    const { name, email, password, confirm } = this.cadastroData;
    if (!name || !email || !password) { this.errorMessage = 'Preencha todos os campos.'; return; }
    if (password !== confirm) { this.errorMessage = 'As senhas não coincidem.'; return; }
    if (password.length < 6) { this.errorMessage = 'Senha deve ter ao menos 6 caracteres.'; return; }

    this.loading = true;
    this.errorMessage = '';
    const result = await this.authService.registerCliente(name, email, password);
    this.loading = false;

    if (result.ok) { this.loginSuccess.emit(); }
    else { this.errorMessage = result.error ?? 'Erro ao criar conta.'; }
  }

  async loginGoogle(): Promise<void> {
    await this.authService.loginWithGoogle();
  }

  onClose(): void { this.closeModal.emit(); }
  onModalClick(e: Event): void { e.stopPropagation(); }
}
