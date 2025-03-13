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