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

  // 🔹 Variables LOGIN
  loginCorreo = '';
  loginContrasena = '';

  // 🔹 Variables REGISTRO
  regIdUsuario = '';
  regNombre = '';
  regApellido = '';
  regTelefono = '';
  regCorreo = '';
  regContrasena = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Alternar entre login y registro
  showRegister(): void { this.isContainerActive = true; }
  showLogin(): void { this.isContainerActive = false; }

  // Modal recuperación
  openForgotPasswordModal(event: Event): void {
    event.preventDefault();
    this.isForgotPasswordModalOpen = true;
  }
  closeForgotPasswordModal(): void {
    this.isForgotPasswordModalOpen = false;
    this.forgotIdentification = '';
  }

  // Enviar recuperación
  sendPasswordReset(): void {
    if (!this.forgotIdentification) {
      alert('Por favor ingresa tu identificación');
      return;
    }
    alert(`Se han enviado las instrucciones a la identificación: ${this.forgotIdentification}`);
    this.closeForgotPasswordModal();
  }

  // 🔹 LOGIN → consulta Oracle
  onLoginSubmit(event: Event): void {
    event.preventDefault();

    const credentials = {
      correo_electronico: this.loginCorreo,
      contrasena: this.loginContrasena
    };

    this.authService.login(credentials).subscribe(
      (res: any) => {
        console.log('Login exitoso', res);
        if (res.user) {
          // 👇 Guardamos en localStorage el usuario logueado
          localStorage.setItem('usuario', JSON.stringify(res.user));

          alert('Bienvenida ' + (res.user.NOMBRE || res.user[1]));
          // Redirige a mis-plantas
          this.router.navigate(['/mis-plantas']);
        }
      },
      (err) => {
        console.error('Error en login', err);
        alert('Credenciales inválidas');
      }
    );
  }

  // 🔹 REGISTRO → guarda en Oracle
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
      (res) => {
        console.log('Usuario registrado', res);
        alert('Usuario registrado con éxito');
        this.showLogin(); // 👈 opcional: volver a pantalla login
      },
      (err) => {
        console.error('Error al registrar', err);
        alert('Error al registrar');
      }
    );
  }

  // Google (dummy)
  loginWithGoogle(event: Event): void {
    event.preventDefault();
    console.log('Login with Google');
  }
  registerWithGoogle(event: Event): void {
    event.preventDefault();
    console.log('Register with Google');
  }
}
