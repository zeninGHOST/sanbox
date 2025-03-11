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