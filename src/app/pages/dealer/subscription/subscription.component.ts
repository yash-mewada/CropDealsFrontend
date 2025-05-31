import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  styleUrls: ['./subscription.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SubscriptionComponent implements OnInit {
  crops: any[] = [];
  subscriptions: any[] = [];
  token = localStorage.getItem('token') || '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadCrops();
    this.loadSubscriptions();
  }

  getAuthHeaders() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`
      })
    };
  }

  loadCrops() {
    this.http.get<any>('http://localhost:5180/api/Crop/admin-crops', this.getAuthHeaders())
      .subscribe(res => {
        this.crops = res.$values;
      });
  }

  loadSubscriptions() {
    this.http.get<any>('http://localhost:5180/api/Subscription', this.getAuthHeaders())
      .subscribe(res => {
        this.subscriptions = res.$values;
      });
  }

  isSubscribed(cropId: string): boolean {
    return this.subscriptions.some(s => s.cropId === cropId);
  }

  getSubscriptionId(cropId: string): string | null {
    const sub = this.subscriptions.find(s => s.cropId === cropId);
    return sub ? sub.id : null;
  }

  subscribe(cropId: string) {
    this.http.post('http://localhost:5180/api/Subscription', { cropId }, this.getAuthHeaders())
      .subscribe(() => {
        this.loadSubscriptions();
      });
  }

  unsubscribe(subscriptionId: string) {
    this.http.delete(`http://localhost:5180/api/Subscription/${subscriptionId}`, this.getAuthHeaders())
      .subscribe(() => {
        this.loadSubscriptions();
      });
  }
}
