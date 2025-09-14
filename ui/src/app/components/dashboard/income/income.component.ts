import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../material.module';
import { AddIncomeDialogComponent } from './add-income-dialog/add-income-dialog.component';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridApi, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';

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
    ReactiveFormsModule,
    MaterialModule,
    AgGridModule,
    AddIncomeDialogComponent
  ],
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent implements OnInit, OnDestroy, AfterViewInit {
  totalIncome = 36500;
  totalTransactions = 1;

  // AG Grid properties
  private gridApi!: GridApi;
  public rowData: Income[] = [];
  public columnDefs: ColDef[] = [
    { field: 'name', headerName: 'Name', sortable: true, filter: true },
    { 
      field: 'amount', 
      headerName: 'Amount', 
      sortable: true, 
      filter: true,
      valueFormatter: (params) => `$${params.value.toFixed(2)}`
    },
    { field: 'category', headerName: 'Category', sortable: true, filter: true },
    { 
      field: 'date', 
      headerName: 'Date', 
      sortable: true, 
      filter: true,
      valueFormatter: (params) => new Date(params.value).toLocaleDateString()
    },
    {
      headerName: 'Actions',
      cellRenderer: (params: ICellRendererParams) => {
        return `
          <button class="btn btn-primary btn-sm me-2" onclick="window.editIncome(${params.data.id})">
            <i class="material-symbols-outlined">edit</i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="window.deleteIncome(${params.data.id})">
            <i class="material-symbols-outlined">delete</i>
          </button>
        `;
      },
      sortable: false,
      filter: false,
      width: 120
    }
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true
  };

  nameFilter: string = '';
  categoryFilter: string = '';
  timeFilter: string = '';

  categories: string[] = ['Salary', 'Freelance', 'Business', 'Investments', 'Other'];
  timeFilters = [
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'pastMonth', label: 'Past Month' },
    { value: 'pastWeek', label: 'Past Week' }
  ];

  constructor(private dialog: MatDialog, private cdr: ChangeDetectorRef) {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    // Initialize with sample data
    this.rowData = [
      {
        id: 1,
        name: 'Salary',
        amount: 36500,
        category: 'Salary',
        date: new Date()
      }
    ];
  }

  ngOnInit(): void {
    // Initialize filters to show all data
    this.applyFilters();
    
    // Set up window methods for action buttons
    (window as any).editIncome = (id: number) => {
      const data = this.rowData.find(item => item.id === id);
      if (data) {
        this.editIncome(data);
      }
    };
    
    (window as any).deleteIncome = (id: number) => {
      const data = this.rowData.find(item => item.id === id);
      if (data) {
        this.deleteIncome(data);
      }
    };
  }

  resetFilters(): void {
    this.nameFilter = '';
    this.categoryFilter = '';
    this.timeFilter = '';
  }

  ngAfterViewInit(): void {
    // Force re-render after a short delay to ensure components are ready
    setTimeout(() => {
      this.cdr.detectChanges();
      this.applyFilters();
    }, 200);
  }

  ngOnDestroy(): void {
    // Clean up resources if necessary
  }

  // AG Grid event handlers
  onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.setGridOption('rowData', this.rowData);
    this.applyFilters();
  }

  trackByCategory(index: number, category: string): string {
    return category;
  }
  onTimePeriodChange(event: any): void {
    if (event && event.value !== undefined) {
      this.timeFilter = event.value;
      this.applyFilters();
    }
  }

  onCategorySelectChange(event: any): void {
    if (event && event.value !== undefined) {
      this.categoryFilter = event.value;
      this.applyFilters();
    }
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  openAddIncomeDialog(): void {
    const dialogRef = this.dialog.open(AddIncomeDialogComponent, {
      width: '400px',
      data: { categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Add new income to the table
        const currentData = this.gridApi.getDisplayedRowCount();
        this.gridApi.applyTransaction({
          add: [{
            id: currentData + 1,
            ...result,
            date: new Date()
          }]
        });
        
        // Update total income
        this.totalIncome += result.amount;
        this.totalTransactions++;
      }
    });
  }

  applyFilters(): void {
    if (!this.gridApi) return;

    // Apply filters to AG Grid
    const filterModel: any = {};
    
    if (this.nameFilter) {
      filterModel.name = {
        type: 'contains',
        filter: this.nameFilter
      };
    }
    
    if (this.categoryFilter) {
      filterModel.category = {
        type: 'equals',
        filter: this.categoryFilter
      };
    }
    
    if (this.timeFilter) {
      // For time filtering, we'll need to implement custom logic
      // This is a simplified approach - you might want to implement more sophisticated time filtering
    }
    
    this.gridApi.setFilterModel(filterModel);
    this.cdr.detectChanges();
  }

  private filterByTime(date: Date, timeFilter: string): boolean {
    // If no time filter is selected, show all data
    if (!timeFilter || timeFilter === '') {
      return true;
    }

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

  editIncome(data: Income): void {
    console.log('Edit income:', data);
    // Implement edit logic here, e.g., open a dialog
  }

  deleteIncome(data: Income): void {
    console.log('Delete income:', data);
    // Implement delete logic here, e.g., confirm and remove from grid
  }

  // Method to reinitialize component when it becomes active
  reinitializeComponent(): void {
    this.initializeComponent();
    this.applyFilters();
    this.cdr.detectChanges();
  }

  // Method to ensure data is visible
  ensureDataVisible(): void {
    this.applyFilters();
    this.cdr.detectChanges();
  }
}
