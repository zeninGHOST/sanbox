// app.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { AppService } from './app.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface AppFormData {
  appId: string;
  envType: string;
  fileSystemType: string;
  alertType: string;
  email: string;
  slack?: string;
  condition: string;
  threshold: number;
  mountPaths: string[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appForm: FormGroup;
  envTypes: string[] = ['dev', 'test', 'prod'];
  fileSystemTypes: string[] = ['ext4', 'xfs', 'nfs'];
  alertTypes: string[] = ['email', 'slack'];
  conditions: string[] = ['>', '<', '='];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private fb: FormBuilder, private appService: AppService) {
    this.appForm = this.fb.group({
      appId: ['', Validators.required],
      envType: ['', Validators.required],
      fileSystemType: ['', Validators.required],
      alertType: ['', Validators.required],
      email: [''],
      slack: this.fb.group({
        webhook: [''],
      }),
      condition: ['', Validators.required],
      threshold: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      mountPaths: this.fb.array([]),
    });

    this.appForm.get('alertType')?.valueChanges.subscribe((value) => {
      this.updateValidators(value);
    });

    this.updateValidators(this.appForm.get('alertType')?.value);
  }

  get mountPathsFormArray() {
    return this.appForm.get('mountPaths') as FormArray;
  }

  updateValidators(alertType: string) {
    const emailControl = this.appForm.get('email');
    const slackControl = this.appForm.get('slack.webhook') as FormControl;

    if (alertType === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      slackControl.setValidators(null); // Clear slack validator
    } else if (alertType === 'slack') {
      emailControl?.setValidators(null); // Clear email validator
      slackControl.setValidators(Validators.required);
    } else {
      emailControl?.setValidators(null);
      slackControl.setValidators(null);
    }
    emailControl?.updateValueAndValidity();
    slackControl.updateValueAndValidity();
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.mountPathsFormArray.push(this.fb.control(value.trim()));
    }

    if (input) {
      input.value = '';
    }
  }

  remove(index: number): void {
    this.mountPathsFormArray.removeAt(index);
  }

  onSubmit() {
    if (this.appForm.valid) {
      const formData: AppFormData = {
        ...this.appForm.value,
        mountPaths: this.mountPathsFormArray.value,
        slack: this.appForm.value.alertType === 'slack' ? this.appForm.value.slack.webhook : undefined,
      };

      if (formData.alertType === 'email') {
        delete formData.slack;
      }

      this.appService.submitForm(formData).subscribe(
        (response) => {
          console.log('Form submitted successfully:', response);
        },
        (error) => {
          console.error('Error submitting form:', error);
        }
      );
    }
  }
}


//update #2
// app.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
} from '@angular/forms';
import { AppService } from './app.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

interface AppFormData {
  appId: string;
  envType: string;
  fileSystemType: string;
  alertType: string;
  email?: string;
  slack?: string;
  condition: string;
  threshold: number;
  mountPaths: string[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appForm: FormGroup;
  envTypes: string[] = ['dev', 'test', 'prod'];
  fileSystemTypes: string[] = ['ext4', 'xfs', 'nfs'];
  alertTypes: string[] = ['email', 'slack'];
  conditions: string[] = ['>', '<', '='];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private fb: FormBuilder, private appService: AppService) {
    this.appForm = this.fb.group({
      appId: ['', Validators.required],
      envType: ['', Validators.required],
      fileSystemType: ['', Validators.required],
      alertType: ['', Validators.required],
      email: [''],
      slack: this.fb.group({
        webhook: [''],
      }),
      condition: ['', Validators.required],
      threshold: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      mountPaths: this.fb.array([]),
    });

    this.appForm.get('alertType')?.valueChanges.subscribe((value) => {
      this.updateValidators(value);
    });

    this.updateValidators(this.appForm.get('alertType')?.value);
  }

  get mountPathsFormArray() {
    return this.appForm.get('mountPaths') as FormArray;
  }

  updateValidators(alertType: string) {
    const emailControl = this.appForm.get('email');
    const slackControl = this.appForm.get('slack.webhook') as FormControl;

    if (alertType === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      slackControl.setValidators(null);
    } else if (alertType === 'slack') {
      emailControl?.setValidators(null);
      slackControl.setValidators(Validators.required);
    } else {
      emailControl?.setValidators(null);
      slackControl.setValidators(null);
    }
    emailControl?.updateValueAndValidity();
    slackControl.updateValueAndValidity();
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.mountPathsFormArray.push(this.fb.control(value.trim()));
    }

