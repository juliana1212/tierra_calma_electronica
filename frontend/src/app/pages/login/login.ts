import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  isContainerActive = false;
  isForgotPasswordModalOpen = false;
  forgotIdentification = '';
  loginCorreo = '';
  loginContrasena = '';

  regIdUsuario = '';
  regNombre = '';
  regApellido = '';
  regTelefono = '';
  regCorreo = '';
  regContrasena = '';

  isTransitioning = false;

  constructor(private authService: AuthService, private router: Router) {}

  // 🔹 Animación de cambio entre login y registro
  showRegister(): void {
    this.isTransitioning = true;
    setTimeout(() => (this.isContainerActive = true), 200);
    setTimeout(() => (this.isTransitioning = false), 1000);
  }

  showLogin(): void {
    this.isTransitioning = true;
    setTimeout(() => (this.isContainerActive = false), 200);
    setTimeout(() => (this.isTransitioning = false), 1000);
  }

  // 🔹 Modal de "Olvidé mi contraseña"
  openForgotPasswordModal(event: Event): void {
    event.preventDefault();
    this.isForgotPasswordModalOpen = true;
  }

  closeForgotPasswordModal(): void {
    this.isForgotPasswordModalOpen = false;
    this.forgotIdentification = '';
  }

  sendPasswordReset(): void {
    if (!this.forgotIdentification) {
      alert('Por favor ingresa tu identificación');
      return;
    }
    alert(`Se han enviado las instrucciones a la identificación: ${this.forgotIdentification}`);
    this.closeForgotPasswordModal();
  }

  // 🔹 LOGIN → consulta al backend Oracle
  onLoginSubmit(event: Event): void {
    event.preventDefault();

    const credentials = {
      correo_electronico: this.loginCorreo,
      contrasena: this.loginContrasena
    };

    this.authService.login(credentials).subscribe(
      (res: any) => {
        console.log('Respuesta login:', res);

        // ✅ Detecta si el backend devolvió un objeto o un arreglo
        const usuario = Array.isArray(res.user) ? res.user[0] : res.user;

        if (usuario) {
          localStorage.setItem('usuario', JSON.stringify(usuario));
          alert('Bienvenida ' + (usuario.NOMBRE || usuario.nombre));
          this.router.navigate(['/mis-plantas']);
        } else {
          alert('Credenciales inválidas');
        }
      },
      (err: any) => {
        console.error('Error en login:', err);
        alert('Credenciales inválidas');
      }
    );
  }

  // 🔹 REGISTRO → guarda usuario nuevo en Oracle
  onRegisterSubmit(event: Event): void {
    event.preventDefault();

    const newUser = {
      id_usuario: this.regIdUsuario,
      nombre: this.regNombre,
      apellido: this.regApellido,
      telefono: this.regTelefono,
      correo_electronico: this.regCorreo,
      contrasena: this.regContrasena
    };

    this.authService.register(newUser).subscribe(
      (res: any) => {
        console.log('Usuario registrado', res);
        alert('Usuario registrado con éxito');
        this.showLogin();
      },
      (err: any) => {
        console.error('Error al registrar', err);
        alert('Error al registrar');
      }
    );
  }

  // 🔹 Botones Google (placeholder)
  loginWithGoogle(event: Event): void {
    event.preventDefault();
    console.log('Login with Google');
  }

  registerWithGoogle(event: Event): void {
    event.preventDefault();
    console.log('Register with Google');
  }
}
