import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mis-plantas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-plantas.html',
  styleUrls: ['./mis-plantas.scss']
})
export class MisPlantasComponent {
  @ViewChild('carrusel') carruselRef!: ElementRef;
  imagenCargada = true;
  indiceActual = 0;

  constructor(private router: Router) {}

  // Navegación del carrusel
  siguiente(): void {
    const totalItems = 5; // Total de tarjetas en el carrusel
    if (this.indiceActual < totalItems - 3) {
      this.indiceActual++;
      this.actualizarCarrusel();
    }
  }

  anterior(): void {
    if (this.indiceActual > 0) {
      this.indiceActual--;
      this.actualizarCarrusel();
    }
  }

  private actualizarCarrusel(): void {
    const carrusel = this.carruselRef.nativeElement;
    const itemWidth = carrusel.querySelector('.carrusel-item').offsetWidth + 30;
    carrusel.style.transform = `translateX(-${this.indiceActual * itemWidth}px)`;
  }

  registrarNuevaPlanta(): void {
    this.router.navigate(['/registrar-planta']);
  }

    // Métodos de navegación para cada planta
  irACeriman(): void {
    this.router.navigate(['/planta/ceriman']);
  }

  irADolar(): void {
    this.router.navigate(['/planta/dolar']);
  }

  irALenguaSuegra(): void {
    this.router.navigate(['/planta/lengua-suegra']);
  }

  irAHojaViolin(): void {
    this.router.navigate(['/planta/hoja-violin']);
  }

  irAPotus(): void {
    this.router.navigate(['/planta/potus']);
  }

  irAPalmaAreca(): void {
    this.router.navigate(['/planta/palma-areca']);
  }
}