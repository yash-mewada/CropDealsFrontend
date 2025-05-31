import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  standalone: true,
  imports: [CommonModule]
})
export class NavbarComponent {
  userName = '';
  cropNotifications: { listingId: string; cropName: string }[] = [];
  showNotifications = false;
  seenListingIds: Set<string> = new Set();

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.userName = localStorage.getItem('userName') || '';
    this.fetchCropNotifications(); // Initial fetch
    setInterval(() => this.fetchCropNotifications(), 10000); // Poll every 10 sec
  }

  onLogout() {
    localStorage.clear();
    this.router.navigate(['/']);
  }

  toggleNotificationPanel() {
    this.showNotifications = !this.showNotifications;
  }

  goToDetails(listingId: string) {
    this.router.navigate(['/crop-details', listingId]);
    this.showNotifications = false;
  }

  fetchCropNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    this.http
      .get<any>('http://localhost:5180/api/Subscription/notifications', { headers })
      .subscribe((response) => {
        const values = response?.$values || [];

        // Filter only status 0 (available)
        const activeCrops = values.filter((item: any) => item.status === 0);

        // Update cropNotifications with only new & available crops
        activeCrops.forEach((item: any) => {
          if (!this.seenListingIds.has(item.listingId)) {
            this.cropNotifications.unshift({
              listingId: item.listingId,
              cropName: item.cropName
            });
            this.seenListingIds.add(item.listingId);
          }
        });

        // remove sold crops if they already exist
        this.cropNotifications = this.cropNotifications.filter((notif) =>
          activeCrops.some((crop: any) => crop.listingId === notif.listingId)
        );
        this.seenListingIds = new Set(this.cropNotifications.map(n => n.listingId));
      });
  }
}
