import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-plantas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mis-plantas.html',
  styleUrls: ['./mis-plantas.scss']
})
export class MisPlantasComponent implements OnInit {
  @ViewChild('carrusel') carruselRef!: ElementRef;
  imagenCargada = true;
  nombreUsuario = '';
  indiceActual = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    this.nombreUsuario = usuario.NOMBRE || 'Usuario'; 
  }

  siguiente(): void {
    const carrusel = this.carruselRef?.nativeElement;
    if (!carrusel) return;

    const items = carrusel.querySelectorAll('.carrusel-item');
    const totalItems = items.length;
    const itemWidth = items[0].offsetWidth + 30; 

    if (this.indiceActual < totalItems - 3) {
      this.indiceActual++;
      carrusel.style.transform = `translateX(-${this.indiceActual * itemWidth}px)`;
    }
  }

  anterior(): void {
    const carrusel = this.carruselRef?.nativeElement;
    if (!carrusel) return;

    const items = carrusel.querySelectorAll('.carrusel-item');
    const itemWidth = items[0].offsetWidth + 30;

    if (this.indiceActual > 0) {
      this.indiceActual--;
      carrusel.style.transform = `translateX(-${this.indiceActual * itemWidth}px)`;
    }
  }
  irACeriman() {
    console.log('Navegando a Monstera...');
    this.router.navigate(['/monstera']);
  }

  irADolar() { console.log('Ir a Dólar'); }
  irALenguaSuegra() { console.log('Ir a Lengua de Suegra'); }
  irAHojaViolin() { console.log('Ir a Hoja de Violín'); }
  irAPotus() { console.log('Ir a Potus'); }
  irAPalmaAreca() { console.log('Ir a Palma Areca'); }



  registrarNuevaPlanta() {
    console.log(' Navegando a registrar-plantas...');
    this.router.navigate(['/registrar-plantas']);
  }
}
