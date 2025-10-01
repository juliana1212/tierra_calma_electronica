import { Component } from '@angular/core';

@Component({
  selector: 'app-home',          // Etiqueta HTML personalizada
  imports: [],
  templateUrl: './home.html',  // Archivo HTML
  styleUrls: ['./home.scss']   // Archivo SCSS
})
export class HomeComponent {
  // Aquí va tu JavaScript - variables, funciones, etc.
  title = 'Bienvenida a Tierra en calma';
  
  // Ejemplo de función (como en JS)
  saludar() {
    alert('¡Hola desde TierraEnCalma!');
  }
}
