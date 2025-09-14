import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExpensesComponent } from './expenses/expenses.component';
import { InvestmentsComponent } from './investments/investments.component';
import { SettingsComponent } from './settings/settings.component';
import { SubscriptionsComponent } from './subscriptions/subscriptions.component';
import { SummaryComponent } from './summary/summary.component';
import { IncomeComponent } from './income/income.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ExpensesComponent,
    InvestmentsComponent,
    SettingsComponent,
    SubscriptionsComponent,
    SummaryComponent,
    IncomeComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  activeSection: string = 'summary';

  ngOnInit(): void {
    // Initialize with summary section
    this.switchSection('summary');
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  switchSection(section: string): void {
    this.activeSection = section;
    
    // Force reinitialization of the active component
    setTimeout(() => {
      this.triggerComponentReinitialization(section);
    }, 100);
  }

  private triggerComponentReinitialization(section: string): void {
    // This method will be called to ensure components are properly initialized
    console.log(`Switched to ${section} section`);
  }
}
