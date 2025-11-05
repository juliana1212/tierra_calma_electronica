import { Component } from '@angular/core';
import { HeaderPrivadoComponent } from '../pages/header-privado/header-privado';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [HeaderPrivadoComponent, CommonModule, FormsModule],
  templateUrl: './private-layout.html',
  styleUrls: ['../app.scss']
})
export class PrivateLayoutComponent {
  onSubmit() {
    alert('📩 Tu mensaje fue enviado correctamente.');
  }
}

