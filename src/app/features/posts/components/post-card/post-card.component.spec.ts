import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostCardComponent } from './post-card.component';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { EnrichedPost } from '../../models/post.model';

describe('PostCardComponent', () => {
  let component: PostCardComponent;
  let fixture: ComponentFixture<PostCardComponent>;

  const mockPost: EnrichedPost = {
    id: 1,
    userId: 1,
    title: 'Test Post Title',
    body: 'This is a test post body with enough content to test truncation.',
    user: {
      id: 1,
      name: 'John Doe',
      username: 'johndoe',
      email: 'john@example.com',
      address: {
        street: 'Main St',
        city: 'Anytown',
        zipcode: '12345'
      },
      company: {
        name: 'Test Company'
      }
    },
    avatar: 'https://example.com/avatar.jpg',
    postImage: 'https://example.com/image.jpg',
    hasImage: true
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCardComponent, TruncatePipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCardComponent);
    component = fixture.componentInstance;
    component.post = mockPost;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Essential tests for the challenge
  describe('Essential PostCard Operations', () => {
    it('should allow editing for user/custom posts', () => {
      // User post (userId = 1)
      component.post = { ...mockPost, userId: 1 };
      expect(component.canEdit()).toBe(true);

      // Custom post (ID >= 10001)
      component.post = { ...mockPost, id: 10001, userId: 2 };
      expect(component.canEdit()).toBe(true);

      // Other user's API post
      component.post = { ...mockPost, id: 50, userId: 2 };
      expect(component.canEdit()).toBe(false);
    });

    it('should allow deleting for user/custom posts', () => {
      // User post (userId = 1)
      component.post = { ...mockPost, userId: 1 };
      expect(component.canDelete()).toBe(true);

      // Custom post (ID >= 10001)
      component.post = { ...mockPost, id: 10001, userId: 2 };
      expect(component.canDelete()).toBe(true);

      // Other user's API post
      component.post = { ...mockPost, id: 50, userId: 2 };
      expect(component.canDelete()).toBe(false);
    });

    it('should handle image error correctly', () => {
      const img = document.createElement('img');
      const event = { target: img } as any;

      component.onAvatarError(event);
      expect(img.src).toContain('ui-avatars.com');
    });
  });
});
