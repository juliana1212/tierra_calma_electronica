import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod'; 

@Injectable({ providedIn: 'root' })
export class MqttDataService {
  private readonly apiUrl = environment.apiUrl; 

  constructor(private http: HttpClient) {}

  getUltimoDato(): Observable<any> {
    return this.http.get(`${this.apiUrl}/datos`);
  }

  getHistorial(): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial`);
  }

  activarRiego(): Observable<any> {
    return this.http.post(`${this.apiUrl}/regar`, {});
  }
}