    if (input) {
      input.value = '';
    }
  }

  remove(index: number): void {
    this.mountPathsFormArray.removeAt(index);
  }

  onSubmit() {
    if (this.appForm.valid) {
      const formData: AppFormData = {
        ...this.appForm.value,
        mountPaths: this.mountPathsFormArray.value,
        slack: this.appForm.value.alertType === 'slack' ? this.appForm.value.slack.webhook : undefined,
      };

      if (formData.alertType === 'email') {
        delete formData.slack;
      }

      this.appService.submitForm(formData).subscribe(
        (response) => {
          console.log('Form submitted successfully:', response);
        },
        (error) => {
          console.error('Error submitting form:', error);
        }
      );
    }
  }
}


//UPDATE #3 dynamic form field
// app.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { AppService } from './app.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';

interface AppFormData {
  appId: string;
  envType: string;
  metrics: {
    fileSystemType: string;
    alertType: string;
    email?: string;
    slack?: string;
    condition: string;
    threshold: number;
    mountPaths: string[];
  }[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appForm: FormGroup;
  envTypes: string[] = ['dev', 'test', 'prod'];
  alertTypes: string[] = ['email', 'slack'];
  conditions: string[] = ['>', '<', '='];
  loading = false;
  mountPathInputControl = new FormControl('');

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private fb: FormBuilder, private appService: AppService) {
    this.appForm = this.fb.group({
      appId: ['', Validators.required],
      envType: ['', Validators.required],
      metrics: this.fb.array([]),
    });
  }

  createMetricFormGroup(): FormGroup {
    return this.fb.group({
      fileSystemType: ['', Validators.required],
      alertType: ['', Validators.required],
      email: [''],
      slack: this.fb.group({
        webhook: [''],
      }),
      condition: ['', Validators.required],
      threshold: [
        '',
        [Validators.required, Validators.min(1), Validators.max(99)],
      ],
      mountPaths: this.fb.array([], this.minOneMountPath),
    });
  }

  addMetric(): void {
    this.metricsFormArray.push(this.createMetricFormGroup());
    this.metricsFormArray.controls[this.metricsFormArray.length - 1]
      .get('alertType')
      ?.valueChanges.subscribe((value) => {
        this.updateValidators(this.metricsFormArray.controls[this.metricsFormArray.length - 1], value);
      });
    this.updateValidators(this.metricsFormArray.controls[this.metricsFormArray.length - 1], this.metricsFormArray.controls[this.metricsFormArray.length-1].get('alertType')?.value);
  }

  removeMetric(index: number): void {
    this.metricsFormArray.removeAt(index);
  }

  get metricsFormArray() {
    return this.appForm.get('metrics') as FormArray;
  }

  minOneMountPath: ValidatorFn = (control: AbstractControl): { [key: string]: any } | null => {
    const array = control.get('mountPaths') as FormArray;
    if (array.controls.length === 0) {
      return { 'minOneMountPath': true };
    }
    return null;
  };

  updateValidators(metricGroup: FormGroup, alertType: string) {
    const emailControl = metricGroup.get('email');
    const slackControl = metricGroup.get('slack.webhook') as FormControl;

    if (alertType === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      slackControl.setValidators(null);
    } else if (alertType === 'slack') {
      emailControl?.setValidators(null);
      slackControl.setValidators(Validators.required);
    } else {
      emailControl?.setValidators(null);
      slackControl.setValidators(null);
    }
    emailControl?.updateValueAndValidity();
    slackControl.updateValueAndValidity();
  }

  add(metricIndex: number, event: MatChipInputEvent): void {
    const value = this.mountPathInputControl.value;
    if ((value || '').trim()) {
      (this.metricsFormArray.at(metricIndex).get('mountPaths') as FormArray).push(
        this.fb.control(value.trim())
      );
      (this.metricsFormArray.at(metricIndex).get('mountPaths') as FormArray).updateValueAndValidity();
    }
    this.mountPathInputControl.reset();
  }

  remove(metricIndex: number, index: number): void {
    (this.metricsFormArray.at(metricIndex).get('mountPaths') as FormArray).removeAt(index);
    (this.metricsFormArray.at(metricIndex).get('mountPaths') as FormArray).updateValueAndValidity();
  }

