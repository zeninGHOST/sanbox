

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







// custom-error-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendError, BackendMetricErrors } from '../error.model'; // Import the models

@Component({
  selector: 'app-custom-error-dialog',
  templateUrl: './custom-error-dialog.component.html',
  styleUrls: ['./custom-error-dialog.component.css'],
})
export class CustomErrorDialogComponent {
  errorMessage: string = '';
  detailedErrors: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CustomErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BackendError
  ) {
    this.parseErrorMessage(data);
  }

  parseErrorMessage(errorData: BackendError): void {
    if (errorData?.error && typeof errorData.error === 'string') {
      this.errorMessage = errorData.message || 'An unexpected error occurred.';
    } else if (errorData?.error && typeof errorData.error === 'object') {
      this.parseMetricErrors(errorData.error as BackendMetricErrors);
    } else if (errorData?.message) {
      this.errorMessage = errorData.message;
    } else {
      this.errorMessage = 'An unexpected error occurred.';
    }
  }

  parseMetricErrors(metricErrors: BackendMetricErrors): void {
    this.detailedErrors = [];
    for (const metricIndex in metricErrors) {
      if (metricErrors.hasOwnProperty(metricIndex)) {
        const fieldErrors = metricErrors[metricIndex];
        for (const field in fieldErrors) {
          if (fieldErrors.hasOwnProperty(field)) {
            this.detailedErrors.push(`Metric ${parseInt(metricIndex) + 1}, Field '${field}': ${fieldErrors[field].join(', ')}`);
          }
        }
      }
    }
    this.errorMessage = 'Please correct the following errors:';
  }

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
import { CustomErrorDialogComponent } from '../custom-error-dialog/custom-error-dialog.component';
import { delay, of, throwError } from 'rxjs';
import { BackendError } from '../error.model'; // Import the model

// ... component metadata
export class SearchAppComponent {
  // ... other properties

  createMetric(metric: any) {
    this.loadingTable = true;
    // Simulate create service call with potential error (replace with actual service call)
    of({ ...metric, updated: new Date().toISOString(), uuid: this.generateUUID() })
      .pipe(delay(1000))
      .subscribe(
        (createdMetric) => {
          // ... success logic ...
        },
        (errorResponse: BackendError) => { // Type the error response
          console.error('Error creating metric:', errorResponse);
          this.loadingTable = false;
          this.openErrorDialog(errorResponse); // Pass the entire error response
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
          // ... success logic ...
        },
        (errorResponse: BackendError) => { // Type the error response
          console.error('Error updating metric:', errorResponse);
          this.loadingTable = false;
          this.openErrorDialog(errorResponse); // Pass the entire error response
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
          // ... success logic ...
        },
        (errorResponse: BackendError) => { // Type the error response
          console.error('Error deleting metric:', errorResponse);
          this.loadingTable = false;
          this.openErrorDialog(errorResponse); // Pass the entire error response
        }
      );
  }

  openErrorDialog(error: BackendError): void {
    this.dialog.open(CustomErrorDialogComponent, {
      width: '400px',
      data: error, // Pass the structured error
    });
  }
}




/////////////////////////
// custom-error-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BackendError, BackendMetricErrors } from '../error.model';

@Component({
  selector: 'app-custom-error-dialog',
  templateUrl: './custom-error-dialog.component.html',
  styleUrls: ['./custom-error-dialog.component.css'],
})
export class CustomErrorDialogComponent {
  errorMessage: string = '';
  detailedErrors: string[] = [];

  constructor(
    public dialogRef: MatDialogRef<CustomErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BackendError
  ) {
    this.parseErrorMessage(data);
  }

  parseErrorMessage(errorData: BackendError): void {
    if (errorData?.error && typeof errorData.error === 'string') {
      this.errorMessage = errorData.message || 'An unexpected error occurred.';
    } else if (errorData?.error && typeof errorData.error === 'object') {
      this.parseMetricErrors(errorData.error as BackendMetricErrors);
    } else if (errorData?.message) {
      this.errorMessage = errorData.message;
    } else {
      this.errorMessage = 'An unexpected error occurred.';
    }
  }

  parseMetricErrors(metricErrors: BackendMetricErrors): void {
    this.detailedErrors = [];
    for (const metricIndex in metricErrors) {
      if (metricErrors.hasOwnProperty(metricIndex)) {
        const fieldErrors = metricErrors[metricIndex];
        for (const field in fieldErrors) {
          if (fieldErrors.hasOwnProperty(field)) {
            const errorValue = fieldErrors[field];
            if (Array.isArray(errorValue)) {
              this.detailedErrors.push(`Metric ${parseInt(metricIndex) + 1}, Field '${field}': ${errorValue.join(', ')}`);
            } else if (typeof errorValue === 'string') {
              this.detailedErrors.push(`Metric ${parseInt(metricIndex) + 1}, Field '${field}': ${errorValue}`);
            } else {
              this.detailedErrors.push(`Metric ${parseInt(metricIndex) + 1}, Field '${field}': Unknown error format`);
            }
          }
        }
      }
    }
    this.errorMessage = 'Please correct the following errors:';
  }

  onCloseClick(): void {
    this.dialogRef.close();
  }
}