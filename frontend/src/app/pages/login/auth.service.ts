import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

export type Planta = {
  ID_PLANTA: number;
  NOMBRE_COMUN: string;
  NOMBRE_CIENTIFICO: string;
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = environment.apiUrl; // ej: https://tu-backend/api

  constructor(private http: HttpClient) {}

  /* Registro de usuario */
  register(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  /* Inicio de sesión */
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  /* Recuperar contraseña */
  recuperarContrasena(correo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/recuperar-contrasena`, { correo });
  }

  /* Mis plantas del usuario */
  getMisPlantas(idUsuario: number): Observable<Planta[]> {
    return this.http
      .get<Planta[] | { rows: Planta[] }>(`${this.apiUrl}/mis-plantas`, {
        headers: { 'x-user-id': String(idUsuario) },
      })
      .pipe(map((r) => (Array.isArray(r) ? r : r.rows)));
  }
}
