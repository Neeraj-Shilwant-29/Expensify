import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material.module';
import { AddInvestmentDialogComponent } from './add-investment-dialog/add-investment-dialog.component';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Investment {
  id: number;
  investmentId: string;
  amount: number;
  type: string;
  date: Date;
  returnRate: number;
  currentValue: number;
}

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
  ],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.scss'
})
export class InvestmentsComponent implements OnInit, OnDestroy, AfterViewInit {
  investmentSummary:any={};
  displayedColumns: string[] = ['investmentId', 'amount', 'type', 'returnRate', 'currentValue', 'date', 'actions'];
  dataSource!: MatTableDataSource<Investment>;

  typeFilter: string = '';
  timeFilter: string = '';

  investmentTypes: string[] = ['Stocks', 'Bonds', 'Mutual Funds', 'Real Estate', 'Cryptocurrency', 'Other'];
  timeFilters = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'pastMonth', label: 'Past Month' },
    { value: 'pastWeek', label: 'Past Week' }
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {
    const userId = 1;
    this.fetchInvestment(userId);
  }

  private fetchInvestment(userId:any): void {
    const params = new HttpParams().set('userId', userId);
    this.http.get<any>(
      `${environment.apiUrl}/investment`,
      { params }
    ).subscribe({
      next: (res) => {
        this.investmentSummary = {
          totalInvestment: res?.totalInvestment ?? 0,
          totalReturn: res?.totalReturn ?? 0,
          totalCurrentValue: res?.totalCurrentValue ?? 0,
          totalTransactions: res?.totalTransactions ?? 0
        };
        this.dataSource = res?.transactions;
      },
      error: (err) => {
        console.error('Failed to load summary', err);
      }
    });
  }

  ngOnInit(): void {
    // Set up the filter predicate
    this.dataSource.filterPredicate = (data: Investment, filter: string) => {
      if (!filter) return true; 
      const searchTerms = JSON.parse(filter);
      const typeMatch = !searchTerms.type || data.type === searchTerms.type;
      const timeMatch = this.filterByTime(data.date, searchTerms.time);
      return typeMatch && timeMatch;
    };
    this.dataSource.filter = '';
  }

  resetFilters(): void {
    this.typeFilter = '';
    this.timeFilter = '';
  }

  ngAfterViewInit(): void {
    // Force re-render after a short delay to ensure mat-select components are ready
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {

  }

  openAddInvestmentDialog(): void {
    const dialogRef = this.dialog.open(AddInvestmentDialogComponent, {
      width: '400px',
      data: { investmentTypes: this.investmentTypes }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add new investment to the table
        const currentData = this.dataSource.data;
        const newInvestment = {
          id: currentData.length + 1,
          ...result,
          date: new Date(),
          currentValue: result.amount * (1 + result.returnRate / 100)
        };
        
        this.dataSource.data = [...currentData, newInvestment];
        
        // Update totals
        this.investmentSummary.totalInvestment += result.amount;
        this.investmentSummary.totalReturn += (result.amount * result.returnRate / 100);
        this.investmentSummary.totalCurrentValue += newInvestment.currentValue;
        this.investmentSummary.totalTransactions++;
      }
    });
  }

  applyFilters(): void {
    const filterValue = {
      type: this.typeFilter ?? '',
      time: this.timeFilter ?? ''
    };
    this.dataSource.filter = JSON.stringify(filterValue);
    this.cdr.detectChanges();
  }

  editInvestment(investment: Investment): void {
    const dialogRef = this.dialog.open(AddInvestmentDialogComponent, {
      width: '400px',
      data: { 
        investmentTypes: this.investmentTypes,
        investment: investment,
        isEdit: true
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the investment in the table
        const currentData = this.dataSource.data;
        const index = currentData.findIndex(item => item.id === investment.id);
        
        if (index !== -1) {
          // Calculate new current value
          const newCurrentValue = result.amount * (1 + result.returnRate / 100);
          
          // Update the investment
          currentData[index] = {
            ...currentData[index],
            ...result,
            currentValue: newCurrentValue
          };
          
          this.dataSource.data = [...currentData];
          
          // Update totals
          this.updateTotals();
          
          this.snackBar.open('Investment updated successfully!', 'Close', {
            duration: 3000
          });
        }
      }
    });
  }

  deleteInvestment(investment: Investment): void {
    const confirmed = confirm(`Are you sure you want to delete "${investment.investmentId}"?`);
    
    if (confirmed) {
      // Remove the investment from the table
      const currentData = this.dataSource.data;
      const filteredData = currentData.filter(item => item.id !== investment.id);
      
      this.dataSource.data = filteredData;
      
      // Update totals
      this.updateTotals();
      
      this.snackBar.open('Investment deleted successfully!', 'Close', {
        duration: 3000
      });
    }
  }

  private filterByTime(date: Date, timeFilter: string): boolean {
    const now = new Date();
    const itemDate = new Date(date);

    switch (timeFilter) {
      case 'thisMonth':
        return itemDate.getMonth() === now.getMonth() && 
               itemDate.getFullYear() === now.getFullYear();
      case 'thisWeek':
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return itemDate >= weekStart;
      case 'pastMonth':
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return itemDate >= lastMonth && itemDate < new Date(now.getFullYear(), now.getMonth(), 1);
      case 'pastWeek':
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        return itemDate >= lastWeek && itemDate < new Date();
      default:
        return true;
    }
  }

  private updateTotals(): void {
    const data = this.dataSource.data;
    this.investmentSummary.totalInvestment = data.reduce((sum, item) => sum + item.amount, 0);
    this.investmentSummary.totalReturn = data.reduce((sum, item) => sum + (item.currentValue - item.amount), 0);
    this.investmentSummary.totalCurrentValue = data.reduce((sum, item) => sum + item.currentValue, 0);
    this.investmentSummary.totalTransactions = data.length;
  }
}
