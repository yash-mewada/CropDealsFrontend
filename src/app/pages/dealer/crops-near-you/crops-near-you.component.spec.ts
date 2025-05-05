import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropsNearYouComponent } from './crops-near-you.component';

describe('CropsNearYouComponent', () => {
  let component: CropsNearYouComponent;
  let fixture: ComponentFixture<CropsNearYouComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropsNearYouComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CropsNearYouComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
