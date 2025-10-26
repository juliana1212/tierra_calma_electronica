import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderPrivadoComponent } from '../header-privado/header-privado';
import { FormsModule } from '@angular/forms'; // ✅ Para usar [(ngModel)] en el chat

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, HeaderPrivadoComponent, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss']
})
export class ChatbotComponent {
  @ViewChild('carrusel') carrusel!: ElementRef<HTMLDivElement>;

  // ====== 🌕 Datos del carrusel de meses ======
  meses = [
    { nombre: 'Enero', clase: 'enero', fases: ['🌒 6 Ene — Creciente', '🌕 13 Ene — Llena', '🌗 21 Ene — Menguante', '🌑 29 Ene — Nueva'] },
    { nombre: 'Febrero', clase: 'febrero', fases: ['🌒 5 Feb — Creciente', '🌕 12 Feb — Llena', '🌗 20 Feb — Menguante', '🌑 27 Feb — Nueva'] },
    { nombre: 'Marzo', clase: 'marzo', fases: ['🌒 6 Mar — Creciente', '🌕 14 Mar — Llena', '🌗 22 Mar — Menguante', '🌑 29 Mar — Nueva'] },
    { nombre: 'Abril', clase: 'abril', fases: ['🌒 4 Abr — Creciente', '🌕 12 Abr — Llena', '🌗 20 Abr — Menguante', '🌑 27 Abr — Nueva'] },
    { nombre: 'Mayo', clase: 'mayo', fases: ['🌒 4 May — Creciente', '🌕 12 May — Llena', '🌗 20 May — Menguante', '🌑 26 May — Nueva'] },
    { nombre: 'Junio', clase: 'junio', fases: ['🌒 2 Jun — Creciente', '🌕 11 Jun — Llena', '🌗 18 Jun — Menguante', '🌑 25 Jun — Nueva'] },
    { nombre: 'Julio', clase: 'julio', fases: ['🌒 2 Jul — Creciente', '🌕 10 Jul — Llena', '🌗 17 Jul — Menguante', '🌑 24 Jul — Nueva', '🌒 31 Jul — Creciente'] },
    { nombre: 'Agosto', clase: 'agosto', fases: ['🌒 1 Ago — Creciente', '🌕 9 Ago — Llena', '🌗 16 Ago — Menguante', '🌑 23 Ago — Nueva', '🌒 31 Ago — Creciente'] },
    { nombre: 'Septiembre', clase: 'septiembre', fases: ['🌕 7 Sep — Llena', '🌗 14 Sep — Menguante', '🌑 21 Sep — Nueva', '🌒 29 Sep — Creciente'] },
    { nombre: 'Octubre', clase: 'octubre', fases: ['🌕 6 Oct — Llena', '🌗 13 Oct — Menguante', '🌑 21 Oct — Nueva', '🌒 29 Oct — Creciente'] },
    { nombre: 'Noviembre', clase: 'noviembre', fases: ['🌕 5 Nov — Llena', '🌗 12 Nov — Menguante', '🌑 20 Nov — Nueva', '🌒 28 Nov — Creciente'] },
    { nombre: 'Diciembre', clase: 'diciembre', fases: ['🌕 4 Dic — Llena', '🌗 11 Dic — Menguante', '🌑 19 Dic — Nueva', '🌒 27 Dic — Creciente'] }
  ];

  moverCarrusel(direccion: 'izquierda' | 'derecha') {
    const scroll = this.carrusel.nativeElement;
    const tarjetaAncho = 320; // ancho aproximado de una tarjeta + margen
    const desplazamiento = direccion === 'derecha' ? tarjetaAncho * 1.2 : -tarjetaAncho * 1.2;
    scroll.scrollBy({ left: desplazamiento, behavior: 'smooth' });
  }

  // ====== 💬 Lógica del chat flotante ======
  chatAbierto = false;
  mensaje = '';
  mensajes: { autor: string, texto: string }[] = [];

  abrirChat() {
    this.chatAbierto = true;
    // Agrega el mensaje de bienvenida solo la primera vez
    if (this.mensajes.length === 0) {
      this.mensajes.push({
        autor: 'bot',
        texto: '🌷 ¡Hola! Soy tu asistente de jardinería. ¿Sobre qué planta o cuidado quieres saber hoy?'
      });
    }
  }

  cerrarChat() {
    this.chatAbierto = false;
  }

  enviarMensaje() {
    const texto = this.mensaje.trim();
    if (!texto) return;

    this.mensajes.push({ autor: 'usuario', texto });
    this.mensaje = '';

    // Simula una respuesta suave del bot 🌿
    setTimeout(() => {
      this.mensajes.push({
        autor: 'bot',
        texto: '🍃 Qué interesante. Estoy buscando la mejor respuesta para ti...'
      });
    }, 900);
  }
}
