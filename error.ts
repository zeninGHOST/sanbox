

//ng generate component custom-error-dialog

// custom-error-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-error-dialog',
  templateUrl: './custom-error-dialog.component.html',
  styleUrls: ['./custom-error-dialog.component.css'],
})
export class CustomErrorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<CustomErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {}

  onCloseClick(): void {
    this.dialogRef.close();
  }
}


// search-app.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MetricDialogComponent } from '../metric-dialog/metric-dialog.component';
import { CustomErrorDialogComponent } from '../custom-error-dialog/custom-error-dialog.component'; // Import the new dialog
import { delay, of, throwError } from 'rxjs'; // Import throwError

interface SearchResult {
  appId: string;
  envType: string;
  metrics: {
    fileSystemType: string;
    alertType: string;
    email?: string;
    slack?: string;
    condition: string;
    threshold: number;
    mountPath: string;
    updated: string;
    uuid: string;
  }[];
}

@Component({
  // ... component metadata
})
export class SearchAppComponent {
  // ... other properties

  createMetric(metric: any) {
    this.loadingTable = true;
    // Simulate create service call with potential error (replace with actual service call)
    of({ ...metric, updated: new Date().toISOString(), uuid: this.generateUUID() })
      .pipe(delay(1000))
      .subscribe(
        (createdMetric) => {
          console.log('Created metric:', createdMetric);
          this.searchResults.metrics.unshift(createdMetric);
          this.dataSource.data = this.searchResults.metrics;
          this.loadingTable = false;
        },
        (error) => {
          console.error('Error creating metric:', error);
          this.loadingTable = false;
          this.openErrorDialog(error.message || 'Error creating metric. Please try again.'); // Display backend error
        }
      );
  }

  updateMetric(updatedMetric: any, originalMetric: any) {
    this.loadingTable = true;
    // Simulate update service call with potential error (replace with actual service call)
    of(this.searchResults.metrics.map(m => m.uuid === originalMetric.uuid ? { ...updatedMetric, updated: new Date().toISOString(), uuid: originalMetric.uuid } : m))
      .pipe(delay(1000))
      .subscribe(
        (updatedMetrics) => {
          console.log('Updated metrics:', updatedMetrics);
          this.searchResults.metrics = updatedMetrics;
          this.dataSource.data = this.searchResults.metrics;
          this.loadingTable = false;
        },
        (error) => {
          console.error('Error updating metric:', error);
          this.loadingTable = false;
          this.openErrorDialog(error.message || 'Error updating metric. Please try again.'); // Display backend error
        }
      );
  }

  deleteMetric(metricToDelete: any) {
    this.loadingTable = true;
    // Simulate delete service call with potential error (replace with actual service call)
    of(metricToDelete)
      .pipe(delay(1000))
      .subscribe(
        (deletedMetric) => {
          console.log('Deleted metric:', deletedMetric);

          const index = this.searchResults.metrics.findIndex(m => m.uuid === deletedMetric.uuid);

          if (index !== -1) {
            this.searchResults.metrics.splice(index, 1);
          }

          this.dataSource.data = this.searchResults.metrics;
          this.loadingTable = false;
        },
        (error) => {
          console.error('Error deleting metric:', error);
          this.loadingTable = false;
          this.openErrorDialog(error.message || 'Error deleting metric. Please try again.'); // Display backend error
        }
      );
  }

  openErrorDialog(message: string): void {
    this.dialog.open(CustomErrorDialogComponent, {
      width: '400px',
      data: { message: message },
    });
  }
}
