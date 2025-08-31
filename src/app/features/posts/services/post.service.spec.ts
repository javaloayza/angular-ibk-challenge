import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PostService } from './post.service';
import { ApiService } from '../../../core/services/api.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Post } from '../models/post.model';

describe('PostService', () => {
  let service: PostService;
  let mockApiService: jasmine.SpyObj<ApiService>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;

  // Mock data
  const mockPosts: Post[] = [
    { id: 1, userId: 1, title: 'Test Post 1', body: 'Test content 1' },
    { id: 2, userId: 2, title: 'Test Post 2', body: 'Test content 2' }
  ];

  const mockCustomPosts: Post[] = [
    { id: 10001, userId: 1, title: 'Custom Post', body: 'Custom content' }
  ];

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiService', ['get', 'put']);
    const localStorageSpy = jasmine.createSpyObj('LocalStorageService', [
      'getCustomPosts', 'addCustomPost', 'updateCustomPost', 'deleteCustomPost', 'getDeletedPostIds'
    ]);

    TestBed.configureTestingModule({
      providers: [
        PostService,
        { provide: ApiService, useValue: apiSpy },
        { provide: LocalStorageService, useValue: localStorageSpy }
      ]
    });

    service = TestBed.inject(PostService);
    mockApiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
    mockLocalStorageService = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Essential tests for the challenge
  describe('Essential PostService Operations', () => {
    it('should merge API posts with custom posts correctly', (done) => {
      // Arrange
      mockApiService.get.and.returnValue(of(mockPosts));
      mockLocalStorageService.getCustomPosts.and.returnValue(mockCustomPosts);
      mockLocalStorageService.getDeletedPostIds.and.returnValue([]);

      // Act
      service.getAllPosts().subscribe(posts => {
        // Assert
        expect(posts.length).toBe(3); // 2 API posts + 1 custom post
        expect(posts[0].id).toBe(10001); // Custom post should be first (highest ID)
        done();
      });
    });

    it('should handle API errors gracefully', (done) => {
      // Arrange
      mockApiService.get.and.returnValue(of([])); // API fails, returns empty array
      mockLocalStorageService.getCustomPosts.and.returnValue(mockCustomPosts);
      mockLocalStorageService.getDeletedPostIds.and.returnValue([]);

      // Act
      service.getAllPosts().subscribe(posts => {
        // Assert
        expect(posts.length).toBe(1); // Only custom posts
        expect(posts[0].id).toBe(10001);
        done();
      });
    });

    it('should create new custom post with correct structure', (done) => {
      // Arrange
      const newPostData = { title: 'New Post Title', body: 'New post content' };
      const createdPost = { ...newPostData, id: 10001, userId: 1 };
      mockLocalStorageService.addCustomPost.and.returnValue(createdPost);

      // Act
      service.createPost(newPostData).subscribe(post => {
        // Assert
        expect(post.id).toBe(10001);
        expect(post.title).toBe('New Post Title');
        expect(post.body).toBe('New post content');
        expect(post.userId).toBe(1);
        expect(mockLocalStorageService.addCustomPost).toHaveBeenCalledWith({
          ...newPostData,
          userId: 1
        });
        done();
      });
    });

    it('should update post correctly (custom vs API logic)', (done) => {
      // Test custom post update
      const updateData = { title: 'Updated Title', body: 'Updated Content' };
      const updatedPost = { id: 10001, userId: 1, ...updateData };
      mockLocalStorageService.updateCustomPost.and.returnValue(updatedPost);

      service.updatePost(10001, updateData).subscribe(post => {
        expect(post).toEqual(updatedPost);
        expect(mockLocalStorageService.updateCustomPost).toHaveBeenCalledWith(10001, updateData);
        done();
      });
    });

    it('should delete post correctly (custom vs API logic)', (done) => {
      // Test custom post deletion
      mockLocalStorageService.deleteCustomPost.and.returnValue(true);

      service.deletePost(10001).subscribe(() => {
        expect(mockLocalStorageService.deleteCustomPost).toHaveBeenCalledWith(10001);
        done();
      });
    });
  });
});
