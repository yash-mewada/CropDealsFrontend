import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

interface Transaction {
  id: string;
  cropName: string;
  description: string;
  imageBase64: string;
  quantity: number;
  finalPricePerKg: number;
  totalPrice: number;
  createdAt: string;
  updatedAt: string;
  farmerName: string;
  dealerName: string;
  status: number;
}

interface Review {
  transactionId: string;
  rating: number;
  comment: string;
}

@Component({
  selector: 'app-my-transactions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './my-transactions.component.html',
  styleUrls: ['./my-transactions.component.css']
})
export class MyTransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  dealerReviews: Review[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.loadTransactions();
    this.loadDealerReviews();
  }

  loadTransactions(): void {
    const token = localStorage.getItem('token');
    this.http.get<any>('http://localhost:5180/api/Transaction/dealer', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe({
      next: (res) => {
        this.transactions = res?.$values ?? [res];
      },
      error: (err) => {
        console.error('Failed to fetch transactions', err);
      }
    });
  }

  loadDealerReviews(): void {
    const token = localStorage.getItem('token');
    this.http.get<any>('http://localhost:5180/api/Review/my-reviews', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).subscribe(response => {
      this.dealerReviews = response?.$values ?? [];
    });
  }

  convertToIST(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusLabel(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'Completed';
      case 2: return 'Cancelled';
      default: return 'Unknown';
    }
  }

  hasReviewed(transactionId: string): boolean {
    return this.dealerReviews.some(r => r.transactionId === transactionId);
  }

  getStarArray(transactionId: string): boolean[] {
    const review = this.dealerReviews.find(r => r.transactionId === transactionId);
    const rating = review?.rating || 0;
    return Array.from({ length: 5 }, (_, i) => i < rating);
  }

  generateInvoice(tx: Transaction): void {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor('#2e7d32');
    doc.text('Crop Transaction Invoice', 14, 20);

    doc.setDrawColor('#2e7d32');
    doc.line(14, 22, 196, 22);

    doc.setFontSize(12);
    doc.setTextColor(50);
    const now = new Date().toISOString();
    doc.text(`Generated on: ${this.convertToIST(now)}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [['Field', 'Details']],
      body: [
        ['Transaction ID', tx.id],
        ['Crop Name', tx.cropName],
        ['Description', tx.description],
        ['Farmer Name', tx.farmerName],
        ['Dealer Name', tx.dealerName],
        ['Quantity (kg)', `${tx.quantity}`],
        ['Price per Kg Rs.', `${tx.finalPricePerKg}`],
        ['Total Price Rs.', `${tx.totalPrice}`],
        ['Status', this.getStatusLabel(tx.status)],
        ['Created At', this.convertToIST(tx.createdAt)],
        ['Updated At', this.convertToIST(tx.updatedAt)],
      ],
      styles: {
        fontSize: 11,
        cellPadding: 4,
        halign: 'left',
      },
      headStyles: {
        fillColor: [46, 125, 50],
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fillColor: [245, 255, 245],
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: '#2e7d32' },
      },
    });

    doc.save(`Invoice-${tx.cropName}-${tx.id}.pdf`);
  }

  addReview(transactionId: string): void {
    const token = localStorage.getItem('token');
    if (!token) {
      Swal.fire('Error', 'Please log in to leave a review.', 'error');
      return;
    }

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
            next: () => {
              Swal.fire('Thanks!', 'Your review has been submitted.', 'success');
              this.loadDealerReviews(); // Refresh reviews
            },
            error: (err) => {
              console.error("Review Error:", err);
              Swal.fire('Error', 'Failed to submit review.', 'error');
            }
          });
      }
    });
  }
}
