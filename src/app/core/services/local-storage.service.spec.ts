import { TestBed } from '@angular/core/testing';
import { LocalStorageService } from './local-storage.service';
import { Post } from '../../features/posts/models/post.model';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let mockLocalStorage: { [key: string]: string };

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {};

    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      return mockLocalStorage[key] || null;
    });

    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
      mockLocalStorage[key] = value;
    });

    spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
      delete mockLocalStorage[key];
    });

    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    mockLocalStorage = {};
  });

  // Essential tests for the challenge
  describe('Essential LocalStorage Operations', () => {
    it('should add new post with generated ID starting at 10001', () => {
      const newPost = {
        title: 'New Post',
        body: 'New Content',
        userId: 1
      };

      const result = service.addCustomPost(newPost);

      expect(result.id).toBe(10001);
      expect(result.title).toBe(newPost.title);
      expect(result.body).toBe(newPost.body);
      expect(result.userId).toBe(newPost.userId);
    });

    it('should update existing post successfully', () => {
      // Setup: Add a post first
      const initialPost = service.addCustomPost({
        title: 'Original Title',
        body: 'Original Content',
        userId: 1
      });

      const updates = {
        title: 'Updated Title',
        body: 'Updated Content'
      };

      const result = service.updateCustomPost(initialPost.id, updates);

      expect(result).toBeTruthy();
      expect(result!.title).toBe('Updated Title');
      expect(result!.body).toBe('Updated Content');
      expect(result!.userId).toBe(1); // Should preserve original userId
    });

    it('should delete post and track as deleted', () => {
      // Setup: Add a post first
      const post = service.addCustomPost({
        title: 'To Delete',
        body: 'Content',
        userId: 1
      });

      const result = service.deleteCustomPost(post.id);

      expect(result).toBe(true);

      // Should track deleted post
      const deletedIds = service.getDeletedPostIds();
      expect(deletedIds).toContain(post.id);
    });

    it('should return stored posts correctly', () => {
      const mockPosts: Post[] = [
        { id: 10001, title: 'Test Post', body: 'Test Content', userId: 1 }
      ];
      mockLocalStorage['interbank_custom_posts'] = JSON.stringify(mockPosts);

      const result = service.getCustomPosts();
      expect(result).toEqual(mockPosts);
    });

    it('should handle deleted posts tracking', () => {
      mockLocalStorage['interbank_deleted_posts'] = JSON.stringify([1, 2, 3]);

      const result = service.getDeletedPostIds();
      expect(result).toEqual([1, 2, 3]);
    });
  });
});
