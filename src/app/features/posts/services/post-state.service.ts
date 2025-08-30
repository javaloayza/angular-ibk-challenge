import { Injectable, inject, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { startWith, catchError, tap } from 'rxjs/operators';
import { PostService } from './post.service';
import { EnrichedPost } from '../models/post.model';

export interface PostsState {
  posts: EnrichedPost[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  itemsPerPage: number;
  searchTerm: string;
  selectedPost: EnrichedPost | null;
}

@Injectable({
  providedIn: 'root'
})
export class PostStateService {
  private readonly postService = inject(PostService);
  
  // No need for subjects anymore - using signals only
  
  // Core state signals
  private readonly _loading = signal<boolean>(true);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal<string>('');
  private readonly _currentPage = signal<number>(1);
  private readonly _selectedPost = signal<EnrichedPost | null>(null);
  private readonly _itemsPerPage = 10;
  
  // Posts data from API - load once on init
  private readonly posts$ = this.postService.getEnrichedPosts().pipe(
    tap(posts => {
      this._loading.set(false);
    }),
    catchError(error => {
      this._error.set('Failed to load posts. Please try again.');
      this._loading.set(false);
      return of([] as EnrichedPost[]);
    }),
    startWith([])
  );
  
  private readonly _allPosts = toSignal(this.posts$, { initialValue: [] });
  
  // Computed signals for derived state
  readonly posts = computed(() => this._allPosts());
  readonly loading = computed(() => this._loading());
  readonly error = computed(() => this._error());
  readonly searchTerm = computed(() => this._searchTerm());
  readonly currentPage = computed(() => this._currentPage());
  readonly selectedPost = computed(() => this._selectedPost());
  readonly itemsPerPage = this._itemsPerPage;
  
  // Filtered posts based on search
  readonly filteredPosts = computed(() => {
    const posts = this._allPosts();
    const searchTerm = this._searchTerm().toLowerCase().trim();
    
    if (!searchTerm) {
      return posts;
    }
    
    return posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.body.toLowerCase().includes(searchTerm) ||
      post.user.name.toLowerCase().includes(searchTerm) ||
      post.user.email.toLowerCase().includes(searchTerm)
    );
  });
  
  // Paginated posts
  readonly paginatedPosts = computed(() => {
    const filtered = this.filteredPosts();
    const page = this._currentPage();
    const startIndex = (page - 1) * this._itemsPerPage;
    const endIndex = startIndex + this._itemsPerPage;
    
    return filtered.slice(startIndex, endIndex);
  });
  
  // Total pages for pagination
  readonly totalPages = computed(() => 
    Math.ceil(this.filteredPosts().length / this._itemsPerPage)
  );
  
  // Pagination info
  readonly paginationInfo = computed(() => {
    const filtered = this.filteredPosts();
    const page = this._currentPage();
    const total = filtered.length;
    const startIndex = (page - 1) * this._itemsPerPage;
    
    return {
      currentPage: page,
      totalPages: this.totalPages(),
      totalItems: total,
      startItem: Math.min(startIndex + 1, total),
      endItem: Math.min(startIndex + this._itemsPerPage, total),
      hasNext: page < this.totalPages(),
      hasPrevious: page > 1
    };
  });
  
  // Public methods for state mutations
  search(term: string): void {
    this._searchTerm.set(term);
    this._currentPage.set(1); // Reset to first page on search
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this._currentPage.set(page);
    }
  }
  
  nextPage(): void {
    const current = this._currentPage();
    if (current < this.totalPages()) {
      this.goToPage(current + 1);
    }
  }
  
  previousPage(): void {
    const current = this._currentPage();
    if (current > 1) {
      this.goToPage(current - 1);
    }
  }
  
  selectPost(post: EnrichedPost | null): void {
    this._selectedPost.set(post);
  }
  
  refreshPosts(): void {
    this._loading.set(true);
    this._error.set(null);
    // Will trigger reload through the posts$ observable
  }
  
  // Initialize the service  
  init(): void {
    // Posts load automatically via the posts$ observable
  }
}