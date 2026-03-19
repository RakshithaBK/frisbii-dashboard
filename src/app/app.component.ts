import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="app-shell">
      <app-sidebar />
      <main class="app-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .app-shell {
        display: flex;
        min-height: 100vh;
        height: 100vh;
        overflow: hidden;
      }
      .app-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        background: var(--bg-base);
      }
    `,
  ],
})
export class AppComponent {}
