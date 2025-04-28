import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; 
import Swal from 'sweetalert2'; 

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent {
  email = '';
  password = '';

  constructor(private http: HttpClient, private router: Router) {}

  onSignIn() {
    const url = 'http://localhost:5180/api/Auth/signin';

    this.http.post<{ token: string }>(url, {
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        console.log('Received token:', response.token);
        localStorage.setItem('token', response.token);

        // Decode the token to get username or email
        const decodedToken: any = jwtDecode(response.token);
        console.log('Decoded Token:', decodedToken);

        const userName =
          decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
          decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
          'Unknown User';

        const role =
          decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'No Role';

        localStorage.setItem('userName', userName);
        localStorage.setItem('role', role);

        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login failed', err);

        let errorMessage = 'Login failed! Check your email and password.';

        if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.error?.message) {
          errorMessage = err.error.message;
        }

        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: errorMessage,
        });
      }
    });
  }
}