  onSubmit() {
    if (this.appForm.valid) {
      this.loading = true;
      const formData: AppFormData = this.appForm.value;

      formData.metrics.forEach(metric => {
        if (metric.alertType === 'email') {
          delete metric.slack;
        } else {
          metric.slack = metric.slack?.webhook;
        }
      });

      of(formData)
        .pipe(delay(3000))
        .subscribe(
          (response) => {
            console.log('Form submitted successfully:', response);
            this.loading = false;
            window.location.reload();
          },
          (error) => {
            console.error('Error submitting form:', error);
            this.loading = false;
          }
        );
    }
  }
}

// update 4
// app.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { AppService } from './app.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';

interface AppFormData {
  appId: string;
  envType: string;
  metrics: {
    fileSystemType: string;
    alertType: string;
    email?: string;
    slack?: string; // Changed to string
    condition: string;
    threshold: number;
    mountPath: string;
  }[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appForm: FormGroup;
  envTypes: string[] = ['dev', 'test', 'prod'];
  fileSystemTypes: string[] = ['ext4', 'xfs', 'nfs'];
  alertTypes: string[] = ['email', 'slack'];
  conditions: string[] = ['>', '<', '='];
  loading = false;
  mountPathInputControl = new FormControl('');

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private fb: FormBuilder, private appService: AppService) {
    this.appForm = this.fb.group({
      appId: ['', Validators.required],
      envType: ['', Validators.required],
      metrics: this.fb.array([]),
    });
  }

  createMetricFormGroup(): FormGroup {
    return this.fb.group({
      fileSystemType: ['', Validators.required],
      alertType: ['', Validators.required],
      email: [''],
      slack: [''], // Changed to string
      condition: ['', Validators.required],
      threshold: [
        '',
        [Validators.required, Validators.min(1), Validators.max(99)],
      ],
      mountPath: ['', Validators.required],
    });
  }

  addMetric(): void {
    const newMetricGroup = this.createMetricFormGroup();
    this.metricsFormArray.push(newMetricGroup);

    newMetricGroup.get('alertType')?.valueChanges.subscribe((value) => {
      this.updateValidators(newMetricGroup, value);
    });

    this.updateValidators(newMetricGroup, newMetricGroup.get('alertType')?.value);
  }

  removeMetric(index: number): void {
    this.metricsFormArray.removeAt(index);
  }

  get metricsFormArray() {
    return this.appForm.get('metrics') as FormArray;
  }

  updateValidators(metricGroup: FormGroup, alertType: string) {
    const emailControl = metricGroup.get('email');
    const slackControl = metricGroup.get('slack'); // Changed to string

    if (alertType === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      slackControl?.setValidators(null);
    } else if (alertType === 'slack') {
      emailControl?.setValidators(null);
      slackControl?.setValidators(Validators.required);
    } else {
      emailControl?.setValidators(null);
      slackControl?.setValidators(null);
    }
    emailControl?.updateValueAndValidity();
    slackControl?.updateValueAndValidity();
  }

  onSubmit() {
    if (this.appForm.valid) {
      this.loading = true;
      const formData: AppFormData = this.appForm.value;

      formData.metrics.forEach(metric => {
        if (metric.alertType === 'email') {
          delete metric.slack;
        }
      });

      of(formData)
        .pipe(delay(3000))
        .subscribe(
          (response) => {
            console.log('Form submitted successfully:', response);
            this.loading = false;
            window.location.reload();
          },
          (error) => {
            console.error('Error submitting form:', error);
            this.loading = false;
          }
        );
    }
  }
}


// update 5

// app.component.ts
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ValidatorFn,
  AbstractControl,
} from '@angular/forms';
import { AppService } from './app.service';
import { delay } from 'rxjs/operators';
import { of } from 'rxjs';

