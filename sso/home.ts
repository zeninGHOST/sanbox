import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular'; // Import MsalService
import { AccountInfo } from '@azure/msal-browser'; // Import AccountInfo

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  currentUser: AccountInfo | null = null; // To store user account info

  constructor(private authService: MsalService) { }

  ngOnInit(): void {
    // Get the currently active account
    this.currentUser = this.authService.instance.getActiveAccount();
    console.log('Current user in Home:', this.currentUser);
  }

}

