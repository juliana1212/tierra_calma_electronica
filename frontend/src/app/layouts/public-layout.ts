import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './public-layout.html',
  styleUrls: ['./public-layout.scss']
})
export class PublicLayoutComponent {
  contacto = { nombre: '', correo: '', mensaje: '' };

  constructor(private router: Router) {}

  enviarFormulario() {
    alert(`Gracias ${this.contacto.nombre}, tu mensaje fue enviado correctamente.`);
    this.contacto = { nombre: '', correo: '', mensaje: '' };
  }

  irAHome() {
    this.router.navigate(['/']);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 200);
  }

  irAProposito() {
    const element = document.getElementById('proposito');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/']).then(() =>
        setTimeout(() => {
          const el = document.getElementById('proposito');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300)
      );
    }
  }

  irAContacto() {
    const element = document.getElementById('footer');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      this.router.navigate(['/']).then(() =>
        setTimeout(() => {
          const el = document.getElementById('footer');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 300)
      );
    }
  }
}
