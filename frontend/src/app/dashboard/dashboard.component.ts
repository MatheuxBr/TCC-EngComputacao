import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
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

  constructor(private http: HttpClient, private auth: AuthService, private toastService: ToastService) { }

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
    this.fetchData();
  }

  private connectWebSocket() {
    // Usar o endpoint configurado no proxy
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    this.stompClient = new Client({
      brokerURL: wsUrl, // Usar brokerURL nativo em vez de webSocketFactory com SockJS
      debug: (str) => {
        // console.log(str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.stompClient.onConnect = (frame) => {
      this.stompClient?.subscribe('/topic/medicoes', (message) => {
        if (message.body) {
          const dados = JSON.parse(message.body);
          this.atualizarDadosTempoReal(dados);
        }
      });
    };

    this.stompClient.activate();
  }

  private atualizarDadosTempoReal(dados: any) {
    const timeLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (dados.ph !== undefined) {
      this.ph.set(dados.ph);
      this.alertPh.set(dados.ph < 7.2 || dados.ph > 7.8);
      this.chartDataPh.labels?.push(timeLabel);
      this.chartDataPh.datasets[0].data.push(dados.ph);
      this.chartDataPh = { ...this.chartDataPh };
    }

    if (dados.orp !== undefined) {
      this.orp.set(dados.orp);
      this.alertOrp.set(dados.orp < 650 || dados.orp > 750);
      this.chartDataOrp.labels?.push(timeLabel);
      this.chartDataOrp.datasets[0].data.push(dados.orp);
      this.chartDataOrp = { ...this.chartDataOrp };
    }

    if (dados.temperatura !== undefined) {
      this.temperatura.set(dados.temperatura);
      this.alertTemp.set(dados.temperatura < 25 || dados.temperatura > 27);
      this.chartDataTemp.labels?.push(timeLabel);
      this.chartDataTemp.datasets[0].data.push(dados.temperatura);
      this.chartDataTemp = { ...this.chartDataTemp };
    }
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
      const timeMap = new Map<string, any>();

      const addData = (type: string, dataArray: any[]) => {
        if (!dataArray) return;
        for (const item of dataArray) {
          // Extrai hora e minuto
          const time = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (!timeMap.has(time)) timeMap.set(time, {});
          timeMap.get(time)[type] = item.valor;
        }
      };

      addData('temp', this.rawHistorico.temperatura);
      addData('ph', this.rawHistorico.ph);
      addData('orp', this.rawHistorico.orp);

      // Ordenar do mais antigo pro mais novo (crescente)
      const sortedTimes = Array.from(timeMap.keys()).sort();

      const body = sortedTimes.map(time => {
        const row = timeMap.get(time);
        const tVal = row.temp !== undefined ? Number(row.temp).toFixed(1) + ' °C' : '--';
        const pVal = row.ph !== undefined ? Number(row.ph).toFixed(1) : '--';
        const oVal = row.orp !== undefined ? Number(row.orp).toFixed(1) + ' mV' : '--';
        return [time, tVal, pVal, oVal];
      });

      autoTable(doc, {
        startY: 40,
        head: [['Hora da Leitura', 'Temperatura', 'Nível de pH', 'Nível de ORP']],
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
    if (historico.ph && historico.ph.length > 0) {
      const phHist = historico.ph;
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

    if (historico.orp && historico.orp.length > 0) {
      const oHist = historico.orp;
      const lastO = oHist[oHist.length - 1].valor as number;
      this.orp.set(lastO);
      this.alertOrp.set(lastO < 650 || lastO > 750);
      this.chartDataOrp = {
        labels: oHist.map((h: any) => new Date(h.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
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
