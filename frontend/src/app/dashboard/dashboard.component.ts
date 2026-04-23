import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AuthService } from '../auth.service';

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

  private sub?: Subscription;

  chartDataPh: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  chartDataCloro: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  chartDataTemp: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    elements: { point: { radius: 2 } },
    scales: { x: { display: false } }
  };

  chartOptionsPh: ChartOptions<'line'> = { ...this.chartOptions, plugins: { title: { display: true, text: 'pH (Abaixo 7.2 ou Acima 7.8 = Alerta)' } } };
  chartOptionsCloro: ChartOptions<'line'> = { ...this.chartOptions, plugins: { title: { display: true, text: 'Cloro (Abaixo 0.8 ou Acima 3.0 = Alerta)' } } };
  chartOptionsTemp: ChartOptions<'line'> = { ...this.chartOptions, plugins: { title: { display: true, text: 'Temp (Abaixo 25 ou Acima 27 = Alerta)' } } };

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit() {
    this.fetchData();
    this.sub = interval(3000).subscribe(() => this.fetchData());
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  logout() {
    this.authService.logout();
  }

  private fetchData() {
    this.http.get<any>('/api/historico').subscribe({
      next: (historico) => {
        this.processHistory(historico);
      },
      error: (err) => console.error("Erro ao buscar historico:", err)
    });
  }

  private processHistory(historico: any) {
    if (historico.ph && historico.ph.length > 0) {
      const phHist = historico.ph.slice(-20);
      const lastPh = phHist[phHist.length - 1].valor as number;
      this.ph.set(lastPh);
      this.alertPh.set(lastPh < 7.2 || lastPh > 7.8);
      this.chartDataPh = {
        labels: phHist.map((_: any) => ''),
        datasets: [{ data: phHist.map((h: any) => h.valor), label: 'pH', borderColor: '#e67e22', tension: 0.1 }]
      };
    }

    if (historico.cloro && historico.cloro.length > 0) {
      const cHist = historico.cloro.slice(-20);
      const lastC = cHist[cHist.length - 1].valor as number;
      this.cloro.set(lastC);
      this.alertCloro.set(lastC < 0.8 || lastC > 3);
      this.chartDataCloro = {
        labels: cHist.map((_: any) => ''),
        datasets: [{ data: cHist.map((h: any) => h.valor), label: 'Cloro (ppm)', borderColor: '#3498db', tension: 0.1 }]
      };
    }

    if (historico.temperatura && historico.temperatura.length > 0) {
      const tHist = historico.temperatura.slice(-20);
      const lastT = tHist[tHist.length - 1].valor as number;
      this.temperatura.set(lastT);
      this.alertTemp.set(lastT < 25 || lastT > 27);
      this.chartDataTemp = {
        labels: tHist.map((_: any) => ''),
        datasets: [{ data: tHist.map((h: any) => h.valor), label: 'Temperatura (°C)', borderColor: '#e74c3c', tension: 0.1 }]
      };
    }
  }
}
