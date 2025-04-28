import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // ✅ Import Router

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  userName: string = '';

  constructor(private router: Router) {} 

  ngOnInit() {
    this.userName = localStorage.getItem('userName') || 'Guest';
  }

  goToProfile() {
    this.router.navigate(['/profile']); 
  }

  onLogout() {
    localStorage.clear();
    this.router.navigate(['/signin']); 
  } 
}