interface AppFormData {
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
  }[];
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  appForm: FormGroup;
  envTypes: string[] = ['dev', 'test', 'prod'];
  fileSystemTypes: string[] = ['ext4', 'xfs', 'nfs'];
  alertTypes: string[] = ['email', 'slack', 'both']; // Added 'both'
  conditions: string[] = ['>', '<', '='];
  loading = false;
  collapsedMetrics: boolean[] = [];

  constructor(private fb: FormBuilder, private appService: AppService) {
    this.appForm = this.fb.group({
      appId: ['', Validators.required],
      envType: ['', Validators.required],
      metrics: this.fb.array([]),
    });
  }

  createMetricFormGroup(): FormGroup {
    return this.fb.group({
      fileSystemType: ['', Validators.required],
      alertType: ['', Validators.required],
      email: [''],
      slack: [''],
      condition: ['', Validators.required],
      threshold: [
        '',
        [Validators.required, Validators.min(1), Validators.max(99)],
      ],
      mountPath: ['', Validators.required],
    });
  }

  addMetric(): void {
    const newMetricGroup = this.createMetricFormGroup();
    this.metricsFormArray.push(newMetricGroup);
    this.collapsedMetrics.push(false);

    newMetricGroup.get('alertType')?.valueChanges.subscribe((value) => {
      this.updateValidators(newMetricGroup, value);
    });

    this.updateValidators(newMetricGroup, newMetricGroup.get('alertType')?.value);
  }

  removeMetric(index: number): void {
    this.metricsFormArray.removeAt(index);
    this.collapsedMetrics.splice(index, 1);
  }

  get metricsFormArray() {
    return this.appForm.get('metrics') as FormArray;
  }

  updateValidators(metricGroup: FormGroup, alertType: string) {
    const emailControl = metricGroup.get('email');
    const slackControl = metricGroup.get('slack');

    if (alertType === 'email') {
      emailControl?.setValidators([Validators.required, Validators.email]);
      slackControl?.setValidators(null);
    } else if (alertType === 'slack') {
      emailControl?.setValidators(null);
      slackControl?.setValidators(Validators.required);
    } else if (alertType === 'both') { // Added 'both' logic
      emailControl?.setValidators([Validators.required, Validators.email]);
      slackControl?.setValidators(Validators.required);
    } else {
      emailControl?.setValidators(null);
      slackControl?.setValidators(null);
    }
    emailControl?.updateValueAndValidity();
    slackControl?.updateValueAndValidity();
  }

  toggleCollapse(index: number): void {
    this.collapsedMetrics[index] = !this.collapsedMetrics[index];
  }

  onSubmit() {
    if (this.appForm.valid) {
      this.loading = true;
      const formData: AppFormData = this.appForm.value;

      formData.metrics.forEach((metric) => {
        if (metric.alertType === 'email') {
          delete metric.slack;
        }
      });

      of(formData)
        .pipe(delay(3000))
        .subscribe(
          (response) => {
            console.log('Form submitted successfully:', response);
            this.loading = false;
            window.location.reload();
          },
          (error) => {
            console.error('Error submitting form:', error);
            this.loading = false;
          }
        );
    }
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

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
  }[];
}

@Component({
  selector: 'app-search-app',
  templateUrl: './search-app.component.html',
  styleUrls: ['./search-app.component.css'],
})
export class SearchAppComponent {
  searchForm: FormGroup;
  searchResults: SearchResult | null = null;
  displayedColumns: string[] = ['fileSystemType', 'alertType', 'email', 'slack', 'condition', 'threshold', 'mountPath'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private fb: FormBuilder, private appService: AppService, public dialog: MatDialog) {
    this.searchForm = this.fb.group({
      appId: ['', Validators.required],
      envType: ['', Validators.required],
    });
  }

