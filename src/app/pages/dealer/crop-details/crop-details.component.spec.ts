import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropDetailsComponent } from './crop-details.component';

describe('CropDetailsComponent', () => {
  let component: CropDetailsComponent;
  let fixture: ComponentFixture<CropDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
