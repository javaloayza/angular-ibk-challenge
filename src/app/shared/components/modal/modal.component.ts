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
    // Click outside to close - JavaScript puro
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  private addEventListeners(): void {
    // JavaScript puro para ESC key
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
    // JavaScript puro para prevenir scroll
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyScroll(): void {
    document.body.style.overflow = '';
  }
}
