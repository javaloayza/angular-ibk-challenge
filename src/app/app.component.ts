import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PostListComponent } from './features/posts/components/post-list/post-list.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PostListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'angular-interbank-app';
}
/* Force refresh */
