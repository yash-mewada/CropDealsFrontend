import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crop-listing',
  templateUrl: './crop-listing.component.html',
  styleUrls: ['./crop-listing.component.css']
})
export class CropListingComponent implements OnInit {
  crops: any[] = [];
  filteredCrops: any[] = [];
  selectedType: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCrops();
  }

  fetchCrops(): void {
    this.http.get<any>('http://localhost:5180/api/Crop/admin-crops').subscribe({
      next: (res) => {
        this.crops = res.$values || [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to fetch crops', 'error');
      }
    });
  }

  openAddListingModal(): void {
    const cropTypes = ['Fruit', 'Vegetable', 'Grain'];

    Swal.fire({
      title: 'Post a Crop',
      html: `
  <style>
    .swal2-input, .swal2-textarea, .swal2-file, select.swal2-input {
      width: 300px;
      color: #333333;
      background-color: #f4f4f4;
      border: 1px solid #ccc;
      font-weight: bold;
      padding: 10px;
    }

    .swal2-textarea::placeholder,
    .swal2-input::placeholder {
      color: #666 !important;
      opacity: 1;
    }
  </style>

  <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
    <select id="cropType" class="swal2-input">
      <option value="" disabled selected>Select Crop Type</option>
      ${cropTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
    </select>

    <select id="cropName" class="swal2-input">
      <option value="" disabled selected>Select Crop Name</option>
    </select>

    <input id="pricePerKg" type="number" class="swal2-input" placeholder="Price per Kg">
    <input id="quantity" type="number" class="swal2-input" placeholder="Quantity (Kg)">
    <textarea id="description" class="swal2-textarea" placeholder="Description"></textarea>
    <input id="imageUpload" type="file" class="swal2-file" accept="image/*">
  </div>
`,

      didOpen: () => {
        const cropTypeSelect = document.getElementById('cropType') as HTMLSelectElement;
        const cropNameSelect = document.getElementById('cropName') as HTMLSelectElement;

        cropTypeSelect.addEventListener('change', () => {
          const selectedType = cropTypeSelect.value;
          const filtered = this.crops.filter(c => c.type === selectedType);

          cropNameSelect.innerHTML = '<option value="" disabled selected>Select Crop Name</option>';
          filtered.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.text = c.name;
            cropNameSelect.appendChild(option);
          });
        });
      },
      preConfirm: async () => {
        const cropId = (document.getElementById('cropName') as HTMLSelectElement).value;
        const pricePerKg = +(document.getElementById('pricePerKg') as HTMLInputElement).value;
        const quantity = +(document.getElementById('quantity') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const imageInput = document.getElementById('imageUpload') as HTMLInputElement;
        const file = imageInput.files?.[0];

        if (!cropId || !pricePerKg || !quantity || !description || !file) {
          Swal.showValidationMessage('Please fill all fields and upload an image.');
          return;
        }

        const base64 = await this.convertToBase64(file);
        return { cropId, pricePerKg, quantity, description, imageBase64: base64, status: 0 };
      },
      confirmButtonText: 'Post',
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.http.post('http://localhost:5180/api/CropListing', result.value).subscribe({
          next: () => {
            Swal.fire('Success', 'Crop listing posted!', 'success');
          },
          error: () => {
            Swal.fire('Error', 'Failed to post crop listing', 'error');
          }
        });
      }
    });
  }

  convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }
}
