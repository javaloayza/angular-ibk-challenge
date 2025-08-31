import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { EnrichedPost } from '../../models/post.model';

@Component({
  selector: 'app-post-card',
  imports: [TruncatePipe],
  templateUrl: './post-card.component.html',
  styleUrl: './post-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostCardComponent {
  @Input({ required: true }) post!: EnrichedPost;
  @Output() postClick = new EventEmitter<EnrichedPost>();
  @Output() editClick = new EventEmitter<{ post: EnrichedPost, event: Event }>();
  @Output() deleteClick = new EventEmitter<{ post: EnrichedPost, event: Event }>();

  onCardClick(): void {
    this.postClick.emit(this.post);
  }

  onEditClick(event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.editClick.emit({ post: this.post, event });
  }

  onDeleteClick(event: Event): void {
    event.stopPropagation(); // Prevent card click
    this.deleteClick.emit({ post: this.post, event });
  }

  /**
   * Handle edit button click - works for both mobile and desktop
   */
  onEditButtonClick(event: Event): void {
    if (this.canEdit()) {
      this.onEditClick(event);
    } else {
      event.stopPropagation();
    }
  }

  /**
   * Handle delete button click - works for both mobile and desktop
   */
  onDeleteButtonClick(event: Event): void {
    if (this.canDelete()) {
      this.onDeleteClick(event);
    } else {
      event.stopPropagation();
    }
  }

  /**
   * Check if current user can edit this post
   */
  canEdit(): boolean {
    // Current user ID is 1
    const currentUserId = 1;

    // User can edit if post belongs to user or is custom post
    return this.post.userId === currentUserId || this.post.id >= 10001;
  }

  /**
   * Check if current user can delete this post
   */
  canDelete(): boolean {
    // Current user ID is 1
    const currentUserId = 1;

    // User can delete if post belongs to user or is custom post
    return this.post.userId === currentUserId || this.post.id >= 10001;
  }

  /**
   * Get tooltip text for edit button
   */
  getEditTooltip(): string {
    return this.canEdit()
      ? 'Editar este post'
      : 'Solo puedes editar posts que hayas creado';
  }

  /**
   * Get tooltip text for delete button
   */
  getDeleteTooltip(): string {
    return this.canDelete()
      ? 'Eliminar este post'
      : 'Solo puedes eliminar posts que hayas creado';
  }

  /**
   * Handle avatar image loading errors
   */
  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Set a fallback avatar using a more reliable service
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.post.user.name)}&background=3b82f6&color=fff&size=60`;
  }

  /**
   * Handle post image loading errors
   */
  onPostImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    // Set a placeholder image
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgdmlld0JveD0iMCAwIDQwMCAyNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTAwQzE3NSA5NC40NzcyIDE3OS40NzcgOTAgMTg1IDkwQzE5MC41MjMgOTAgMTk1IDk0LjQ3NzIgMTk1IDEwMEMxOTUgMTA1LjUyMyAxOTAuNTIzIDExMCAxODUgMTEwQzE3OS40NzcgMTEwIDE3NSAxMDUuNTIzIDE3NSAxMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xNTAgMTQwTDIwMCAxMjBMMjUwIDE2MEgxNTBWMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
    // Remove error handler to prevent infinite loop
    img.onerror = null;
  }
}
