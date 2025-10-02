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
    this.agregarHistorial('manual', 'Riego manual activado');
    alert('💧 Riego manual enviado al backend (simulado)');
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
        this.lastUpdate = `Última actualización: ${new Date().toLocaleTimeString()}`;
        this.isConnected = true;

        // Extraer temperatura y humedad de la cadena recibida
        const tempMatch = res.dato.match(/T[:=]\s*([0-9]+(?:\.[0-9]+)?)/i);
        const humMatch = res.dato.match(/Humedad:\s*(\d+)\s*%/i);

        if (tempMatch) {
          const temp = parseFloat(tempMatch[1]);
          this.pushPoint('temp', temp);
        }

        if (humMatch) {
          const humidity = parseInt(humMatch[1], 10);
          this.pushPoint('humidity', humidity);
          if (humidity < 30) this.activarRiegoAutomatico();
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
            borderColor: 'blue',
            backgroundColor: 'rgba(0, 0, 255, 0.2)',
            borderWidth: 2,
            fill: false,
            tension: 0.4
          },
          {
            label: 'Temperatura (°C)',
            data: this.tempData,
            borderColor: 'orange',
            backgroundColor: 'rgba(255,165,0,0.2)',
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
          y: { beginAtZero: true, max: 100 },
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

    alert(`🌿 Cuidado guardado:\n${this.nuevoCuidado.tipo} el ${this.nuevoCuidado.fecha}`);
    this.nuevoCuidado = { fecha: '', tipo: '', detalles: '' };
  }
}
