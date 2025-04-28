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
  editMode = false;
  editForm: any = {};

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

  enableEdit() {
    this.editMode = true;
    this.editForm = {
      phoneNumber: this.profileData.phoneNumber || '',
      street: this.profileData.street || '',
      city: this.profileData.city || '',
      state: this.profileData.state || '',
      zipCode: this.profileData.zipCode || '',
      accountNumber: this.profileData.accountNumber || '',
      ifscCode: this.profileData.ifscCode || '',
      bankName: this.profileData.bankName || '',
      branchName: this.profileData.branchName || '',
    };
  }

  cancelEdit() {
    this.editMode = false;
    this.editForm = {};
  }

  updateProfile() {
    const token = localStorage.getItem('token');

    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You must be logged in to update profile.',
      });
      return;
    }

    this.http.put('http://localhost:5180/api/Account/update-profile', this.editForm, {
      headers: {
        Authorization: `Bearer ${token}`
      },
      responseType: 'text' as 'json'
    }).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Profile updated!',
        });
        this.editMode = false;
        this.fetchProfile(); // Reload latest profile
      },
      error: (error) => {
        console.error('Update failed', error);
        Swal.fire({
          icon: 'error',
          title: 'Update failed',
          text: 'Please try again.',
        });
      }
    });
  }
}
