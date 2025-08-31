import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, ChangeDetectionStrategy, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() closeModal = new EventEmitter<void>();

  private readonly elementRef = inject(ElementRef);
  private originalBodyStyle: string = '';

  ngOnInit(): void {
    // Add ESC key listener when modal opens
    if (this.isOpen) {
      this.addEventListeners();
      this.preventBodyScroll();
    }
  }

  ngOnDestroy(): void {
    this.removeEventListeners();
    this.restoreBodyScroll();
  }

  ngOnChanges(): void {
    if (this.isOpen) {
      this.addEventListeners();
      this.preventBodyScroll();
    } else {
      this.removeEventListeners();
      this.restoreBodyScroll();
    }
  }

  onClose(): void {
    this.closeModal.emit();
  }

  onOverlayClick(event: Event): void {
    // Click outside to close modal
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private addEventListeners(): void {
    // Pure JavaScript for ESC key handling
    document.addEventListener('keydown', this.onEscapeKey);
  }

  private removeEventListeners(): void {
    document.removeEventListener('keydown', this.onEscapeKey);
  }

  private onEscapeKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape' && this.isOpen) {
      this.onClose();
    }
  };

  private preventBodyScroll(): void {
    // Prevent layout shift when modal opens
    const scrollY = window.scrollY;
    const hasScrollbar = document.body.scrollHeight > window.innerHeight;
    const scrollBarWidth = hasScrollbar ? window.innerWidth - document.documentElement.clientWidth : 0;

    // Fix body position and compensate scrollbar width
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    this.originalBodyStyle = `position:${document.body.style.position};top:${document.body.style.top};width:${document.body.style.width};overflow:${document.body.style.overflow};padding-right:${document.body.style.paddingRight}`;
  }

  private restoreBodyScroll(): void {
    // Restore original scroll position and styles
    const scrollY = document.body.style.top;

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }
}
