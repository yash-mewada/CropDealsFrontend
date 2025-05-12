import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-page',
  templateUrl: './payment-page.component.html',
  styleUrls: ['./payment-page.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PaymentPageComponent implements OnInit {
  crop: any;
  quantity: number = 1;
  totalPrice: number = 0;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
  const stateData = history.state;
  this.crop = stateData.cropData;

  if (!this.crop) {
    this.router.navigate(['/']);
  } else {
    console.log(this.crop.listingId); // ✅ This should be the correct ID
    this.totalPrice = this.crop.pricePerKg * this.quantity;
    this.isLoading = false;
  }
}



  updateTotalPrice(): void {
    this.totalPrice = this.crop.pricePerKg * this.quantity;
  }

  initiatePayment(): void {
    if (this.quantity > this.crop.quantity) {
      Swal.fire('Error', 'Quantity exceeds available stock.', 'error');
      return;
    }

    // Check for token presence
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'You are not authenticated. Please log in.', 'error');
      return;
    }

    // Payload for the transaction
    const payload = {
      listingId: this.crop.listingId,
      quantity: this.quantity,
      finalPricePerKg: this.crop.pricePerKg
    };

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.post('http://localhost:5180/api/Transaction', payload, {
  headers,
  responseType: 'text' // <-- Accepts plain text response
}).subscribe({
  next: (response: any) => {
    console.log("Transaction Response: ", response);
    Swal.fire('Success', response, 'success');
  },
  error: (error) => {
    console.error("Transaction Error: ", error);
    Swal.fire('Error', 'Transaction failed.', 'error');
  }
});

  }
}
