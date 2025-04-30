import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crops',
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CropsComponent implements OnInit {
  crops: any[] = [];
  currentPage = 1;
  itemsPerPage = 10;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCrops();
  }

  openAddCropModal(): void {
    Swal.fire({
      title: 'Add Crop',
      html: `
        <style>
          #cropName::placeholder {
            color: #666 !important;
            opacity: 1;
          }
        </style>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
          <input 
            id="cropName" 
            class="swal2-input" 
            style="width: 300px; color: #333333; background-color: #f4f4f4; border: 1px solid #ccc; font-weight: bold; padding: 10px;" 
            placeholder="Crop Name" 
            required
          >
          <select 
            id="cropType" 
            class="swal2-input" 
            style="width: 300px; color: #333333; background-color: #f4f4f4; border: 1px solid #ccc; font-weight: bold; padding: 10px;"
          >
            <option value="0">Fruits</option>
            <option value="1">Vegetables</option>
            <option value="2">Grains</option>
          </select>
        </div>
      `,


      preConfirm: () => {
        const name = (document.getElementById('cropName') as HTMLInputElement).value.trim();
        const typeString = (document.getElementById('cropType') as HTMLSelectElement).value;
        const type = parseInt(typeString, 10);

        if (!name) {
          Swal.showValidationMessage('Crop name is required');
          return;
        }

        return { name, type };
      },
      showCancelButton: true,
      confirmButtonText: 'Add',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = result.value;

        this.http.post('http://localhost:5180/api/Crop', payload).subscribe({
          next: () => {
            Swal.fire('Success', 'Crop added successfully', 'success');
            this.fetchCrops();
          },
          error: (error) => {
            console.error('Error response:', error);
            Swal.fire('Error', 'Failed to add crop', 'error');
          },
        });
      }
    });
  }

  fetchCrops(): void {
    this.http.get<any>('http://localhost:5180/api/Crop/admin-crops').subscribe({
      next: (res) => {
        this.crops = res.$values || [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to fetch crops', 'error');
      },
    });
  }

  get paginatedCrops(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.crops.slice(start, start + this.itemsPerPage);
  }

  totalPages(): number {
    return Math.ceil(this.crops.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    this.currentPage = page;
  }

  deleteCrop(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this crop?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:5180/api/Crop/${id}`, { responseType: 'text' }).subscribe({
          next: (res) => {
            Swal.fire('Deleted', res || 'Crop deleted successfully', 'success');
            this.fetchCrops(); // refreshes the list immediately
          },
          error: (err) => {
            const message = err.error || 'Crop not found or failed to delete.';
            Swal.fire('Error', message, 'error');
            this.fetchCrops(); // still refresh to show latest state
          },
        });
      }
    });
  }
  
}
