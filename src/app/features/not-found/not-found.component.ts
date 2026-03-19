import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="not-found page-enter">
      <div class="not-found__code">404</div>
      <h1 class="not-found__title">Page not found</h1>
      <p class="not-found__sub">The route you're looking for doesn't exist.</p>
      <a mat-raised-button color="primary" routerLink="/customers">
        <mat-icon>arrow_back</mat-icon>
        Back to Customers
      </a>
    </div>
  `,
  styles: [
    `
      .not-found {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        gap: 16px;
        text-align: center;
        padding: 32px;
      }
      .not-found__code {
        font-family: var(--font-display);
        font-size: 100px;
        font-weight: 800;
        line-height: 1;
        background: linear-gradient(135deg, var(--accent-primary), #7c3aed);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .not-found__title {
        font-family: var(--font-display);
        font-size: 24px;
        font-weight: 700;
      }
      .not-found__sub {
        color: var(--text-secondary);
        font-size: 14px;
      }
    `,
  ],
})
export class NotFoundComponent {}
