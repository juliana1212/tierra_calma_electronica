import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header-privado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-privado.html',
  styleUrls: ['./header-privado.scss'] // 🔹 nuevo archivo con estilos propios
})
export class HeaderPrivadoComponent {

  constructor(private router: Router) {}

  cerrarSesion() {
    localStorage.removeItem('usuario');
    alert('👋 Has cerrado sesión correctamente.');
    this.router.navigate(['/login']);
  }
}
