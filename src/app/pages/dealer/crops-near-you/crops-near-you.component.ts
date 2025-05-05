import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crops-near-you',
  templateUrl: './crops-near-you.component.html',
  styleUrls: ['./crops-near-you.component.css'],
  imports: [CommonModule]
})
export class CropsNearYouComponent implements OnInit {
  crops: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<any>('http://localhost:5180/api/CropListing/by-location', { headers })
      .subscribe(response => {
        this.crops = response.$values || [];
      });
  }

  viewCropDetails(cropId: string) {
    this.router.navigate(['/crop-details', cropId]);
  }
}
