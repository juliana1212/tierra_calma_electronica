import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent {
  isContainerActive = false;
  isTransitioning = false;
  isForgotPasswordModalOpen = false;

  loginCorreo = '';
  loginContrasena = '';

  regIdUsuario = '';
  regNombre = '';
  regApellido = '';
  regTelefono = '';
  regCorreo = '';
  regContrasena = '';

  forgotIdentification = '';

  constructor(private authService: AuthService, private router: Router) {}

  showRegister(): void {
    this.isTransitioning = true;
    setTimeout(() => (this.isContainerActive = true), 200);
    setTimeout(() => (this.isTransitioning = false), 800);
  }

  showLogin(): void {
    this.isTransitioning = true;
    setTimeout(() => (this.isContainerActive = false), 200);
    setTimeout(() => (this.isTransitioning = false), 800);
  }

  openForgotPasswordModal(event: Event): void {
    event.preventDefault();
    this.isForgotPasswordModalOpen = true;
  }

  closeForgotPasswordModal(): void {
    this.isForgotPasswordModalOpen = false;
    this.forgotIdentification = '';
  }

  sendPasswordReset(): void {
    if (!this.forgotIdentification.trim()) {
      alert('Por favor ingresa tu identificación.');
      return;
    }
    alert(`Se han enviado las instrucciones a la identificación: ${this.forgotIdentification}`);
    this.closeForgotPasswordModal();
  }

  onLoginSubmit(event: Event): void {
    event.preventDefault();

    const credentials = {
      correo_electronico: this.loginCorreo.trim(),
      contrasena: this.loginContrasena.trim()
    };

    if (!credentials.correo_electronico || !credentials.contrasena) {
      alert(' Ingresa tu correo y contraseña.');
      return;
    }

    this.authService.login(credentials).subscribe({
      next: (res: any) => {
        console.log('Respuesta login:', res);

        const usuario = Array.isArray(res.user) ? res.user[0] : res.user;

        if (usuario && (usuario.NOMBRE || usuario.nombre)) {
          localStorage.setItem('usuario', JSON.stringify(usuario));
          alert(`Bienvenida ${usuario.NOMBRE || usuario.nombre}`);
          this.router.navigate(['/mis-plantas']);
        } else {
          alert('Credenciales inválidas. Verifica tu correo o contraseña.');
        }
      },
      error: (err) => {
        console.error('Error en login:', err);
        if (err.status === 0) {
          alert('No se pudo conectar con el servidor. Verifica el backend.');
        } else if (err.error?.message) {
          alert(` ${err.error.message}`);
        } else {
          alert(' Credenciales inválidas.');
        }
      }
    });
  }

  onRegisterSubmit(event: Event): void {
    event.preventDefault();

    const newUser = {
      id_usuario: this.regIdUsuario.trim(),
      nombre: this.regNombre.trim(),
      apellido: this.regApellido.trim(),
      telefono: this.regTelefono.trim(),
      correo_electronico: this.regCorreo.trim(),
      contrasena: this.regContrasena.trim()
    };

    if (!newUser.id_usuario || !newUser.nombre || !newUser.correo_electronico || !newUser.contrasena) {
      alert(' Todos los campos son obligatorios.');
      return;
    }

    this.authService.register(newUser).subscribe({
      next: (res: any) => {
        console.log('Usuario registrado:', res);
        alert(' Usuario registrado con éxito.');
        this.showLogin();
      },
      error: (err) => {
        console.error(' Error al registrar:', err);
        alert(' No se pudo registrar el usuario. Revisa los datos o intenta más tarde.');
      }
    });
  }

}
