import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-plantas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-plantas.html',
  styleUrls: ['./mis-plantas.scss']
})
export class MisPlantasComponent {
  imagenCargada = true;

  constructor(private router: Router) {}

  // ✅ Navegación a cada planta
  irACeriman() {
    console.log('➡️ Navegando a Monstera...');
    this.router.navigate(['/monstera']); // 👈 ruta del componente Monstera
  }

  irADolar() { console.log('Ir a Dólar'); }
  irALenguaSuegra() { console.log('Ir a Lengua de Suegra'); }
  irAHojaViolin() { console.log('Ir a Hoja de Violín'); }
  irAPotus() { console.log('Ir a Potus'); }
  irAPalmaAreca() { console.log('Ir a Palma Areca'); }

  anterior() { console.log('Anterior planta'); }
  siguiente() { console.log('Siguiente planta'); }

  registrarNuevaPlanta() {
    console.log('➡️ Navegando a registrar-plantas...');
    this.router.navigate(['/registrar-plantas']);
  }
}
