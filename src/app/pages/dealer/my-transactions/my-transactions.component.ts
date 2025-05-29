import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

  generateInvoice(tx: Transaction): void {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor('#2e7d32'); // Dark Green
    doc.text('Crop Transaction Invoice', 14, 20);

    // Horizontal Line
    doc.setDrawColor('#2e7d32');
    doc.line(14, 22, 196, 22);

    // Generated On
    doc.setFontSize(12);
    doc.setTextColor(50);
    const now = new Date().toISOString();
    doc.text(`Generated on: ${this.convertToIST(now)}`, 14, 30);

    // Table
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
        ['Price per Kg (₹)', `₹${tx.finalPricePerKg}`],
        ['Total Price (₹)', `₹${tx.totalPrice}`],
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
        fillColor: [46, 125, 50], // Green header
        textColor: 255,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fillColor: [245, 255, 245], // Light green tint
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
}
