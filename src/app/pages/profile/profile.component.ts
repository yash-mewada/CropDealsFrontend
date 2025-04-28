import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  profileData: any = null;
  loading = true;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProfile();
  }

  fetchProfile() {
    const token = localStorage.getItem('token');
  
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You must be logged in to view profile.',
      });
      return;
    }
  
    this.http.get<any>('http://localhost:5180/api/Account/profile', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (response) => {
        console.log('Profile loaded:', response);
        this.profileData = response;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load profile', error);
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Failed to load profile',
          text: 'Please try again later.',
        });
      }
    });
  }
  
}
