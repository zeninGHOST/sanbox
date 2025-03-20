// metric-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-metric-dialog',
  templateUrl: './metric-dialog.component.html',
  styleUrls: ['./metric-dialog.component.css'],
})
export class MetricDialogComponent {
  metricForm: FormGroup;
  isUpdate: boolean; // Flag to determine if it's an update or create

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<MetricDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isUpdate = !!data; // If data exists, it's an update
    this.metricForm = this.fb.group({
      fileSystemType: [data?.fileSystemType || '', Validators.required],
      alertType: [data?.alertType || '', Validators.required],
      email: [data?.email || ''],
      slack: [data?.slack || ''],
      condition: [data?.condition || '', Validators.required],
      threshold: [data?.threshold || '', [Validators.required, Validators.min(1), Validators.max(99)]],
      mountPath: [data?.mountPath || '', Validators.required],
    });
  }

  onCancelClick(): void {
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
import { delay, of } from 'rxjs';

// ... (rest of the component code)

  openDialog(row?: any) { // row is now optional
    const dialogRef = this.dialog.open(MetricDialogComponent, {
      width: '500px',
      data: row,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (row) {
          console.log('Updated metric:', result);
          // Call update service
        } else {
          console.log('Created metric:', result);
          // Call create service
          this.searchResults.metrics.push(result);
          this.dataSource.data = this.searchResults.metrics;
        }
      }
    });
  }

// ... (rest of the component code)
