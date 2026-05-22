import { Component, OnInit, OnDestroy, NgZone, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Subscription } from 'rxjs';
import { Client } from '@stomp/stompjs';
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
  orp = signal<number | null>(null);
  temperatura = signal<number | null>(null);

  alertPh = signal(false);
  alertOrp = signal(false);
  alertTemp = signal(false);

  periodoSelecionado = signal('24h');

  temAlerta = computed(() => this.alertTemp() || this.alertPh() || this.alertOrp());

  private sub?: Subscription;
  private stompClient?: Client;
  private rawHistorico: any = null;

  chartDataPh: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  chartDataOrp: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
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

  constructor(private http: HttpClient, private auth: AuthService, private toastService: ToastService, private ngZone: NgZone) { }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  ngOnInit() {
    this.fetchData();
    this.connectWebSocket();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    if (this.stompClient) {
      this.stompClient.deactivate();
    }
  }

  logout() {
    this.auth.logout();
  }

  mudarPeriodo(periodo: string) {
    this.periodoSelecionado.set(periodo);
    this.ph.set(null);
    this.orp.set(null);
    this.temperatura.set(null);
    this.chartDataPh = { datasets: [], labels: [] };
    this.chartDataOrp = { datasets: [], labels: [] };
    this.chartDataTemp = { datasets: [], labels: [] };
    this.fetchData();
  }

  private connectWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.stompClient = new Client({
      brokerURL: wsUrl,
      debug: (str) => {
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      this.stompClient?.subscribe('/topic/medicoes', (message) => {
        if (message.body) {
          const dados = JSON.parse(message.body);
          this.ngZone.run(() => {
            this.atualizarDadosTempoReal(dados);
          });
        }
      });
    };

    this.stompClient.onStompError = (frame) => {
      console.error('Erro STOMP:', frame.headers['message']);
    };

    this.stompClient.onWebSocketError = (event) => {
      console.error('Erro WebSocket:', event);
    };

    this.stompClient.activate();
  }

  private atualizarDadosTempoReal(dados: any) {
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const MAX_POINTS = 60;

    if (dados.ph !== undefined) {
      this.ph.set(dados.ph);
      this.alertPh.set(dados.ph < 7.2 || dados.ph > 7.8);
      if (this.chartDataPh.datasets.length > 0) {
        this.chartDataPh.labels?.push(timeLabel);
        this.chartDataPh.datasets[0].data.push(dados.ph);
        if (this.chartDataPh.labels && this.chartDataPh.labels.length > MAX_POINTS) {
          this.chartDataPh.labels.shift();
          this.chartDataPh.datasets[0].data.shift();
        }
        this.chartDataPh = { ...this.chartDataPh };
      }
    }

    if (dados.orp !== undefined) {
      this.orp.set(dados.orp);
      this.alertOrp.set(dados.orp < 650 || dados.orp > 750);
      if (this.chartDataOrp.datasets.length > 0) {
        this.chartDataOrp.labels?.push(timeLabel);
        this.chartDataOrp.datasets[0].data.push(dados.orp);
        if (this.chartDataOrp.labels && this.chartDataOrp.labels.length > MAX_POINTS) {
          this.chartDataOrp.labels.shift();
          this.chartDataOrp.datasets[0].data.shift();
        }
        this.chartDataOrp = { ...this.chartDataOrp };
      }
    }

    if (dados.temperatura !== undefined) {
      this.temperatura.set(dados.temperatura);
      this.alertTemp.set(dados.temperatura < 25 || dados.temperatura > 27);
      if (this.chartDataTemp.datasets.length > 0) {
        this.chartDataTemp.labels?.push(timeLabel);
        this.chartDataTemp.datasets[0].data.push(dados.temperatura);
        if (this.chartDataTemp.labels && this.chartDataTemp.labels.length > MAX_POINTS) {
          this.chartDataTemp.labels.shift();
          this.chartDataTemp.datasets[0].data.shift();
        }
        this.chartDataTemp = { ...this.chartDataTemp };
      }
    }
  }

  private getPeriodoLabel(): string {
    switch (this.periodoSelecionado()) {
      case '1h': return 'Última 1 Hora';
      case '24h': return 'Últimas 24 Horas';
      case '7d': return 'Últimos 7 Dias';
      default: return this.periodoSelecionado();
    }
  }

  private getTimeFormat(): Intl.DateTimeFormatOptions {
    if (this.periodoSelecionado() === '7d') {
      return { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' };
    }
    return { hour: '2-digit', minute: '2-digit' };
  }

  exportarRelatorio() {
    const doc = new jsPDF();
    const date = new Date().toLocaleString();
    const periodoLabel = this.getPeriodoLabel();

    doc.setFontSize(22);
    doc.setTextColor(20, 30, 50);
    doc.text('Relatório de Qualidade da Água', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(120, 130, 140);
    doc.text(`Gerado em: ${date}`, 14, 30);
    doc.text(`Período: ${periodoLabel}`, 14, 37);

    if (this.rawHistorico) {
      const timeMap = new Map<string, any>();
      const timeFormat = this.getTimeFormat();

      const addData = (type: string, dataArray: any[]) => {
        if (!dataArray) return;
        for (const item of dataArray) {
          const time = new Date(item.time).toLocaleString([], timeFormat);
          if (!timeMap.has(time)) timeMap.set(time, {});
          timeMap.get(time)[type] = item.valor;
        }
      };

      addData('temp', this.rawHistorico.temperatura);
      addData('ph', this.rawHistorico.ph);
      addData('orp', this.rawHistorico.orp);

      const sortedTimes = Array.from(timeMap.keys()).sort();

      const body = sortedTimes.map(time => {
        const row = timeMap.get(time);
        const tVal = row.temp !== undefined ? Number(row.temp).toFixed(1) + ' °C' : '--';
        const pVal = row.ph !== undefined ? Number(row.ph).toFixed(1) : '--';
        const oVal = row.orp !== undefined ? Number(row.orp).toFixed(1) + ' mV' : '--';
        return [time, tVal, pVal, oVal];
      });

      const headerLabel = this.periodoSelecionado() === '7d' ? 'Data/Hora' : 'Hora da Leitura';

      autoTable(doc, {
        startY: 45,
        head: [[headerLabel, 'Temperatura', 'Nível de pH', 'Nível de ORP']],
        body: body,
        theme: 'striped',
        styles: { fontSize: 10, cellPadding: 8, textColor: [80, 80, 80] },
        headStyles: {
          fillColor: [0, 180, 216],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          halign: 'left'
        },
        alternateRowStyles: { fillColor: [248, 249, 250] },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 'auto' }
        }
      });
    } else {
      doc.setFontSize(12);
      doc.setTextColor(200, 50, 50);
      doc.text('Nenhum dado disponível para o período selecionado.', 14, 50);
    }

    doc.save(`relatorio_qualidade_agua_${this.periodoSelecionado()}.pdf`);
  }

  private fetchData() {
    this.http.get<any>('/api/historico?periodo=' + this.periodoSelecionado()).subscribe({
      next: (historico) => {
        this.rawHistorico = historico;
        this.processHistory(historico);
      },
      error: (err) => {
        console.error("Erro ao buscar historico:", err);
      }
    });
  }

  private processHistory(historico: any) {
    const timeFormat = this.getTimeFormat();

    if (historico.ph && historico.ph.length > 0) {
      const phHist = historico.ph;
      const lastPh = phHist[phHist.length - 1].valor as number;
      this.ph.set(lastPh);
      this.alertPh.set(lastPh < 7.2 || lastPh > 7.8);
      this.chartDataPh = {
        labels: phHist.map((h: any) => new Date(h.time).toLocaleString([], timeFormat)),
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

    if (historico.orp && historico.orp.length > 0) {
      const oHist = historico.orp;
      const lastO = oHist[oHist.length - 1].valor as number;
      this.orp.set(lastO);
      this.alertOrp.set(lastO < 650 || lastO > 750);
      this.chartDataOrp = {
        labels: oHist.map((h: any) => new Date(h.time).toLocaleString([], timeFormat)),
        datasets: [{
          data: oHist.map((h: any) => h.valor),
          label: 'ORP (mV)',
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245, 158, 11, 0.2)',
          fill: true,
          tension: 0.4
        }]
      };
    }

    if (historico.temperatura && historico.temperatura.length > 0) {
      const tHist = historico.temperatura;
      const lastT = tHist[tHist.length - 1].valor as number;
      this.temperatura.set(lastT);
      this.alertTemp.set(lastT < 25 || lastT > 27);
      this.chartDataTemp = {
        labels: tHist.map((h: any) => new Date(h.time).toLocaleString([], timeFormat)),
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
