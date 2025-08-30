import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { Post, User, EnrichedPost, Comment, PostWithComments } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiService = inject(ApiService);

  getAllPosts(): Observable<Post[]> {
    return this.apiService.get<Post[]>('/posts');
  }

  getPostById(id: number): Observable<Post> {
    return this.apiService.get<Post>(`/posts/${id}`);
  }

  getAllUsers(): Observable<User[]> {
    return this.apiService.get<User[]>('/users');
  }

  getUserById(id: number): Observable<User> {
    return this.apiService.get<User>(`/users/${id}`);
  }

  getEnrichedPosts(): Observable<EnrichedPost[]> {
    return forkJoin({
      posts: this.getAllPosts(),
      users: this.getAllUsers()
    }).pipe(
      map(({ posts, users }) => {
        const userMap = new Map(users.map(user => [user.id, user]));

        return posts.map(post => {
          const user = userMap.get(post.userId);
          const hasImage = Math.random() > 0.3; // 70% of posts have images

          return {
            ...post,
            user: user!,
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
    return this.apiService.post<Post>('/posts', post);
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.apiService.put<Post>(`/posts/${id}`, post);
  }

  deletePost(id: number): Observable<void> {
    return this.apiService.delete<void>(`/posts/${id}`);
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
}
