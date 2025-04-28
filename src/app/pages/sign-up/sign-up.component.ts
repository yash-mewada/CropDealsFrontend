import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
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

  constructor(private authService: AuthService, private router: Router) {}

  onSignUp() {
    if (!this.name || !this.email || !this.password || !this.role) {
      Swal.fire({
        icon: 'warning',
        title: 'Incomplete Form',
        text: 'Please fill out all fields.',
      });
      return;
    }

    const signupData = {
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role,
    };

    this.authService.signUp(signupData)
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
