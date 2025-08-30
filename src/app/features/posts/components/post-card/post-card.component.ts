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

  onCardClick(): void {
    this.postClick.emit(this.post);
  }
}
