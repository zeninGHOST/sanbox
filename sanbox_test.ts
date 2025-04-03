//app.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { AppService } from './app.service';
import { of, throwError } from 'rxjs';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AppService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true for a valid App ID', (done) => {
    // Mock the service response
    spyOn(service, 'validateAppId').and.returnValue(of({ valid: true, message: '' }));

    service.validateAppId('validAppId').subscribe((response) => {
      expect(response.valid).toBe(true);
      done();
    });
  });

  it('should return false for an invalid App ID', (done) => {
    // Mock the service response
    spyOn(service, 'validateAppId').and.returnValue(of({ valid: false, message: 'App ID not found.' }));

    service.validateAppId('invalidAppId').subscribe((response) => {
      expect(response.valid).toBe(false);
      expect(response.message).toBe('App ID not found.');
      done();
    });
  });

  it('should handle service errors', (done) => {
    // Mock the service to throw an error
    spyOn(service, 'validateAppId').and.returnValue(throwError(() => new Error('Service error')));

    service.validateAppId('test').subscribe(
      () => {},
      (error) => {
        expect(error.message).toBe('Service error');
        done();
      }
    );
  });
});



//app.component.spec.ts

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AppService } from './app.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let appService: AppService;

  beforeEach(() => {
    const appServiceSpy = jasmine.createSpyObj('AppService', ['submitForm']);

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatChipsModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: AppService, useValue: appServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    appService = TestBed.inject(AppService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with correct controls', () => {
    expect(component.appForm.contains('appId')).toBeTrue();
    expect(component.appForm.get('appId')?.value).toBe('');
    expect(component.appForm.get('appId')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('should add a mount path', () => {
    const initialLength = component.mountPathsFormArray.length;
    component.add({ input: { value: '' } as any, value: 'test/path' });
    expect(component.mountPathsFormArray.length).toBe(initialLength + 1);
    expect(component.mountPathsFormArray.at(initialLength).value).toBe('test/path');
  });

  it('should remove a mount path', () => {
    component.add({ input: { value: '' } as any, value: 'test/path' });
    const initialLength = component.mountPathsFormArray.length;
    component.remove(0);
    expect(component.mountPathsFormArray.length).toBe(initialLength - 1);
  });

  it('should submit the form successfully', () => {
    const submitFormSpy = spyOn(component, 'onSubmit').and.callThrough();
    component.appForm.setValue({
      appId: 'testApp',
      envType: 'dev',
      fileSystemType: 'ext4',
      alertType: 'email',
      email: 'test@example.com',
      condition: '>',
      threshold: 50,
    });
    component.add({ input: { value: '' } as any, value: 'test/path' });
    fixture.detectChanges();
    const submitButton = fixture.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    expect(submitFormSpy).toHaveBeenCalledTimes(1);
  });

  it('should call the service with the correct data', () => {
    const appServiceSpy = TestBed.inject(AppService);
    component.appForm.setValue({
      appId: 'testApp',
      envType: 'dev',
      fileSystemType: 'ext4',
      alertType: 'email',
      email: 'test@example.com',
      condition: '>',
      threshold: 50,
    });
    component.add({ input: { value: '' } as any, value: 'test/path' });
    fixture.detectChanges();
    component.onSubmit();
    expect(appServiceSpy.submitForm).toHaveBeenCalledWith({
      appId: 'testApp',
      envType: 'dev',
      fileSystemType: 'ext4',
      alertType: 'email',
      email: 'test@example.com',
      condition: '>',
      threshold: 50,
      mountPaths: ['test/path'],
    });
  });

  it('should reset the form after successful submission', () => {
    const appServiceSpy = TestBed.inject(AppService);
    appServiceSpy.submitForm.and.returnValue(of(null)); // Mock successful response
    component.appForm.setValue({
      appId: 'testApp',
      envType: 'dev',
      fileSystemType: 'ext4',
      alertType: 'email',
      email: 'test@example.com',
      condition: '>',
      threshold: 50,
    });
    component.add({ input: { value: '' } as any, value: 'test/path' });
    fixture.detectChanges();
    component.onSubmit();
    expect(component.appForm.value).toEqual({
      appId: '',
      envType: '',
      fileSystemType: '',
      alertType: '',
      email: '',
      condition: '',
      threshold: '',
    });
  });

  it('should handle service errors', () => {
    const appServiceSpy = TestBed.inject(AppService);
    appServiceSpy.submitForm.and.returnValue(throwError(() => new Error('Service error'))); // Mock error
    component.appForm.setValue({
      appId: 'testApp',
      envType: 'dev',
      fileSystemType: 'ext4',
      alertType: 'email',
      email: 'test@example.com',
      condition: '>',
      threshold: 50,
    });
    component.add({ input: { value: '' } as any, value: 'test/path' });
    fixture.detectChanges();
    component.onSubmit();
    expect(console.error).toHaveBeenCalledWith('Error submitting form:', new Error('Service error'));
  });
});


//search-app.component.spec.ts
//

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { AppService } from '../app.service';
import { SearchAppComponent } from './search-app.component';
import { MetricDialogComponent } from '../metric-dialog/metric-dialog.component';

describe('SearchAppComponent', () => {
  let component: SearchAppComponent;
  let fixture: ComponentFixture<SearchAppComponent>;
  let appService: AppService;
  let dialog: MatDialog;

  const mockSearchResult = {
    appId: 'testApp',
    envType: 'dev',
    metrics: [
      { fileSystemType: 'ext4', alertType: 'email', email: 'test@example.com', condition: '>', threshold: 80, mountPath: '/data' },
    ],
  };

  beforeEach(() => {
    const appServiceSpy = jasmine.createSpyObj('AppService', ['searchApp']);

    TestBed.configureTestingModule({
      declarations: [SearchAppComponent, MetricDialogComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatTableModule,
        MatPaginatorModule,
        MatDialogModule,
        BrowserAnimationsModule,
      ],
      providers: [{ provide: AppService, useValue: appServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchAppComponent);
    component = fixture.componentInstance;
    appService = TestBed.inject(AppService);
    dialog = TestBed.inject(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with correct controls', () => {
    expect(component.searchForm.contains('appId')).toBeTrue();
    expect(component.searchForm.get('appId')?.value).toBe('');
    expect(component.searchForm.get('appId')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('should call the service with the correct parameters', () => {
    const searchAppSpy = spyOn(component, 'searchApp').and.callThrough();
    component.searchForm.setValue({ appId: 'testApp', envType: 'dev' });
    fixture.detectChanges();
    const searchButton = fixture.nativeElement.querySelector('button');
    searchButton.click();
    expect(searchAppSpy).toHaveBeenCalledTimes(1);
  });

  it('should populate searchResults and dataSource correctly', () => {
    const appServiceSpy = TestBed.inject(AppService);
    appServiceSpy.searchApp.and.returnValue(of(mockSearchResult));
    component.searchForm.setValue({ appId: 'testApp', envType: 'dev' });
    fixture.detectChanges();
    component.searchApp();
    expect(component.searchResults).toEqual(mockSearchResult);
    expect(component.dataSource.data).toEqual(mockSearchResult.metrics);
  });

  it('should handle service errors', () => {
    const appServiceSpy = TestBed.inject(AppService);
    appServiceSpy.searchApp.and.returnValue(throwError(() => new Error('Service error')));
    component.searchForm.setValue({ appId: 'testApp', envType: 'dev' });
    fixture.detectChanges();
    component.searchApp();
    expect(console.error).toHaveBeenCalledWith('Error fetching data:', new Error('Service error'));
  });

  it('should filter the table data correctly', () => {
    component.searchResults = mockSearchResult;
    component.dataSource = new MatTableDataSource(component.searchResults.metrics);
    fixture.detectChanges();
    const filterInput = fixture.nativeElement.querySelector('input[placeholder="Filter"]');
    filterInput.value = 'ext4';
    filterInput.dispatchEvent(new Event('input'));
    expect(component.dataSource.filter).toBe('ext4');
  });

  it('should open the dialog with the correct data', () => {
    const dialogSpy = spyOn(dialog, 'open').and.returnValue({ afterClosed: of(null) } as any);
    component.searchResults = mockSearchResult;
    component.dataSource = new MatTableDataSource(component.searchResults.metrics);
    fixture.detectChanges();
    component.openDialog(mockSearchResult.metrics[0]);
    expect(dialogSpy).toHaveBeenCalledWith(MetricDialogComponent, {
      width: '500px',
      data: mockSearchResult.metrics[0],
    });
  });

  it('should handle dialog close events', () => {
    const dialogSpy = spyOn(dialog, 'open').and.returnValue({ afterClosed: of({ fileSystemType: 'xfs' }) } as any);
    component.searchResults = mockSearchResult;
    component.dataSource = new MatTableDataSource(component.searchResults.metrics);
    fixture.detectChanges();
    component.openDialog(mockSearchResult.metrics[0]);
    expect(console.log).toHaveBeenCalledWith('Updated metric:', { fileSystemType: 'xfs' });
  });
});




//metric-dialog.component.spec.ts
//



import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MetricDialogComponent } from './metric-dialog.component';

describe('MetricDialogComponent', () => {
  let component: MetricDialogComponent;
  let fixture: ComponentFixture<MetricDialogComponent>;
  const mockDialogRef = { close: jasmine.createSpy('close') };
  const mockData = {
    fileSystemType: 'ext4',
    alertType: 'email',
    email: 'test@example.com',
    condition: '>',
    threshold: 80,
    mountPath: '/data',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MetricDialogComponent],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        BrowserAnimationsModule,
        MatDialogModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MetricDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with correct controls and values', () => {
    expect(component.metricForm.contains('fileSystemType')).toBeTrue();
    expect(component.metricForm.get('fileSystemType')?.value).toBe('ext4');
    expect(component.metricForm.get('fileSystemType')?.hasValidator(Validators.required)).toBeTrue();
  });

  it('should close the dialog without returning data on cancel', () => {
    component.onCancelClick();
    expect(mockDialogRef.close).toHaveBeenCalledTimes(1);
    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });

  it('should detect changes in the form values', () => {
    expect(component.hasChanges()).toBeFalse(); // Initially, no changes
    component.metricForm.get('fileSystemType')?.setValue('xfs');
    expect(component.hasChanges()).toBeTrue(); // After changing a value
  });
});




