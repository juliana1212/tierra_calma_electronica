import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monstera',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monstera.html',
  styleUrls: ['./monstera.scss']
})
export class MonsteraComponent {

  activarRiego(): void {
    // Lógica para activar el riego
    console.log('Activando riego para Monstera...');
    
    // Simular activación del riego
    alert('💧 Riego activado para tu Monstera deliciosa');
    
    // Aquí puedes agregar la lógica real de riego
    // Por ejemplo, llamar a un servicio API
  }
}