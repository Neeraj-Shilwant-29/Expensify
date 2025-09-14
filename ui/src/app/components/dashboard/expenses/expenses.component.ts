import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../material.module';
import { AddExpenseDialogComponent } from './add-expense-dialog/add-expense-dialog.component';
import { ExpenseService, Expense } from '../../../services/expense.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    AddExpenseDialogComponent
  ],
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent implements OnInit, OnDestroy, AfterViewInit {
  totalExpenses = 0;
  totalTransactions = 0;
  averageExpense = 0;

  displayedColumns: string[] = ['name', 'amount', 'category', 'date', 'description', 'actions'];
  dataSource!: MatTableDataSource<Expense>;

  nameFilter: string = '';
  categoryFilter: string = '';
  timeFilter: string = 'all';

  categories: string[] = ['Food & Dining', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Shopping', 'Healthcare', 'Education', 'Travel', 'Other'];
  timeFilters = [
    { value: 'all', label: 'All' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'pastMonth', label: 'Past Month' },
    { value: 'pastWeek', label: 'Past Week' }
  ];

  constructor(
    private dialog: MatDialog,
    private expenseService: ExpenseService,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.dataSource = new MatTableDataSource<Expense>([]);
  }

  ngOnInit(): void {
    this.loadExpenses();
    
    // Set up the filter predicate
    this.dataSource.filterPredicate = (data: Expense, filter: string) => {
      const searchTerms = JSON.parse(filter);
      const nameMatch = !searchTerms.name || data.title.toLowerCase().includes(searchTerms.name.toLowerCase());
      const categoryMatch = !searchTerms.category || data.category === searchTerms.category;
      const timeMatch = this.filterByTime(new Date(data.date), searchTerms.time);
      return nameMatch && categoryMatch && timeMatch;
    };
  }

  ngAfterViewInit(): void {
    // Ensure component is properly rendered
    this.cdr.detectChanges();
    
    // Force re-render after a short delay to ensure mat-select components are ready
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 200);
  }

  ngOnDestroy(): void {
    // Clean up resources if necessary
  }

  // Method to reinitialize component when it becomes active
  reinitializeComponent(): void {
    this.initializeComponent();
    this.loadExpenses();
    this.cdr.detectChanges();
  }

  loadExpenses(): void {
    this.expenseService.getExpenses().subscribe({
      next: (expenses) => {
        this.dataSource.data = expenses;
        this.updateTotals(expenses);
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        // TODO: Show error message to user
      }
    });
  }

  updateTotals(expenses: Expense[]): void {
    this.totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    this.totalTransactions = expenses.length;
    this.averageExpense = this.totalTransactions > 0 ? this.totalExpenses / this.totalTransactions : 0;
  }

  openAddExpenseDialog(): void {
    const dialogRef = this.dialog.open(AddExpenseDialogComponent, {
      width: '400px',
      data: { categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.expenseService.addExpense(result).subscribe({
          next: (newExpense) => {
            const currentData = this.dataSource.data;
            this.dataSource.data = [...currentData, newExpense];
            this.updateTotals(this.dataSource.data);
          },
          error: (error) => {
            console.error('Error adding expense:', error);
            // TODO: Show error message to user
          }
        });
      }
    });
  }

  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.expenseService.deleteExpense(id).subscribe({
        next: () => {
          const currentData = this.dataSource.data;
          this.dataSource.data = currentData.filter(expense => expense._id !== id);
          this.updateTotals(this.dataSource.data);
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
          // TODO: Show error message to user
        }
      });
    }
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