  searchApp() {
    if (this.searchForm.valid) {
      const appId = this.searchForm.value.appId;
      const envType = this.searchForm.value.envType;

      const mockResult: SearchResult = {
        appId: appId,
        envType: envType,
        metrics: [
          { fileSystemType: 'ext4', alertType: 'email', email: 'test1@example.com', condition: '>', threshold: 80, mountPath: '/data1' },
          { fileSystemType: 'xfs', alertType: 'slack', slack: 'slack-webhook-url1', condition: '<', threshold: 50, mountPath: '/logs1' },
          { fileSystemType: 'ext4', alertType: 'both', email: 'test2@example.com', slack: 'slack-webhook-url2', condition: '=', threshold: 90, mountPath: '/data2' },
          { fileSystemType: 'nfs', alertType: 'email', email: 'test3@example.com', condition: '>', threshold: 70, mountPath: '/data3' },
          { fileSystemType: 'xfs', alertType: 'slack', slack: 'slack-webhook-url3', condition: '<', threshold: 60, mountPath: '/logs3' },
        ],
      };

      console.log('Searching for app:', appId, envType);
      console.log('Mock search result:', mockResult);

      this.searchResults = mockResult;
      this.dataSource = new MatTableDataSource(this.searchResults.metrics);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(row: any) {
    const dialogRef = this.dialog.open(MetricDialogComponent, {
      width: '500px',
      data: row,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updated metric:', result);
        // Implement service call to update data
      }
    });
  }
}

@Component({
  selector: 'metric-dialog',
  template: `
    <h2 mat-dialog-title>Update Metric</h2>
    <mat-dialog-content>
      <form [formGroup]="metricForm">
        <mat-form-field appearance="outline">
          <mat-label>File System Type</mat-label>
          <input matInput formControlName="fileSystemType">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Alert Type</mat-label>
          <mat-select formControlName="alertType">
            <mat-option value="email">email</mat-option>
            <mat-option value="slack">slack</mat-option>
            <mat-option value="both">both</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Slack</mat-label>
          <input matInput formControlName="slack">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Condition</mat-label>
          <input matInput formControlName="condition">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Threshold</mat-label>
          <input matInput formControlName="threshold">
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Mount Path</mat-label>
          <input matInput formControlName="mountPath">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-button [mat-dialog-close]="metricForm.value" cdkFocusInitial>Submit</button>
    </mat-dialog-actions>
  `,
})
export class MetricDialogComponent {
  metricForm: FormGroup;

  constructor(public fb: FormBuilder, public dialogRef: any, public data: any) {
    this.metricForm = this.fb.group({
      fileSystemType: [data.fileSystemType],
      alertType: [data.alertType],
      email: [data.email],
      slack: [data.slack],
      condition: [data.condition],
      threshold: [data.threshold],
      mountPath: [data.mountPath],
    });
  }
}
//app.module.ts
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

@NgModule({
  declarations: [
    SearchAppComponent,
    MetricDialogComponent,
  ],
  imports: [
    // ... other imports
    MatDialogModule,
    MatPaginatorModule,
    MatSortModule,
  ],
})
export class AppModule { }

//metric-dialog.component.ts
//ng generate component metric-dialog
// metric-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-metric-dialog',
  templateUrl: './metric-dialog.component.html',
  styleUrls: ['./metric-dialog.component.css'],
})
export class MetricDialogComponent {
  metricForm: FormGroup;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<MetricDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.metricForm = this.fb.group({
      fileSystemType: [data.fileSystemType],
      alertType: [data.alertType],
      email: [data.email],
      slack: [data.slack],
      condition: [data.condition],
      threshold: [data.threshold],
      mountPath: [data.mountPath],
    });
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}

//search-app.component.ts
// search-app.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MetricDialogComponent } from '../metric-dialog/metric-dialog.component'; // Import the new component

// ... (rest of the component code)

  openDialog(row: any) {
    const dialogRef = this.dialog.open(MetricDialogComponent, {
      width: '500px',
      data: row,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updated metric:', result);
        // Implement service call to update data
      }
    });
  }

// ... (rest of the component code)
  // import the new component in the module.ts
  //
  //
  // update 7
// search-app.component.ts
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from '../app.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MetricDialogComponent } from '../metric-dialog/metric-dialog.component';
import { delay, of } from 'rxjs'; // Import delay and of for testing

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
  };
}

