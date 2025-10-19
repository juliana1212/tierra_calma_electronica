import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent {
  constructor(private router: Router) {}

  // Login normal
  irALogin() {
    // Sube antes de navegar para una transición visual limpia
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => this.router.navigate(['/login']), 250);
  }

  // Registro directo
  irARegistro() {
    // Sube antes de navegar
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => this.router.navigate(['/login/registro']), 250);
  }
}
