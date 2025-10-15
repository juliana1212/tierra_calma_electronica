import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-plantas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-plantas.html',
  styleUrls: ['./mis-plantas.scss']
})
export class MisPlantasComponent {

  // ✅ Estado visual de imagen
  imagenCargada = true;

  // ✅ Navegación (puedes reemplazar window.location.href por Router.navigate)
  irACeriman() { console.log('Ir a Ceriman'); }
  irADolar() { console.log('Ir a Dólar'); }
  irALenguaSuegra() { console.log('Ir a Lengua de Suegra'); }
  irAHojaViolin() { console.log('Ir a Hoja de Violín'); }
  irAPotus() { console.log('Ir a Potus'); }
  irAPalmaAreca() { console.log('Ir a Palma Areca'); }

  // ✅ Carrusel
  anterior() { console.log('Anterior planta'); }
  siguiente() { console.log('Siguiente planta'); }

  // ✅ Registrar planta
  registrarNuevaPlanta() {
    console.log('Registrar nueva planta');
    alert('Función en desarrollo 🌿');
  }
}
