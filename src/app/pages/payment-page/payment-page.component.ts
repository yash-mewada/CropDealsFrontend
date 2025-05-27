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
    console.log(this.crop.listingId); 
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

  const token = localStorage.getItem('token');
  if (!token) {
    Swal.fire('Error', 'You are not authenticated. Please log in.', 'error');
    return;
  }

  const payload = {
    listingId: this.crop.listingId,
    quantity: this.quantity,
    finalPricePerKg: this.crop.pricePerKg
  };

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  this.http.post<any>('http://localhost:5180/api/Transaction', payload, {
    headers,
  }).subscribe({
    next: (response) => {
      console.log("Transaction Response: ", response);
      
      // Show success and then review prompt
      Swal.fire({
        title: 'Payment Successful!',
        text: 'Would you like to rate the farmer?',
        icon: 'success',
        showCancelButton: true,
        confirmButtonText: 'Yes, leave a review',
        cancelButtonText: "I'll do it later"
      }).then(result => {
        if (result.isConfirmed) {
          this.promptReviewModal(response.id, token);
        } else {
          this.router.navigate(['/home']);
        }
      });
    },
    error: (error) => {
      console.error("Transaction Error: ", error);
      Swal.fire('Error', 'Transaction failed.', 'error');
    }
  });
}

promptReviewModal(transactionId: string, token: string): void {
  Swal.fire({
    title: 'Rate the Farmer',
    html: `
      <div id="star-rating" style="font-size: 24px; margin-bottom: 10px;">
        <i class="fa fa-star" data-value="1"></i>
        <i class="fa fa-star" data-value="2"></i>
        <i class="fa fa-star" data-value="3"></i>
        <i class="fa fa-star" data-value="4"></i>
        <i class="fa fa-star" data-value="5"></i>
      </div>
      <textarea id="review-comment" class="swal2-textarea" placeholder="Write your feedback..."></textarea>
    `,
    showCancelButton: true,
    confirmButtonText: 'Submit Review',
    cancelButtonText: "I'll do it later",
    didOpen: () => {
      const stars = Swal.getPopup()!.querySelectorAll<HTMLElement>('#star-rating i');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          const rating = parseInt(star.getAttribute('data-value')!);
          stars.forEach((s, i) => {
            s.classList.toggle('text-warning', i < rating);
          });
          (Swal as any).rating = rating;
        });
      });
    },
    preConfirm: () => {
      const rating = (Swal as any).rating || 0;
      const comment = (document.getElementById('review-comment') as HTMLTextAreaElement).value;
      if (rating === 0) {
        Swal.showValidationMessage('Please select a star rating');
        return false;
      }
      return { rating, comment };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      const { rating, comment } = result.value;

      const headers = new HttpHeaders()
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json');

      const reviewPayload = {
        transactionId,
        rating,
        comment
      };

      this.http.post('http://localhost:5180/api/Review', reviewPayload, { headers, responseType: 'text' })
        .subscribe({
          next: (res) => {
            Swal.fire('Thanks!', 'Your review has been submitted.', 'success').then(() => {
              this.router.navigate(['/home']);
            });
          },
          error: (err) => {
            console.error("Review Error:", err);
            Swal.fire('Error', 'Failed to submit review.', 'error');
          }
        });
    } else {
      this.router.navigate(['/home']);
    }
  });
}

}
