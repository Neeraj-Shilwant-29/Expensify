import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-add-income-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  templateUrl: './add-income-dialog.component.html',
  styleUrls: ['./add-income-dialog.component.scss']
})
export class AddIncomeDialogComponent {
  income = {
    name: '',
    amount: null,
    category: ''
  };

  constructor(
    public dialogRef: MatDialogRef<AddIncomeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { categories: string[] }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.income.name && this.income.amount && this.income.category) {
      this.dialogRef.close(this.income);
    }
  }
} 