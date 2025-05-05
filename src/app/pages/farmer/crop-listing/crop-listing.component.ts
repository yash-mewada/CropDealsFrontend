import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crop-listing',
  templateUrl: './crop-listing.component.html',
  styleUrls: ['./crop-listing.component.css'],
  imports: [CommonModule]
})
export class CropListingComponent implements OnInit {
  crops: any[] = [];
  myListings: any[] = [];
  selectedType: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCrops();
    this.fetchMyListings();
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

  fetchMyListings(): void {
    this.http.get<any>('http://localhost:5180/api/CropListing/my-listings').subscribe({
      next: (res) => {
        this.myListings = res.$values || [];
      },
      error: () => {
        Swal.fire('Error', 'Failed to fetch your listings', 'error');
      }
    });
  }

  openAddListingModal(): void {
    const cropTypes = ['Fruit', 'Vegetable', 'Grain'];
  
    Swal.fire({
      title: 'Post a Crop',
      html: `
        <style>
          .custom-swal-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 350px;
            margin: auto;
            font-family: 'Segoe UI', sans-serif;
          }
  
          .form-group {
            display: flex;
            flex-direction: column;
          }
  
          .form-group label {
            font-weight: 600;
            margin-bottom: 6px;
            font-size: 14px;
            color: #2c3e50;
          }
  
          .form-group select,
          .form-group input[type="number"],
          .form-group textarea,
          .form-group input[type="file"] {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 6px;
            background-color: #f9f9f9;
            width: 100%;
            box-sizing: border-box;
          }
  
          .form-group textarea {
            resize: vertical;
            min-height: 80px;
          }
  
          .form-group input[type="file"] {
            padding: 6px;
            background-color: #fff;
          }
  
          .form-group input[type="file"]::-webkit-file-upload-button {
            padding: 6px 12px;
            border: none;
            background-color: #007bff;
            color: white;
            border-radius: 4px;
            cursor: pointer;
          }
  
          .form-group input[type="file"]::-webkit-file-upload-button:hover {
            background-color: #0056b3;
          }
        </style>
  
        <div class="custom-swal-form">
          <div class="form-group">
            <label for="cropType">Crop Type</label>
            <select id="cropType">
              <option value="" disabled selected>Select Crop Type</option>
              ${cropTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
            </select>
          </div>
  
          <div class="form-group">
            <label for="cropName">Crop Name</label>
            <select id="cropName">
              <option value="" disabled selected>Select Crop Name</option>
            </select>
          </div>
  
          <div class="form-group">
            <label for="pricePerKg">Price per Kg</label>
            <input id="pricePerKg" type="number">
          </div>
  
          <div class="form-group">
            <label for="quantity">Quantity (Kg)</label>
            <input id="quantity" type="number">
          </div>
  
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description"></textarea>
          </div>
  
          <div class="form-group">
            <label for="imageUpload">Upload Image</label>
            <input id="imageUpload" type="file" accept="image/*">
          </div>
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
            this.fetchMyListings();
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

  showCropDetails(crop: any): void {
    Swal.fire({
      title: crop.cropName,
      html: `
        <div style="text-align: center;">
          <img src="${crop.imageBase64}" style="width: 80%; height: auto; border-radius: 8px; margin-bottom: 10px;" alt="Crop Image" />
        </div>
        <div style="padding: 10px;">
          <p><strong>Price:</strong> ₹${crop.pricePerKg}/Kg</p>
          <p><strong>Quantity:</strong> ${crop.quantity} Kg</p>
          <p><strong>Description:</strong> ${crop.description}</p>
          <p><strong>Status:</strong> ${crop.status === 0 ? 'Available' : 'Sold'}</p>
          <p><strong>Posted On:</strong> ${new Date(crop.createdAt).toLocaleDateString()}</p>
        </div>
      `,
      confirmButtonText: 'Close',
      showCloseButton: true,
      customClass: {
        popup: 'swal-modal-custom',
        confirmButton: 'swal-confirm-btn',
      }
    });
  }
  
  

  deleteListing(id: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This crop listing will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`http://localhost:5180/api/CropListing/${id}`, { responseType: 'text' }).subscribe({
          next: () => {
            Swal.fire('Deleted!', 'The crop listing has been removed.', 'success');
            this.fetchMyListings();
          },
          error: () => {
            Swal.fire('Error', 'Failed to delete listing', 'error');
          }
        });
      }
    });
  }

  updateListing(listing: any): void {
    Swal.fire({
      title: 'Update Listing',
      html: `
        <style>
          .custom-swal-form {
            display: flex;
            flex-direction: column;
            gap: 16px;
            max-width: 350px;
            margin: auto;
            font-family: 'Segoe UI', sans-serif;
          }
  
          .form-group {
            display: flex;
            flex-direction: column;
          }
  
          .form-group label {
            font-weight: 600;
            margin-bottom: 6px;
            font-size: 14px;
            color: #2c3e50;
          }
  
          .form-group input[type="number"],
          .form-group textarea,
          .form-group input[type="file"] {
            padding: 10px 12px;
            font-size: 14px;
            border: 1px solid #ccc;
            border-radius: 6px;
            background-color: #f9f9f9;
            width: 100%;
            box-sizing: border-box;
          }
  
          .form-group textarea {
            resize: vertical;
            min-height: 80px;
          }
  
          .form-group input[type="file"] {
            padding: 6px;
            background-color: #fff;
          }
  
          .form-group input[type="file"]::-webkit-file-upload-button {
            padding: 6px 12px;
            border: none;
            background-color: #28a745;
            color: white;
            border-radius: 4px;
            cursor: pointer;
          }
  
          .form-group input[type="file"]::-webkit-file-upload-button:hover {
            background-color: #218838;
          }
        </style>
  
        <div class="custom-swal-form">
          <div class="form-group">
            <label for="pricePerKg">Price per Kg</label>
            <input id="pricePerKg" type="number" value="${listing.pricePerKg}">
          </div>
  
          <div class="form-group">
            <label for="quantity">Quantity (Kg)</label>
            <input id="quantity" type="number" value="${listing.quantity}">
          </div>
  
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description">${listing.description}</textarea>
          </div>
  
          <div class="form-group">
            <label for="imageUpload">Upload New Image (optional)</label>
            <input id="imageUpload" type="file" accept="image/*">
          </div>
        </div>
      `,
      preConfirm: async () => {
        const pricePerKg = +(document.getElementById('pricePerKg') as HTMLInputElement).value;
        const quantity = +(document.getElementById('quantity') as HTMLInputElement).value;
        const description = (document.getElementById('description') as HTMLTextAreaElement).value;
        const imageInput = document.getElementById('imageUpload') as HTMLInputElement;
        const file = imageInput.files?.[0];
        const imageBase64 = file ? await this.convertToBase64(file) : listing.imageBase64;
  
        if (!pricePerKg || !quantity || !description) {
          Swal.showValidationMessage('Please fill all fields');
          return;
        }
  
        return {
          id: listing.id,
          pricePerKg,
          quantity,
          status: listing.status,
          imageBase64,
          description
        };
      },
      showCancelButton: true,
      confirmButtonText: 'Update'
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const data = result.value;
        this.http.put(`http://localhost:5180/api/CropListing/${data.id}`, data).subscribe({
          next: () => {
            Swal.fire('Updated', 'Crop listing updated successfully', 'success');
            this.fetchMyListings();
          },
          error: () => {
            Swal.fire('Error', 'Failed to update listing', 'error');
          }
        });
      }
    });
  }
}
