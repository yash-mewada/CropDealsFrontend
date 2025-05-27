import { Routes } from '@angular/router';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { SignUpComponent } from './pages/sign-up/sign-up.component';
import { HomeComponent } from './pages/home/home.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { CropsComponent } from './pages/admin/crops/crops.component';
import { CropListingComponent } from './pages/farmer/crop-listing/crop-listing.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { CropsNearYouComponent } from './pages/dealer/crops-near-you/crops-near-you.component';
import { CropDetailsComponent } from './pages/dealer/crop-details/crop-details.component';
import { PaymentPageComponent } from './pages/payment-page/payment-page.component';
import { MyTransactionsComponent } from './pages/dealer/my-transactions/my-transactions.component';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { path: 'signin', component: SignInComponent },
  { path: 'signup', component: SignUpComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'crops', component: CropsComponent },
  { path: 'crop-listing', component: CropListingComponent },
  { path: 'crops-near-you', component: CropsNearYouComponent },
  { path: 'crop-details/:id', component: CropDetailsComponent },
  { path: 'payment', component: PaymentPageComponent },
  { path: 'my-transactions', component: MyTransactionsComponent }
];
