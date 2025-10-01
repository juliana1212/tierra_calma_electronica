import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registrar-plantas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './registrar-plantas.html',
  styleUrls: ['./registrar-plantas.scss']
})
export class RegistrarPlantasComponent {

  constructor(private router: Router, private http: HttpClient) {}

  // Mapeo de IDs de plantas
  private plantaIds: { [key: string]: number } = {
    'potus': 25,
    'lengua-suegra': 26,
    'ceriman': 27,
    'dolar': 28,
    'hoja-violin': 29,
    'palma-areca': 30
  };

  anadirPlanta(tipoPlanta: string): void {
    const id_planta = this.plantaIds[tipoPlanta];

    // 👇 Obtenemos el usuario logueado desde localStorage
    const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
    const id_usuario = usuario.ID_USUARIO;

    if (!id_usuario) {
      alert("⚠️ Debes iniciar sesión antes de añadir plantas");
      this.router.navigate(['/login']);
      return;
    }

    this.http.post('http://localhost:3000/api/registrar-planta', {
      id_usuario,
      id_planta
    }).subscribe({
      next: (res: any) => {
        alert(res.message);
        // Redirigir a mis plantas si quieres
        this.router.navigate(['/mis-plantas']);
      },
      error: (err) => {
        console.error("Error al añadir planta:", err);
        alert("No se pudo añadir la planta 😢");
      }
    });
  }
}
