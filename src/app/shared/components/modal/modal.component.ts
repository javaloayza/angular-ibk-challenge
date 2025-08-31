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
  private lastScrollY = 0;
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
    // Guardar posición actual del scroll
    this.lastScrollY = window.scrollY;

    // Aplicar los estilos en el siguiente frame para evitar el salto visual
    requestAnimationFrame(() => {
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      // Bloquear scroll del body y compensar barra de scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${this.lastScrollY}px`;
      document.body.style.left = '0';
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
    });
  }

  private restoreBodyScroll(): void {
    // Temporarily disable smooth scrolling behavior
    document.documentElement.style.scrollBehavior = 'auto';

    // Restore original body styles and scroll position
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';

    // Restore scroll position instantly
    window.scrollTo({ top: this.lastScrollY, behavior: 'auto' });

    // Re-enable smooth scrolling behavior
    document.documentElement.style.scrollBehavior = '';
  }

}
