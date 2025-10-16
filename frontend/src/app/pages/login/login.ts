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

  constructor(private authService: AuthService, private router: Router) {}

  isTransitioning = false;

  showRegister(): void {
    this.isTransitioning = true;
    setTimeout(() => {
      this.isContainerActive = true;
    }, 200);

    setTimeout(() => {
      this.isTransitioning = false;
    }, 1000);
  }

  showLogin(): void {
    this.isTransitioning = true;
    setTimeout(() => {
      this.isContainerActive = false;
    }, 200);

    setTimeout(() => {
      this.isTransitioning = false;
    }, 1000);
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
    if (!this.forgotIdentification) {
      alert('Por favor ingresa tu identificación');
      return;
    }
    alert(`Se han enviado las instrucciones a la identificación: ${this.forgotIdentification}`);
    this.closeForgotPasswordModal();
  }

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
          localStorage.setItem('usuario', JSON.stringify(res.user));

          alert('Bienvenida ' + (res.user.NOMBRE || res.user[1]));
          this.router.navigate(['/mis-plantas']);
        }
      },
      (err:any) => {
        console.error('Error en login', err);
        alert('Credenciales inválidas');
      }
    );
  }

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
        this.showLogin();
      },
      (err:any) => {
        console.error('Error al registrar', err);
        alert('Error al registrar');
      }
    );
  }

  loginWithGoogle(event: Event): void {
    event.preventDefault();
    console.log('Login with Google');
  }
  registerWithGoogle(event: Event): void {
    event.preventDefault();
    console.log('Register with Google');
  }
}
