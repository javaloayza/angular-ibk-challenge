import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { PostCardComponent } from '../post-card/post-card.component';
import { SearchBoxComponent } from '../../../../shared/components/search-box/search-box.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';
import { PostDetailComponent } from '../post-detail/post-detail.component';
import { PostStateService } from '../../services/post-state.service';
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

  // Reactive state from service
  readonly posts = this.postStateService.paginatedPosts;
  readonly loading = this.postStateService.loading;
  readonly error = this.postStateService.error;
  readonly paginationInfo = this.postStateService.paginationInfo;

  // Modal state
  readonly isModalOpen = signal(false);
  readonly selectedPost = signal<EnrichedPost | null>(null);

  ngOnInit(): void {
    this.postStateService.init();
  }

  onPostClick(post: EnrichedPost): void {
    this.selectedPost.set(post);
    this.isModalOpen.set(true);
  }

  onCloseModal(): void {
    this.isModalOpen.set(false);
    this.selectedPost.set(null);
  }

  onPreviousPage(): void {
    this.postStateService.previousPage();
  }

  onNextPage(): void {
    this.postStateService.nextPage();
  }

  onGoToPage(page: number): void {
    this.postStateService.goToPage(page);
  }

  onRetry(): void {
    this.postStateService.refreshPosts();
  }

  onSearchChange(searchTerm: string): void {
    this.postStateService.search(searchTerm);
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
}
