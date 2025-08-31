import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, of, combineLatest } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Post, User, EnrichedPost, Comment, PostWithComments } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiService = inject(ApiService);
  private readonly localStorageService = inject(LocalStorageService);

  getAllPosts(): Observable<Post[]> {
    return combineLatest([
      this.apiService.get<Post[]>('/posts').pipe(
        catchError(() => of([])) // If API fails, continue with empty array
      ),
      of(this.localStorageService.getCustomPosts()),
      of(this.localStorageService.getDeletedPostIds())
    ]).pipe(
      map(([apiPosts, customPosts, deletedIds]) => {
        // Filter out deleted posts from API
        const filteredApiPosts = apiPosts.filter(post => !deletedIds.includes(post.id));

        // Combine API posts with custom posts
        return [...filteredApiPosts, ...customPosts]
          .sort((a, b) => b.id - a.id); // Sort by ID descending (newest first)
      })
    );
  }

  getPostById(id: number): Observable<Post> {
    // First search in localStorage (custom posts)
    const customPosts = this.localStorageService.getCustomPosts();
    const customPost = customPosts.find(post => post.id === id);

    if (customPost) {
      return of(customPost);
    }

    // If not in localStorage, search in API
    return this.apiService.get<Post>(`/posts/${id}`).pipe(
      catchError(() => {
        // If not found, return error
        throw new Error(`Post with ID ${id} not found`);
      })
    );
  }

  // Alias for compatibility
  getPost(id: number): Observable<Post> {
    return this.getPostById(id);
  }

  getAllUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('/users').pipe(
      catchError(() => of([])) // If API fails, return empty array
    );
  }

  getUserById(id: number): Observable<User> {
    return this.apiService.get<User>(`/users/${id}`).pipe(
      catchError(() => of(this.createDefaultUser(id))) // Create default user if fails
    );
  }

  /**
   * Create default user when API is unavailable
   */
  private createDefaultUser(userId: number): User {
    return {
      id: userId,
      name: `Usuario ${userId}`,
      username: `user${userId}`,
      email: `user${userId}@example.com`,
      address: {
        street: 'Calle Principal',
        city: 'Lima'
      },
      company: {
        name: 'Empresa Demo'
      }
    };
  }

  getEnrichedPosts(): Observable<EnrichedPost[]> {
    return forkJoin({
      posts: this.getAllPosts(),
      users: this.getAllUsers()
    }).pipe(
      map(({ posts, users }) => {
        const userMap = new Map(users.map(user => [user.id, user]));

        return posts.map(post => {
          // If user doesn't exist in API, create default one
          const user = userMap.get(post.userId) || this.createDefaultUser(post.userId);
          const hasImage = Math.random() > 0.3; // 70% of posts have images

          return {
            ...post,
            user,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${post.userId}post${post.id}`,
            postImage: hasImage ? `https://picsum.photos/400/250?random=${post.id}` : undefined,
            hasImage
          } as EnrichedPost;
        });
      })
    );
  }

  getEnrichedPostById(id: number): Observable<EnrichedPost> {
    return this.getPostById(id).pipe(
      switchMap(post =>
        this.getUserById(post.userId).pipe(
          map(user => {
            const hasImage = Math.random() > 0.3;

            return {
              ...post,
              user,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${post.userId}post${post.id}`,
              postImage: hasImage ? `https://picsum.photos/400/250?random=${post.id}` : undefined,
              hasImage
            } as EnrichedPost;
          })
        )
      )
    );
  }

  createPost(post: Partial<Post>): Observable<Post> {
    // Create post in localStorage (real persistence)
    const newPost = this.localStorageService.addCustomPost({
      title: post.title || '',
      body: post.body || '',
      userId: post.userId || 1
    });

    return of(newPost);
  }

  updatePost(id: number, updates: Partial<Post>): Observable<Post> {
    // Try to update in localStorage first (custom posts)
    const updatedPost = this.localStorageService.updateCustomPost(id, updates);

    if (updatedPost) {
      return of(updatedPost);
    }

    // If not a custom post, simulate API update
    // (JSONPlaceholder doesn't persist changes, but returns as if it worked)
    return this.apiService.put<Post>(`/posts/${id}`, updates).pipe(
      catchError(() => {
        throw new Error(`Post with ID ${id} not found or cannot be updated`);
      })
    );
  }

  deletePost(id: number): Observable<void> {
    // Try to delete from localStorage first (custom posts)
    const wasDeleted = this.localStorageService.deleteCustomPost(id);

    if (wasDeleted) {
      return of(void 0);
    }

    // If not a custom post, mark as deleted
    // (to filter it from the API list)
    const deletedIds = this.localStorageService.getDeletedPostIds();
    deletedIds.push(id);
    try {
      localStorage.setItem('interbank_deleted_posts', JSON.stringify(deletedIds));
      return of(void 0);
    } catch (error) {
      throw new Error(`Could not delete post with ID ${id}`);
    }
  }

  getPostComments(postId: number): Observable<Comment[]> {
    return this.apiService.get<Comment[]>(`/posts/${postId}/comments`);
  }

  getPostWithComments(postId: number): Observable<PostWithComments> {
    return forkJoin({
      post: this.getPostById(postId),
      user: this.getPostById(postId).pipe(
        switchMap(post => this.getUserById(post.userId))
      ),
      comments: this.getPostComments(postId)
    }).pipe(
      map(({ post, user, comments }) => {
        const enrichedPost: EnrichedPost = {
          ...post,
          user,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=user${user.id}post${post.id}`,
          postImage: Math.random() > 0.3 ? `https://picsum.photos/400/250?random=${post.id}` : undefined,
          hasImage: Math.random() > 0.3,
          wordCount: post.body.split(' ').length,
          readingTime: Math.ceil(post.body.split(' ').length / 200) // ~200 words per minute
        };

        return {
          ...enrichedPost,
          comments
        } as PostWithComments;
      })
    );
  }

  /**
   * Useful methods for development and debugging
   */
  getDataStatistics(): {
    customPosts: number;
    deletedPosts: number;
    totalCustomPosts: Post[];
    deletedPostIds: number[];
  } {
    return {
      customPosts: this.localStorageService.getCustomPosts().length,
      deletedPosts: this.localStorageService.getDeletedPostIds().length,
      totalCustomPosts: this.localStorageService.getCustomPosts(),
      deletedPostIds: this.localStorageService.getDeletedPostIds()
    };
  }

  /**
   * Clear all localStorage data
   * Useful for resetting the application during development
   */
  clearAllLocalData(): void {
    this.localStorageService.clearAllData();
    console.log('📱 LocalStorage data cleared. Refresh the page to see original API data.');
  }
}
