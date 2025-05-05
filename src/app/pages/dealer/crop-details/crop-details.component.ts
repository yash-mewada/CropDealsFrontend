import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-crop-details',
  templateUrl: './crop-details.component.html',
  styleUrls: ['./crop-details.component.css'],
  imports: [CommonModule]
})
export class CropDetailsComponent implements OnInit {
  crop: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const cropId = this.route.snapshot.paramMap.get('id');
    // Ideally make an API call to fetch by ID. For now just simulate:
    this.crop = history.state.cropData || {}; // You can enhance this
  }

  buyNow(): void {
    alert("Buy Now clicked!");
  }
}
