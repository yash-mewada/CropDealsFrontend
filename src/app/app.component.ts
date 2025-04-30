import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, SidebarComponent],
  template: `
    <app-navbar *ngIf="showLayout"></app-navbar>
    <div class="d-flex">
      <app-sidebar *ngIf="showLayout"></app-sidebar>
      <div class="flex-grow-1" [style.marginLeft]="showLayout ? '200px' : '0'">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showLayout = true;

  constructor(private router: Router) {
    this.router.events.subscribe(() => {
      const currentUrl = this.router.url;
      this.showLayout = !(currentUrl.includes('signin') || currentUrl.includes('signup'));
    });
  }
}
