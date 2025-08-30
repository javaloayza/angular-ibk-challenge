import { Component, Input, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrichedPost, PostWithComments } from '../../models/post.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-detail',
  imports: [CommonModule],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostDetailComponent implements OnInit {
  @Input({ required: true }) post!: EnrichedPost;

  private readonly postService = inject(PostService);

  readonly postWithComments = signal<PostWithComments | null>(null);
  readonly loadingComments = signal(false);

  ngOnInit(): void {
    this.loadPostDetails();
  }

  private loadPostDetails(): void {
    this.loadingComments.set(true);
    this.postService.getPostWithComments(this.post.id).subscribe({
      next: (postWithComments) => {
        this.postWithComments.set(postWithComments);
        this.loadingComments.set(false);
      },
      error: () => {
        this.loadingComments.set(false);
      }
    });
  }

  /**
   * Get initials from a name for avatar display
   */
  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  /**
   * Generate a random date for demo purposes
   */
  getRandomDate(): string {
    const dates = [
      '2 hours ago',
      '1 day ago',
      '3 days ago',
      '1 week ago',
      '2 weeks ago'
    ];
    return dates[Math.floor(Math.random() * dates.length)];
  }

  /**
   * Get reading time estimation
   */
  getReadingTime(text: string): number {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  }
}
