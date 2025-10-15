import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderPrivadoComponent } from '../header-privado/header-privado';

@Component({
  selector: 'app-mis-plantas',
  standalone: true,
  imports: [CommonModule, HeaderPrivadoComponent],
  templateUrl: './mis-plantas.html',
  styleUrls: ['./mis-plantas.scss']
})
export class MisPlantasComponent {
  imagenCargada = true;

  irACeriman() {
    window.location.href = '/monstera'; // cambia por router.navigate si lo prefieres
  }

  irADolar() { /* ... */ }
  irALenguaSuegra() { /* ... */ }
  irAHojaViolin() { /* ... */ }
  irAPotus() { /* ... */ }
  irAPalmaAreca() { /* ... */ }
  anterior() { /* ... */ }
  siguiente() { /* ... */ }
  registrarNuevaPlanta() { /* ... */ }
}
