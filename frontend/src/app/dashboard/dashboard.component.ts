import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../auth.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  ph = signal<number | null>(null);
  cloro = signal<number | null>(null);
  temperatura = signal<number | null>(null);

  alertPh = signal(false);
  alertCloro = signal(false);
  alertTemp = signal(false);

  temAlerta = computed(() => this.alertTemp() || this.alertPh() || this.alertCloro());

  private sub?: Subscription;
  private rawHistorico: any = null;

  chartDataPh: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  chartDataCloro: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  chartDataTemp: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };

  chartOptionsDark: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: {
      point: { radius: 0, hitRadius: 10, hoverRadius: 4 }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8b9bb4' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#8b9bb4' }
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  constructor(private http: HttpClient, private auth: AuthService, private toastService: ToastService) { }

  ngOnInit() {
    this.fetchData();
    this.sub = interval(3000).subscribe(() => this.fetchData());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  logout() {
    this.auth.logout();
  }

  exportarRelatorio() {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();

    // Título
    doc.setFontSize(22);
    doc.setTextColor(20, 30, 50);
    doc.text('Relatório de Qualidade da Água', 14, 22);

    // Subtítulo
    doc.setFontSize(11);
    doc.setTextColor(120, 130, 140);
    doc.text(`Gerado em: ${date}`, 14, 30);

    if (this.rawHistorico) {
      // Unificar os dados por hora
      const timeMap = new Map<string, any>();

      const addData = (type: string, dataArray: any[]) => {
        if (!dataArray) return;
        const subset = dataArray.slice(-20); // Últimos 20
        for (const item of subset) {
          // Extrai hora e minuto (HH:mm)
          const time = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (!timeMap.has(time)) timeMap.set(time, {});
          timeMap.get(time)[type] = item.valor;
        }
      };

      addData('temp', this.rawHistorico.temperatura);
      addData('ph', this.rawHistorico.ph);
      addData('cloro', this.rawHistorico.cloro);

      // Ordenar do mais antigo pro mais novo (crescente)
      const sortedTimes = Array.from(timeMap.keys()).sort();

      const body = sortedTimes.map(time => {
        const row = timeMap.get(time);
        const tVal = row.temp !== undefined ? Number(row.temp).toFixed(1) + ' °C' : '--';
        const pVal = row.ph !== undefined ? Number(row.ph).toFixed(1) : '--';
        const cVal = row.cloro !== undefined ? Number(row.cloro).toFixed(1) + ' ppm' : '--';
        return [time, tVal, pVal, cVal];
      });

      autoTable(doc, {
        startY: 40,
        head: [['Hora da Leitura', 'Temperatura', 'Nível de pH', 'Nível de Cloro']],
        body: body,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 8, textColor: [80, 80, 80] },
        headStyles: {
          fillColor: [0, 180, 216], // Azul ciano da foto
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: { fillColor: [248, 249, 250] }, // Cinza bem claro
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' }
        }
      });
    }

    doc.save('relatorio_qualidade_agua.pdf');
  }

  private fetchData() {
    this.http.get<any>('/api/historico').subscribe({
      next: (historico) => {
        this.rawHistorico = historico;
        this.processHistory(historico);
      },
      error: (err) => {
        console.error("Erro ao buscar historico:", err);
        // Não mostra erro se for status 0 (aba dormindo/sem internet) ou erro de auth
        if (err.status !== 0 && err.status !== 401 && err.status !== 403) {
          this.toastService.show('Conectando com o servidor', 'info');
        }
      }
    });
  }

  private processHistory(historico: any) {
    if (historico.ph && historico.ph.length > 0) {
      const phHist = historico.ph.slice(-20);
      const lastPh = phHist[phHist.length - 1].valor as number;
      this.ph.set(lastPh);
      this.alertPh.set(lastPh < 7.2 || lastPh > 7.8);
      this.chartDataPh = {
        labels: phHist.map((h: any) => new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
          data: phHist.map((h: any) => h.valor),
          label: 'pH',
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          fill: true,
          tension: 0.4
        }]
      };
    }

    if (historico.cloro && historico.cloro.length > 0) {
      const cHist = historico.cloro.slice(-20);
      const lastC = cHist[cHist.length - 1].valor as number;
      this.cloro.set(lastC);
      this.alertCloro.set(lastC < 0.8 || lastC > 3.0);
      this.chartDataCloro = {
        labels: cHist.map((h: any) => new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
          data: cHist.map((h: any) => h.valor),
          label: 'Cloro (ppm)',
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          fill: true,
          tension: 0.4
        }]
      };
    }

    if (historico.temperatura && historico.temperatura.length > 0) {
      const tHist = historico.temperatura.slice(-20);
      const lastT = tHist[tHist.length - 1].valor as number;
      this.temperatura.set(lastT);
      this.alertTemp.set(lastT < 25 || lastT > 27);
      this.chartDataTemp = {
        labels: tHist.map((h: any) => new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        datasets: [{
          data: tHist.map((h: any) => h.valor),
          label: 'Temperatura (°C)',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          fill: true,
          tension: 0.4
        }]
      };
    }
  }
}
