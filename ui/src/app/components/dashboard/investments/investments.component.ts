import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MaterialModule } from '../../../material.module';
import { AddInvestmentDialogComponent } from './add-investment-dialog/add-investment-dialog.component';

interface Investment {
  id: number;
  name: string;
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
  totalInvestment = 50000;
  totalReturn = 2500;
  totalCurrentValue = 52500;
  totalTransactions = 1;

  displayedColumns: string[] = ['name', 'amount', 'type', 'returnRate', 'currentValue', 'date', 'actions'];
  dataSource!: MatTableDataSource<Investment>;

  nameFilter: string = '';
  typeFilter: string = '';
  timeFilter: string = '';

  investmentTypes: string[] = ['Stocks', 'Bonds', 'Mutual Funds', 'Real Estate', 'Cryptocurrency', 'Other'];
  timeFilters = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'pastMonth', label: 'Past Month' },
    { value: 'pastWeek', label: 'Past Week' }
  ];

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar, private cdr: ChangeDetectorRef) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    // Initialize the data source with initial data
    this.dataSource = new MatTableDataSource([
      {
        id: 1,
        name: 'Tech Stocks',
        amount: 50000,
        type: 'Stocks',
        date: new Date(),
        returnRate: 5,
        currentValue: 52500
      }
    ]);
  }

  ngOnInit(): void {
    // Set up the filter predicate
    this.dataSource.filterPredicate = (data: Investment, filter: string) => {
      if (!filter) return true; 
      const searchTerms = JSON.parse(filter);
      const nameMatch = !searchTerms.name || data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
      const typeMatch = !searchTerms.type || data.type === searchTerms.type;
      const timeMatch = this.filterByTime(data.date, searchTerms.time);
      return nameMatch && typeMatch && timeMatch;
    };
    this.dataSource.filter = '';
  }

  resetFilters(): void {
    this.nameFilter = '';
    this.typeFilter = '';
    this.timeFilter = '';
  }

  ngAfterViewInit(): void {
    // Force re-render after a short delay to ensure mat-select components are ready
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    // Clean up resources if necessary
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
        this.totalInvestment += result.amount;
        this.totalReturn += (result.amount * result.returnRate / 100);
        this.totalCurrentValue += newInvestment.currentValue;
        this.totalTransactions++;
      }
    });
  }

  applyFilters(): void {
    const filterValue = {
      name: this.nameFilter ?? '',
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
    const confirmed = confirm(`Are you sure you want to delete "${investment.name}"?`);
    
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
    this.totalInvestment = data.reduce((sum, item) => sum + item.amount, 0);
    this.totalReturn = data.reduce((sum, item) => sum + (item.currentValue - item.amount), 0);
    this.totalCurrentValue = data.reduce((sum, item) => sum + item.currentValue, 0);
    this.totalTransactions = data.length;
  }
}
