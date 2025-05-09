import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-crop-details',
  templateUrl: './crop-details.component.html',
  styleUrls: ['./crop-details.component.css'],
  imports: [CommonModule]
})
export class CropDetailsComponent implements OnInit {
  crop: any;
  isLoading: boolean = true;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    const cropId = this.route.snapshot.paramMap.get('id');
    if (cropId) {
      this.fetchCropDetails(cropId);
    }
  }

  fetchCropDetails(cropId: string): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any>(`http://localhost:5180/api/CropListing/${cropId}/details`, { headers })
      .subscribe({
        next: (response) => {
          this.crop = response;
          this.isLoading = false;
        },
        error: (err) => {
          console.error("Failed to fetch crop details", err);
          this.isLoading = false;
        }
      });
  }

  buyNow(): void {
    alert(`You have initiated the purchase of ${this.crop.quantity} Kg of ${this.crop.cropName}.`);
  }
}
