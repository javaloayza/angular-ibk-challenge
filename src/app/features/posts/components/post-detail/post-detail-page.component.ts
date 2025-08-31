import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PostDetailComponent } from './post-detail.component';
import { PostService } from '../../services/post.service';
import { PostWithComments } from '../../models/post.model';

@Component({
  selector: 'app-post-detail-page',
  standalone: true,
  imports: [CommonModule, PostDetailComponent],
  template: `
    <div class="post-detail-page">
      @if (loading()) {
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading post...</p>
        </div>
      } @else if (error()) {
        <div class="error-container">
          <h3>Error loading post</h3>
          <p>{{ error() }}</p>
          <button class="btn-primary" (click)="onBackToList()">
            Back to Posts
          </button>
        </div>
      } @else if (postWithComments()) {
        <div class="detail-header">
          <button class="btn-back" (click)="onBackToList()">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
            </svg>
            Back to Posts
          </button>
          <button
            class="btn-edit"
            [class.btn-disabled]="!canEditPost()"
            [disabled]="!canEditPost()"
            [title]="getEditTooltip()"
            (click)="canEditPost() && onEditPost()">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L10.5 8.207l-3-3L12.146.146zM11.207 9l-3-3L2.5 11.707V14.5a.5.5 0 0 0 .5.5h2.793L11.207 9z"/>
            </svg>
            Edit
          </button>
        </div>

        <app-post-detail [post]="postWithComments()!"></app-post-detail>
      }
    </div>
  `,
  styles: [`
    .post-detail-page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .loading-container {
      text-align: center;
      padding: 4rem;

      .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 1rem;
      }

      p {
        color: #6b7280;
        font-size: 1rem;
      }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-container {
      text-align: center;
      padding: 4rem;

      h3 {
        color: #dc2626;
        margin-bottom: 1rem;
      }

      p {
        color: #6b7280;
        margin-bottom: 2rem;
      }
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .btn-back, .btn-edit, .btn-primary {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 0.875rem;
    }

    .btn-back {
      background: #f3f4f6;
      color: #374151;

      &:hover {
        background: #e5e7eb;
        transform: translateY(-1px);
      }
    }

    .btn-edit {
      background: #3b82f6;
      color: white;

      &:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }

      &.btn-disabled,
      &:disabled {
        background: #9ca3af;
        color: #6b7280;
        cursor: not-allowed;
        opacity: 0.6;

        &:hover {
          background: #9ca3af;
          transform: none;
        }
      }
    }

    .btn-primary {
      background: #3b82f6;
      color: white;

      &:hover {
        background: #2563eb;
        transform: translateY(-1px);
      }
    }

    @media (max-width: 768px) {
      .post-detail-page {
        padding: 1rem 0.5rem;
      }

      .detail-header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postService = inject(PostService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly postWithComments = signal<PostWithComments | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPost(Number(id));
    } else {
      this.error.set('Invalid post ID');
    }
  }

  private loadPost(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.postService.getPostWithComments(id).subscribe({
      next: (postWithComments) => {
        this.postWithComments.set(postWithComments);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Could not load post');
        this.loading.set(false);
      }
    });
  }

  onBackToList(): void {
    this.router.navigate(['/posts']);
  }

  onEditPost(): void {
    const post = this.postWithComments();
    if (post) {
      this.router.navigate(['/posts', post.id, 'edit']);
    }
  }

  /**
   * Determine if the post can be edited
   * Only custom posts (ID >= 10001) can be edited
   */
  canEditPost(): boolean {
    const post = this.postWithComments();
    return post ? post.id >= 10001 : false;
  }

  /**
   * Tooltip text para el botón de editar
   */
  getEditTooltip(): string {
    return this.canEditPost()
      ? 'Edit post'
      : 'You can only edit posts you have created';
  }
}
