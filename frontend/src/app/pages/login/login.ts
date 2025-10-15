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
      console.log('Respuesta login:', res);

      // 👇 Detecta si el backend devolvió un objeto o un arreglo
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
      (res:any) => {
        console.log('Usuario registrado', res);
        alert('Usuario registrado con éxito');
        this.showLogin(); // 👈 opcional: volver a pantalla login
      },
      (err:any) => {
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
