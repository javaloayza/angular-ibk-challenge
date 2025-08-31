import { Routes } from '@angular/router';
import { PostListComponent } from './features/posts/components/post-list/post-list.component';
import { PostDetailPageComponent } from './features/posts/components/post-detail/post-detail-page.component';
import { PostFormComponent } from './features/posts/components/post-form/post-form.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/posts',
    pathMatch: 'full'
  },
  {
    path: 'posts',
    component: PostListComponent
  },
  {
    path: 'posts/new',
    component: PostFormComponent
  },
  {
    path: 'posts/:id/edit',
    component: PostFormComponent
  },
  {
    path: 'posts/:id',
    component: PostDetailPageComponent
  },
  {
    path: '**',
    redirectTo: '/posts'
  }
];
