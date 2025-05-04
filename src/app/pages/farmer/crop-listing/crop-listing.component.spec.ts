import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropListingComponent } from './crop-listing.component';

describe('CropListingComponent', () => {
  let component: CropListingComponent;
  let fixture: ComponentFixture<CropListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
