import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../material.module';
import { AddIncomeDialogComponent } from './add-income-dialog/add-income-dialog.component';

interface Income {
  id: number;
  name: string;
  amount: number;
  category: string;
  date: Date;
}

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    AddIncomeDialogComponent
  ],
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent implements OnInit {
  totalIncome = 36500;
  totalTransactions = 1;

  displayedColumns: string[] = ['name', 'amount', 'category', 'date', 'actions'];
  dataSource: MatTableDataSource<Income>;

  nameFilter: string = '';
  categoryFilter: string = '';
  timeFilter: string = 'all';

  categories: string[] = ['Salary', 'Freelance', 'Business', 'Investments', 'Other'];
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
        name: 'Salary',
        amount: 36500,
        category: 'Salary',
        date: new Date()
      }
    ]);
  }

  ngOnInit(): void {
  }

  AfterViewInit(): void {
   // Set up the filter predicate
   this.dataSource.filterPredicate = (data: Income, filter: string) => {
    const searchTerms = JSON.parse(filter);
    const nameMatch = !searchTerms.name || data.name.toLowerCase().includes(searchTerms.name.toLowerCase());
    const categoryMatch = !searchTerms.category || data.category === searchTerms.category;
    const timeMatch = this.filterByTime(data.date, searchTerms.time);
    return nameMatch && categoryMatch && timeMatch;
  };
  }

  openAddIncomeDialog(): void {
    const dialogRef = this.dialog.open(AddIncomeDialogComponent, {
      width: '400px',
      data: { categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add new income to the table
        const currentData = this.dataSource.data;
        this.dataSource.data = [...currentData, {
          id: currentData.length + 1,
          ...result,
          date: new Date()
        }];
        
        // Update total income
        this.totalIncome += result.amount;
        this.totalTransactions++;
      }
    });
  }

  applyFilters(): void {
    const filterValue = {
      name: this.nameFilter,
      category: this.categoryFilter,
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
