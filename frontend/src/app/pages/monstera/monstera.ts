import { Component, ElementRef, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';
import { MqttDataService } from '../../services/mqtt-data.service';  
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
export class MonsteraComponent implements OnInit, OnDestroy, AfterViewInit {
  // === Estado UI ===
  isConnected = false;
  realtimeData = 'Cargando...';
  lastUpdate = 'Última actualización: --:--:--';

  // === Historial de riego ===
  historialRiego: RiegoHistorial[] = [];
  historial: string[] = [];   // datos crudos desde backend

  // === Registrar cuidados ===
  nuevoCuidado = { fecha: '', tipo: '', detalles: '' };

  // === Datos procesados del sensor ===
  sensorData = {
    temperatura: '---',
    humedadSuelo: '---'
  };

  // === Chart ===
  @ViewChild('soilChart', { static: false }) soilChartRef!: ElementRef<HTMLCanvasElement>;
  private chart?: Chart;
  private maxDataPoints = 20;

  private humidityData: number[] = [];
  private tempData: number[] = [];

  // === Polling ===
  private pollHandle?: any;

  constructor(private mqttService: MqttDataService) {}

  // ====== LIFECYCLE ======
  ngOnInit(): void {
    // polling al BACKEND (cada 2s)
    this.pollHandle = setInterval(() => this.cargarDatos(), 2000);
    this.cargarDatos();
  }

  ngAfterViewInit(): void {
    this.ensureChart();
  }

  ngOnDestroy(): void {
    if (this.pollHandle) clearInterval(this.pollHandle);
    if (this.chart) this.chart.destroy();
  }

  // ====== RIEGO MANUAL ======
  activarRiego(): void {
    this.mqttService.activarRiego().subscribe({
      next: () => {
        this.agregarHistorial('manual', 'Riego manual activado');
        alert(' Riego activado correctamente');
      },
      error: (err) => {
        console.error('Error al activar el riego:', err);
        alert(' Error al activar el riego');
      }
    });
  }

  // ====== RIEGO AUTOMÁTICO ======
  private activarRiegoAutomatico(): void {
    this.agregarHistorial('automático', 'Riego automático ejecutado');
  }

  private agregarHistorial(tipo: 'manual' | 'automático', mensaje: string): void {
    const registro: RiegoHistorial = {
      tipo,
      mensaje,
      hora: new Date().toLocaleTimeString()
    };
    this.historialRiego.unshift(registro);
    if (this.historialRiego.length > 10) {
      this.historialRiego.pop();
    }
  }

  // ====== DATOS DESDE BACKEND ======
  private cargarDatos(): void {
    this.mqttService.getUltimoDato().subscribe(res => {
      if (res && res.dato) {
        this.realtimeData = res.dato;
        // interpretar los datos del string recibido
          const matchTemp = res.dato.match(/T[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);
          const matchHumedadSuelo = res.dato.match(/Suelo[:=]\s*([0-9]+(?:\.[0-9]+)?%?)/i);

          this.sensorData = {
            temperatura: matchTemp ? matchTemp[1] + ' °C' : '---',
            humedadSuelo: matchHumedadSuelo ? matchHumedadSuelo[1] : '---'
          };

        this.lastUpdate = `Última actualización: ${new Date().toLocaleTimeString()}`;
        this.isConnected = true;

        // Extraer temperatura y humedad de la cadena recibida
        const tempMatch = res.dato.match(/T[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);
        const sueloMatch = res.dato.match(/Suelo[:=]\s*([0-9]+(?:\.[0-9]+)?)(?:%?)/i);

        if (tempMatch) {
          const temp = parseFloat(tempMatch[1]);
          this.pushPoint('temp', temp);
        }

        if (sueloMatch) {
          const humedadSuelo = parseFloat(sueloMatch[1]);
          this.pushPoint('humidity', humedadSuelo);
          if (humedadSuelo < 30) this.activarRiegoAutomatico();
        }

      }
    });

    this.mqttService.getHistorial().subscribe(res => {
      if (res && res.historial) {
        this.historial = res.historial;
      }
    });
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
            data: this.humidityData,
            borderColor: 'rgba(121, 157, 204, 0.3)',
            backgroundColor: 'rgba(28, 28, 158, 0.2)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Temperatura (°C)',
            data: this.tempData,
            borderColor: 'rgba(110, 93, 63, 0.4)',
            backgroundColor: 'rgba(116, 111, 102, 0.2)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, max: 80 },
          x: { display: false }
        }
      }
    });
  }

  private pushPoint(type: 'humidity' | 'temp', value: number): void {
    if (type === 'humidity') {
      this.humidityData.push(value);
      if (this.humidityData.length > this.maxDataPoints) this.humidityData.shift();
    }
    if (type === 'temp') {
      this.tempData.push(value);
      if (this.tempData.length > this.maxDataPoints) this.tempData.shift();
    }

    this.ensureChart();
    if (this.chart) {
      this.chart.data.datasets[0].data = [...this.humidityData];
      this.chart.data.datasets[1].data = [...this.tempData];
      this.chart.update('none');
    }
  }

  // ====== CUIDADOS ======
  guardarCuidado(): void {
    if (!this.nuevoCuidado.fecha || !this.nuevoCuidado.tipo) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    alert(`Cuidado guardado:\n${this.nuevoCuidado.tipo} el ${this.nuevoCuidado.fecha}`);
    this.nuevoCuidado = { fecha: '', tipo: '', detalles: '' };
  }
}
