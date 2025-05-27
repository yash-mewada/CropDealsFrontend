import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Transaction {
  id: string;
  quantity: number;
  finalPricePerKg: number;
  totalPrice: number;
  createdAt: string;
  listing: {
    description: string;
    pricePerKg: number;
    quantity: number;
    imageBase64: string;
  };
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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
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

    convertToIST(dateStr: string): string {
    const utcDate = new Date(dateStr);
    const istOffset = 5.5 * 60; // IST is UTC+5:30
    const istTime = new Date(utcDate.getTime() + istOffset * 60000);
    return istTime.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour12: true,
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
