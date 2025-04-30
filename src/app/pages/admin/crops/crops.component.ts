import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crops',
  templateUrl: './crops.component.html',
  styleUrls: ['./crops.component.css'],
  standalone: true,
})
export class CropsComponent {
  constructor(private http: HttpClient) {}

  openAddCropModal(): void {
    Swal.fire({
      title: 'Add Crop',
      html: `
        <input id="cropName" class="swal2-input" placeholder="Crop Name" required>
        <select id="cropType" class="swal2-input">
          <option value="0">Fruits</option>
          <option value="1">Vegetables</option>
          <option value="2">Grains</option>
        </select>
      `,
      preConfirm: () => {
        const name = (document.getElementById('cropName') as HTMLInputElement).value.trim();
        const typeString = (document.getElementById('cropType') as HTMLSelectElement).value;
        const type = parseInt(typeString, 10); // Parse as number

        if (!name) {
          Swal.showValidationMessage('Crop name is required');
          return;
        }

        return { name, type };
      },
      showCancelButton: true,
      confirmButtonText: 'Add'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const payload = result.value;

        this.http.post('http://localhost:5180/api/Crop', payload).subscribe({
          next: () => {
            Swal.fire('Success', 'Crop added successfully', 'success');
          },
          error: (error) => {
            console.error('Error response:', error);
            Swal.fire('Error', 'Failed to add crop', 'error');
          }
        });
      }
    });
  }
}
