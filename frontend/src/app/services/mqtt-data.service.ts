import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'})
export class MqttDataService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  getUltimoDato(): Observable<any> {
    return this.http.get(`${this.apiUrl}/datos`);
  }

  getHistorial(): Observable<any> {
    return this.http.get(`${this.apiUrl}/historial`);
  }
}
