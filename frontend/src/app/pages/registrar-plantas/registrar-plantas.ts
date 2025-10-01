import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registrar-plantas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registrar-plantas.html',
  styleUrls: ['./registrar-plantas.scss']
})
export class RegistrarPlantasComponent {

  constructor(private router: Router) {}

  anadirPlanta(tipoPlanta: string): void {
    // Aquí puedes implementar la lógica para añadir la planta específica
    console.log(`Añadiendo planta: ${tipoPlanta}`);
    
    // Simular añadido exitoso
    alert(`¡${this.getNombrePlanta(tipoPlanta)} añadida a tu jardín!`);
    
    // Redirigir a mis plantas o mantener en la página
    // this.router.navigate(['/mis-plantas']);
  }

  private getNombrePlanta(tipo: string): string {
    const nombres: { [key: string]: string } = {
      'potus': 'Potus',
      'lengua-suegra': 'Lengua de Suegra',
      'ceriman': 'Cerimán',
      'dolar': 'Dólar',
      'hoja-violin': 'Hoja de Violín',
      'palma-areca': 'Palma Areca'
    };
    return nombres[tipo] || 'Planta';
  }
}
