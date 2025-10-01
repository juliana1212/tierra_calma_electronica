import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {
  protected readonly title = 'Tierra en calma';

  constructor(private router: Router) {}

  contacto = {
    nombre: '',
    correo: '',
    mensaje: ''
  };

  enviarFormulario() {
    alert(`📩 Gracias ${this.contacto.nombre}, tu mensaje fue enviado correctamente.`);
    this.contacto = { nombre: '', correo: '', mensaje: '' };
  }

  irAProposito() {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        const element = document.getElementById('proposito');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    });
  }

  irAContacto() {
    this.router.navigate(['/home']).then(() => {
      setTimeout(() => {
        const element = document.getElementById('footer');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 200);
    });
  }
}