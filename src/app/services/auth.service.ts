import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5180/api';

  constructor(private http: HttpClient) {}

  signIn(credentials: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.baseUrl}/Auth/signin`, credentials);
  }

  signUp(signupData: { name: string; email: string; password: string; role: string }): Observable<string> {
    return this.http.post(`${this.baseUrl}/Account/register`, signupData, { responseType: 'text' });
  }
}
