import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  nuevaContrasena = '';
  token = '';

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  onSubmit() {
    if (!this.nuevaContrasena.trim()) {
      alert('Por favor ingresa tu nueva contraseña.');
      return;
    }

    this.http.post('http://localhost:3000/api/restablecer-contrasena', {
      token: this.token,
      nuevaContrasena: this.nuevaContrasena
    }).subscribe({
      next: () => {
        alert('Tu contraseña fue actualizada correctamente.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 401) alert('El enlace ha expirado.');
        else alert('Error al restablecer la contraseña.');
      }
    });
  }
}