@Component({
  selector: 'app-search-app',
  templateUrl: './search-app.component.html',
  styleUrls: ['./search-app.component.css'],
})
export class SearchAppComponent {
  searchForm: FormGroup;
  searchResults: SearchResult | null = null;
  displayedColumns: string= ['fileSystemType', 'alertType', 'email', 'slack', 'condition', 'threshold', 'mountPath'];
  dataSource: MatTableDataSource<any>;
  isLoading = false; // Add loading indicator flag
  selectedIndex = 0; // Track selected tab

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private fb: FormBuilder, private appService: AppService, public dialog: MatDialog) {
    this.searchForm = this.fb.group({
      appId: ['', Validators.required],
      envType: ['', Validators.required],
    });
  }

  searchApp() {
    if (this.searchForm.valid) {
      this.isLoading = true; // Show loading indicator
      const appId = this.searchForm.value.appId;
      const envType = this.searchForm.value.envType;

      // Simulate service call (replace with actual service call)
      of(null)
        .pipe(delay(1000)) // Simulate 1 second delay
        .subscribe(() => {
          const mockResult: SearchResult = {
            appId: appId,
            envType: envType,
            metrics: [
              { fileSystemType: 'ext4', alertType: 'email', email: 'test1@example.com', condition: '>', threshold: 80, mountPath: '/data1' },
              { fileSystemType: 'xfs', alertType: 'slack', slack: 'slack-webhook-url1', condition: '<', threshold: 50, mountPath: '/logs1' },
              { fileSystemType: 'ext4', alertType: 'both', email: 'test2@example.com', slack: 'slack-webhook-url2', condition: '=', threshold: 90, mountPath: '/data2' },
              { fileSystemType: 'nfs', alertType: 'email', email: 'test3@example.com', condition: '>', threshold: 70, mountPath: '/data3' },
              { fileSystemType: 'xfs', alertType: 'slack', slack: 'slack-webhook-url3', condition: '<', threshold: 60, mountPath: '/logs3' },
            ],
          };

          console.log('Searching for app:', appId, envType);
          console.log('Mock search result:', mockResult);

          this.searchResults = mockResult;
          this.dataSource = new MatTableDataSource(this.searchResults.metrics);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.isLoading = false; // Hide loading indicator
          this.selectedIndex = 1; // Navigate to the second tab
        },
        (error) => {
          console.error('Error fetching data:', error);
          this.isLoading = false; // Hide loading indicator (even on error)
          // Handle the error appropriately (e.g., show a message to the user)
        });
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openDialog(row: any) {
    const dialogRef = this.dialog.open(MetricDialogComponent, {
      width: '500px',
      data: row,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Updated metric:', result);
        // Implement service call to update data
      }
    });
  }
}



/* update 9*/
// linux-path.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function linuxPathValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const path = control.value;
    if (!path) {
      return null; // Don't validate if the field is empty
    }

    // Basic Linux path validation regex
    const linuxPathRegex = /^(\/([a-zA-Z0-9_\-\.]+))*(\/?)$/;

    if (!linuxPathRegex.test(path)) {
      return { invalidLinuxPath: true };
    }

    return null;
  };
}



// metric-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { linuxPathValidator } from '../linux-path.validator'; // Import the custom validator

@Component({
  // ... component metadata
})
export class MetricDialogComponent implements OnInit {
  metricForm: FormGroup;
  isUpdate: boolean;
  originalData: any;

  constructor(
    public fb: FormBuilder,
    public dialogRef: MatDialogRef<MetricDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isUpdate = !!data;
    this.originalData = { ...data };
    this.metricForm = this.fb.group({
      fileSystemType: [data?.fileSystemType || '', Validators.required],
      alertType: [data?.alertType || '', Validators.required],
      email: [data?.email || ''],
      slack: [data?.slack || ''],
      condition: [data?.condition || '', Validators.required],
      threshold: [data?.threshold || '', [Validators.required, Validators.min(1), Validators.max(99)]],
      mountPath: [data?.mountPath || '', [Validators.required, linuxPathValidator()]], // Use the custom validator
    });
  }

  // ... rest of the component
}




// app-id.validator.ts
import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of, map, catchError, delay } from 'rxjs';
import { AppService } from './app.service'; // Import your AppService

export function appIdValidator(appService: AppService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const appId = control.value;

    if (!appId) {
      return of(null); // Don't validate if the field is empty
    }

    return appService.validateAppId(appId).pipe( // Use your AppService method
      map((isValid: boolean) => {
        return isValid ? null : { invalidAppId: true };
      }),
      catchError(() => of({ invalidAppId: true })), // Handle errors from the service
      delay(500) // Simulate delay from a real API call (optional)
    );
  };
}


// search-app.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppService } from './app.service';
import { appIdValidator } from './app-id.validator'; // Import the custom validator

@Component({
  // ... component metadata
})
export class SearchAppComponent {
  searchForm: FormGroup;
  searchResults: any;
  loadingSearch = false;

  constructor(private fb: FormBuilder, private appService: AppService) {
    this.searchForm = this.fb.group({
      appId: ['', [Validators.required], [appIdValidator(this.appService)]], // Use the custom validator
      envType: ['dev', Validators.required],
    });
  }

  // ... rest of the component
}

// app.service.ts
import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  validateAppId(appId: string): Observable<boolean> {
    // Simulate API call to validate app ID
    return of(appId === 'validAppId').pipe(delay(500)); // Replace with actual API call
  }
}
