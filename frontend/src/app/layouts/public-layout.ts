import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule, FormsModule],
  templateUrl: './public-layout.html',
  styleUrls: ['../app.scss'] // ✅ reutiliza los estilos de app
})
export class PublicLayoutComponent {
  contacto = { nombre: '', correo: '', mensaje: '' };

  enviarFormulario() {
    alert(`📩 Gracias ${this.contacto.nombre}, tu mensaje fue enviado correctamente.`);
    this.contacto = { nombre: '', correo: '', mensaje: '' };
  }

  irAProposito() {
    const element = document.getElementById('proposito');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }

  irAContacto() {
    const element = document.getElementById('footer');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  }
}
