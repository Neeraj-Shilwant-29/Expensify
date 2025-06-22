import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChart!: ElementRef<HTMLCanvasElement>;
  
  summaryData = {
    totalIncome: 36500,
    availableBalance: 34440,
    totalSpent: 2060,
    totalInvestment: 0,
    totalSubscriptions: 0
  };

  private chart: Chart | null = null;

  ngOnInit() {
    // Chart will be initialized in ngAfterViewInit
  }

  ngAfterViewInit() {
    this.initChart();
  }

  private initChart() {
    if (!this.pieChart?.nativeElement) {
      console.error('Canvas element not found');
      return;
    }

    const ctx = this.pieChart.nativeElement.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Income', 'Expenses', 'Investments', 'Subscriptions'],
        datasets: [{
          data: [
            this.summaryData.totalIncome,
            this.summaryData.totalSpent,
            this.summaryData.totalInvestment,
            this.summaryData.totalSubscriptions
          ],
          backgroundColor: [
            '#4CAF50', // green
            '#F44336', // red
            '#2196F3', // blue
            '#FFC107'  // yellow
          ],
          hoverBackgroundColor: [
            '#81C784', // light green
            '#E57373', // light red
            '#64B5F6', // light blue
            '#FFD54F'  // light yellow
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              padding: 20
            }
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }
}
