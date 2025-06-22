import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';

@Component({
  selector: 'app-add-investment-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Add New Investment</h2>
    <mat-dialog-content>
      <form #investmentForm="ngForm">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Investment Name</mat-label>
          <input matInput [(ngModel)]="data.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Amount</mat-label>
          <input matInput type="number" [(ngModel)]="data.amount" name="amount" required>
          <span matPrefix>$&nbsp;</span>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Investment Type</mat-label>
          <mat-select [(ngModel)]="data.type" name="type" required>
            <mat-option *ngFor="let type of data.investmentTypes" [value]="type">
              {{type}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Return Rate (%)</mat-label>
          <input matInput type="number" [(ngModel)]="data.returnRate" name="returnRate" required>
          <span matSuffix>%</span>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" 
              [disabled]="!investmentForm.form.valid"
              (click)="onSubmit()">
        Add Investment
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    mat-dialog-content {
      min-width: 300px;
    }
  `]
})
export class AddInvestmentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AddInvestmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      name: string;
      amount: number;
      type: string;
      returnRate: number;
      investmentTypes: string[];
    }
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.data);
  }
} 