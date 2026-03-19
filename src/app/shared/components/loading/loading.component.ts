import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss',
})
export class LoadingComponent {
  readonly count = input<number>(5);
  readonly label = input<string>('Loading...');

  readonly rowArray = computed(() => Array.from({ length: this.count() }, (_, i) => i));
}
