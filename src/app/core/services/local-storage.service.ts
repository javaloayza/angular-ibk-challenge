import { Injectable } from '@angular/core';
import { Post } from '../../features/posts/models/post.model';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly POSTS_KEY = 'interbank_custom_posts';
  private readonly DELETED_POSTS_KEY = 'interbank_deleted_posts';

  /**
   * Get custom posts from localStorage
   */
  getCustomPosts(): Post[] {
    try {
      const stored = localStorage.getItem(this.POSTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading custom posts from localStorage:', error);
      return [];
    }
  }

  /**
   * Save custom posts to localStorage
   */
  saveCustomPosts(posts: Post[]): void {
    try {
      localStorage.setItem(this.POSTS_KEY, JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving custom posts to localStorage:', error);
    }
  }

  /**
   * Add a new custom post
   */
  addCustomPost(post: Omit<Post, 'id'>): Post {
    const customPosts = this.getCustomPosts();
    const newId = this.generateNewId(customPosts);

    const newPost: Post = {
      ...post,
      id: newId
    };

    customPosts.push(newPost);
    this.saveCustomPosts(customPosts);

    return newPost;
  }

  /**
   * Update a custom post
   */
  updateCustomPost(id: number, updates: Partial<Post>): Post | null {
    const customPosts = this.getCustomPosts();
    const index = customPosts.findIndex(p => p.id === id);

    if (index !== -1) {
      customPosts[index] = { ...customPosts[index], ...updates };
      this.saveCustomPosts(customPosts);
      return customPosts[index];
    }

    return null;
  }

  /**
   * Delete a custom post
   */
  deleteCustomPost(id: number): boolean {
    const customPosts = this.getCustomPosts();
    const initialLength = customPosts.length;
    const filteredPosts = customPosts.filter(p => p.id !== id);

    if (filteredPosts.length < initialLength) {
      this.saveCustomPosts(filteredPosts);
      this.markAsDeleted(id);
      return true;
    }

    return false;
  }

  /**
   * Get deleted post IDs (to filter from API)
   */
  getDeletedPostIds(): number[] {
    try {
      const stored = localStorage.getItem(this.DELETED_POSTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading deleted posts from localStorage:', error);
      return [];
    }
  }

  /**
   * Mark a post as deleted
   */
  private markAsDeleted(id: number): void {
    try {
      const deletedIds = this.getDeletedPostIds();
      if (!deletedIds.includes(id)) {
        deletedIds.push(id);
        localStorage.setItem(this.DELETED_POSTS_KEY, JSON.stringify(deletedIds));
      }
    } catch (error) {
      console.error('Error marking post as deleted:', error);
    }
  }

  /**
   * Generate a new unique ID
   */
  private generateNewId(existingPosts: Post[]): number {
    // Custom IDs start at 10001 to appear first in descending order
    const baseId = 10001;

    if (existingPosts.length === 0) {
      return baseId;
    }

    // Find the highest ID among custom posts and add 1
    const maxId = Math.max(...existingPosts.map(p => p.id));
    return Math.max(maxId + 1, baseId);
  }

  /**
   * Clear all localStorage data (useful for development)
   */
  clearAllData(): void {
    localStorage.removeItem(this.POSTS_KEY);
    localStorage.removeItem(this.DELETED_POSTS_KEY);
  }
}
