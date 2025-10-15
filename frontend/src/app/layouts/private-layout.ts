import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderPrivadoComponent } from '../pages/header-privado/header-privado';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ✅ Necesario para ngForm

@Component({
  selector: 'app-private-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderPrivadoComponent, CommonModule, FormsModule],
  templateUrl: './private-layout.html',
styleUrls: ['../app.scss']

})
export class PrivateLayoutComponent {
  onSubmit() {
    alert('📩 Tu mensaje fue enviado correctamente.');
  }
}
