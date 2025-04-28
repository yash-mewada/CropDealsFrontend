import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HttpClientModule],
  templateUrl: './sign-up.component.html',
})
export class SignUpComponent {
  name = '';
  email = '';
  password = '';
  role = '';

  constructor(private router: Router, private http: HttpClient) {}

  onSignUp() {
    // Form validation
    if (!this.name || !this.email || !this.password || !this.role) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all fields.',
      });
      return;
    }

    // Create the request payload
    const signupData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    };

    // Send the HTTP POST request
    this.http.post('http://localhost:5180/api/Account/register', signupData, { responseType: 'text' })
      .subscribe({
        next: (response: string) => {
          Swal.fire({
            icon: 'success',
            title: 'Registration Successful',
            text: response,
            confirmButtonText: 'Sign In',
          }).then(() => {
            this.router.navigate(['/signin']);
          });
        },
        error: (error) => {
          console.error('Registration error:', error);

          let errorMessage = 'Something went wrong. Please try again.';
          
          if (error.error && typeof error.error === 'string') {
            errorMessage = error.error; 
          } else if (error.error?.message) {
            errorMessage = error.error.message; 
          }

          Swal.fire({
            icon: 'error',
            title: 'Registration Failed',
            text: errorMessage,
          });
        }
      });
  }

  goToSignIn() {
    this.router.navigate(['/signin']);
  }
}
