import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderPrivadoComponent } from '../pages/header-privado/header-privado';
import { PublicLayoutComponent } from './public-layout'; // para reutilizar el footer

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderPrivadoComponent],
  templateUrl: './private-layout.html',
  styleUrls: ['./private-layout.scss']
})
export class PrivateLayoutComponent {}
