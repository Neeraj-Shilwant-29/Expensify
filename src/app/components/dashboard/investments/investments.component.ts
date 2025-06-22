import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
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
    AddInvestmentDialogComponent
  ],
  templateUrl: './investments.component.html',
  styleUrl: './investments.component.scss'
})
export class InvestmentsComponent implements OnInit {
  totalInvestment = 50000;
  totalReturn = 2500;
  totalCurrentValue = 52500;
  totalTransactions = 1;

  displayedColumns: string[] = ['name', 'amount', 'type', 'returnRate', 'currentValue', 'date', 'actions'];
  dataSource: MatTableDataSource<Investment>;

  nameFilter: string = '';
  typeFilter: string = '';
  timeFilter: string = 'all';

  investmentTypes: string[] = ['Stocks', 'Bonds', 'Mutual Funds', 'Real Estate', 'Cryptocurrency', 'Other'];
  timeFilters = [
    { value: 'all', label: 'All' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'pastMonth', label: 'Past Month' },
    { value: 'pastWeek', label: 'Past Week' }
  ];

  constructor(private dialog: MatDialog) {
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
      const searchTerms = JSON.parse(filter);
      const nameMatch = !searchTerms.name || data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
      const typeMatch = !searchTerms.type || data.type === searchTerms.type;
      const timeMatch = this.filterByTime(data.date, searchTerms.time);
      return nameMatch && typeMatch && timeMatch;
    };
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
      name: this.nameFilter,
      type: this.typeFilter,
      time: this.timeFilter
    };
    this.dataSource.filter = JSON.stringify(filterValue);
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
}
