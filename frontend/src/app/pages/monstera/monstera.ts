import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface RiegoHistorial {
  tipo: 'manual' | 'automático';
  mensaje: string;
  hora: string;
}

@Component({
  selector: 'app-monstera',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './monstera.html',
  styleUrls: ['./monstera.scss']
})
export class MonsteraComponent implements OnInit, OnDestroy {
  // === Config ===
  ESP_IP = '172.20.10.4';

  // === Estado UI ===
  isConnected = false;
  realtimeData = 'Cargando...';
  lastUpdate = 'Última actualización: --:--:--';

  // === Historial de riego ===
  historialRiego: RiegoHistorial[] = [];

  // === Registrar cuidados ===
  nuevoCuidado = {
    fecha: '',
    tipo: '',
    detalles: ''
  };

  // === Chart ===
  @ViewChild('soilChart', { static: false }) soilChartRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private chartData: number[] = [];
  private maxDataPoints = 20;

  // === Polling ===
  private pollHandle?: any;

  // ====== LIFECYCLE ======
  ngOnInit(): void {
    // iniciar polling (2s)
    this.pollHandle = setInterval(() => this.checkConnection(), 2000);
    this.checkConnection();
  }

  ngOnDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
    if (this.chart) this.chart.destroy();
  }

  // ====== RIEGO MANUAL ======
  activarRiego(): void {
    fetch(`http://${this.ESP_IP}/regar`)
      .then(resp => {
        if (!resp.ok) throw new Error('Error en la respuesta del servidor');
        return resp.text();
      })
      .then(msg => {
        alert(msg || '💧 Riego activado');
        this.agregarHistorial('manual', msg || 'Riego manual activado');
      })
      .catch(err => {
        console.error(err);
        alert('Error al activar el riego. Intenta nuevamente.');
      });
  }

  // ====== RIEGO AUTOMÁTICO (ejemplo simulado) ======
  private activarRiegoAutomatico(): void {
    this.agregarHistorial('automático', 'Riego automático ejecutado');
  }

  private agregarHistorial(tipo: 'manual' | 'automático', mensaje: string): void {
    const registro: RiegoHistorial = {
      tipo,
      mensaje,
      hora: new Date().toLocaleTimeString()
    };
    this.historialRiego.unshift(registro); // lo agrega arriba
    if (this.historialRiego.length > 10) {
      this.historialRiego.pop(); // máximo 10 registros
    }
  }

  // ====== CONEXIÓN/DATOS ======
  private checkConnection(): void {
    fetch(`http://${this.ESP_IP}/datos`)
      .then(resp => {
        if (!resp.ok) throw new Error('Error de conexión');
        this.isConnected = true;
        return resp.text();
      })
      .then(data => {
        this.updateDataDisplay(data);
      })
      .catch(err => {
        console.error('Conexión fallida:', err);
        this.isConnected = false;
        this.realtimeData = 'Error de conexión';
      });
  }

  private updateDataDisplay(data: string): void {
    this.realtimeData = data;
    this.lastUpdate = `Última actualización: ${new Date().toLocaleTimeString()}`;

    // Extraer humedad: busca "Humedad: 63%"
    const match = data.match(/Humedad:\s*(\d+)\s*%/i);
    if (match) {
      const humidity = parseInt(match[1], 10);
      this.pushPoint(humidity);

      // Ejemplo: si la humedad es baja, activar riego automático
      if (humidity < 30) {
        this.activarRiegoAutomatico();
      }
    }
  }

  // ====== CHART ======
  private ensureChart(): void {
    if (this.chart || !this.soilChartRef) return;

    const ctx = this.soilChartRef.nativeElement.getContext('2d');
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(this.maxDataPoints).fill(''),
        datasets: [
          {
            label: 'Humedad (%)',
            data: [],
            borderColor: '#5A7A5A',
            backgroundColor: 'rgba(184, 200, 184, 0.2)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 100, grid: { color: 'rgba(0,0,0,0.05)' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { labels: { font: { family: 'Montserrat, sans-serif' } } } }
      }
    });
  }

  private pushPoint(value: number): void {
    this.chartData.push(value);
    if (this.chartData.length > this.maxDataPoints) this.chartData.shift();

    this.ensureChart();
    if (this.chart) {
      this.chart.data.datasets[0].data = [...this.chartData];
      this.chart.update('none');
    }
  }

  // ====== CUIDADOS ======
  guardarCuidado(): void {
    if (!this.nuevoCuidado.fecha || !this.nuevoCuidado.tipo) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    console.log('Cuidado registrado:', this.nuevoCuidado);

    alert(`🌿 Cuidado guardado:\n${this.nuevoCuidado.tipo} el ${this.nuevoCuidado.fecha}`);

    // Resetear formulario
    this.nuevoCuidado = { fecha: '', tipo: '', detalles: '' };
  }
}
