import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PostCardComponent } from '../post-card/post-card.component';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PostDetailComponent } from '../post-detail/post-detail.component';
import { PostStateService } from '../../services/post-state.service';
import { PostService } from '../../services/post.service';
import { EnrichedPost } from '../../models/post.model';

@Component({
  selector: 'app-post-list',
  imports: [PostCardComponent, SearchBoxComponent, ModalComponent, PostDetailComponent],
  templateUrl: './post-list.component.html',
  styleUrl: './post-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostListComponent implements OnInit {
  private readonly postStateService = inject(PostStateService);
  private readonly postService = inject(PostService);
  private readonly router = inject(Router);

  // Reactive state from service
  readonly posts = this.postStateService.paginatedPosts;
  readonly loading = this.postStateService.loading;
  readonly error = this.postStateService.error;
  readonly paginationInfo = this.postStateService.paginationInfo;

  // Modal states
  readonly isPreviewModalOpen = signal(false);
  readonly isDeleteModalOpen = signal(false);
  readonly selectedPost = signal<EnrichedPost | null>(null);
  readonly isDeleting = signal(false);

  ngOnInit(): void {
    // Refresh data cada vez que se navega a la lista (para mostrar posts creados)
    this.postStateService.refreshPosts();
  }

  onPostClick(post: EnrichedPost): void {
    // Quick view in modal
    this.selectedPost.set(post);
    this.isPreviewModalOpen.set(true);
  }

  onViewFullPost(): void {
    // Navegar a vista completa
    const post = this.selectedPost();
    if (post) {
      this.isPreviewModalOpen.set(false);
      this.router.navigate(['/posts', post.id]);
    }
  }

  onClosePreviewModal(): void {
    this.isPreviewModalOpen.set(false);
    this.selectedPost.set(null);
  }

  onEditClick(data: { post: EnrichedPost, event: Event }): void {
    this.router.navigate(['/posts', data.post.id, 'edit']);
  }

  onDeleteClick(data: { post: EnrichedPost, event: Event }): void {
    this.selectedPost.set(data.post);
    this.isDeleteModalOpen.set(true);
  }

  onConfirmDelete(): void {
    const post = this.selectedPost();
    if (post) {
      this.isDeleting.set(true);
      this.postService.deletePost(post.id).subscribe({
        next: () => {
          this.isDeleting.set(false);
          this.isDeleteModalOpen.set(false);
          this.selectedPost.set(null);
          // Refrescar lista de posts
          this.postStateService.refreshPosts();
        },
        error: () => {
          this.isDeleting.set(false);
          // In a real app, you would show an error message
        }
      });
    }
  }

  onCancelDelete(): void {
    this.isDeleteModalOpen.set(false);
    this.selectedPost.set(null);
  }

  onPreviousPage(): void {
    this.postStateService.previousPage();
    this.scrollToTop();
  }

  onNextPage(): void {
    this.postStateService.nextPage();
    this.scrollToTop();
  }

  onGoToPage(page: number): void {
    this.postStateService.goToPage(page);
    this.scrollToTop();
  }

  onRetry(): void {
    this.postStateService.refreshPosts();
  }

  onSearchChange(searchTerm: string): void {
    this.postStateService.search(searchTerm);
  }

  onCreatePost(): void {
    this.router.navigate(['/posts/new']);
  }

  trackByPostId(index: number, post: EnrichedPost): number {
    return post.id;
  }

  getPageNumbers(): number[] {
    const totalPages = this.paginationInfo().totalPages;
    const currentPage = this.paginationInfo().currentPage;
    const pages: number[] = [];

    // Show up to 5 page numbers around current page
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  private scrollToTop(): void {
    // Scroll to the beginning of the posts section smoothly
    const postsSection = document.querySelector('.posts-grid');
    if (postsSection) {
      postsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Fallback: scroll to top of the page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
