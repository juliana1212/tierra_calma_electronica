import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.prod';

@Component({
  selector: 'app-header-privado',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, FormsModule],
  templateUrl: './header-privado.html',
  styleUrls: ['./header-privado.scss'],
})
export class HeaderPrivadoComponent {
  contacto = { nombre: '', correo: '', mensaje: '' };

  private router = inject(Router);
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl; // ej: https://tu-backend/api

  irAHome() {
    this.router.navigate(['/']);
  }

  cerrarSesion() {
    localStorage.removeItem('usuario');
    alert('Has cerrado sesión correctamente.');
    this.router.navigate(['/login']);
  }

  enviarFormulario() {
    if (!this.contacto.nombre || !this.contacto.correo || !this.contacto.mensaje) {
      alert('Por favor completa todos los campos.');
      return;
    }

    this.http.post(`${this.apiUrl}/contacto`, this.contacto).subscribe({
      next: () => {
        alert(`Gracias ${this.contacto.nombre}, tu mensaje fue enviado correctamente.`);
        this.contacto = { nombre: '', correo: '', mensaje: '' };
      },
      error: (err) => {
        console.error('Error al enviar el mensaje:', err);
        alert('Hubo un problema al enviar tu mensaje. Intenta más tarde.');
      },
    });
  }
}
