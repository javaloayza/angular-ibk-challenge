import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-form.component.html',
  styleUrl: './post-form.component.scss'
})
export class PostFormComponent implements OnInit {
  private postService = inject(PostService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // Signals
  isEditMode = signal(false);
  isLoading = signal(false);
  postId = signal<number | null>(null);
  originalValues = signal<{title: string, body: string, userId: number} | null>(null);
  formValid = signal(false); // Signal to track form validity
  formChanged = signal(false); // Signal to track form changes in edit mode

  // Computed
  pageTitle = computed(() =>
    this.isEditMode() ? 'Editar Post' : 'Crear Nuevo Post'
  );

  // Method to detect changes in form (simplified)
  hasChanges(): boolean {
    if (!this.isEditMode() || !this.originalValues()) {
      return true; // In create mode always allow submit
    }

    const currentTitle = this.postForm.get('title')?.value?.trim() || '';
    const currentBody = this.postForm.get('body')?.value?.trim() || '';
    const currentUserId = this.postForm.get('userId')?.value;
    const original = this.originalValues()!;

    return currentTitle !== original.title ||
           currentBody !== original.body ||
           currentUserId !== original.userId;
  }

  // Custom validators
  private noProhibitedWords(control: AbstractControl): ValidationErrors | null {
    const prohibitedWords = ['spam', 'fake', 'scam', 'virus'];
    const value = control.value?.toLowerCase() || '';

    for (const word of prohibitedWords) {
      if (value.includes(word)) {
        return {
          prohibitedWord: {
            word,
            message: `No se permite la palabra "${word}"`
          }
        };
      }
    }
    return null;
  }

  // Form with enhanced validations
  postForm: FormGroup = this.fb.group({
    title: ['', [
      Validators.required,
      Validators.minLength(5),
      Validators.maxLength(100),
      this.noProhibitedWords
    ]],
    body: ['', [
      Validators.required,
      Validators.minLength(20),
      Validators.maxLength(1000),
      this.noProhibitedWords
    ]],
    userId: ['', [Validators.required, Validators.min(1), Validators.max(10)]]
  });

  ngOnInit() {
    // Setup form validations for both create and edit modes
    this.setupFormValidations();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.postId.set(Number(id));
      this.loadPost(Number(id));
      // En modo edición, configurar validación de cambios
      this.setupEditModeValidation();
    } else {
      // En modo creación, configurar validación campo por campo
      this.setupCreateModeValidation();
    }
  }

  private setupFormValidations() {
    // Initialize form validity signal
    this.formValid.set(this.postForm.valid);

    // Listen to form changes and update validity signal
    this.postForm.valueChanges.subscribe(() => {
      this.formValid.set(this.postForm.valid);
    });

    this.postForm.statusChanges.subscribe(() => {
      this.formValid.set(this.postForm.valid);
    });
  }

  private setupCreateModeValidation() {
    // En modo CREAR: Validación campo por campo (uno por uno)
    Object.keys(this.postForm.controls).forEach(fieldName => {
      const control = this.postForm.get(fieldName);
      control?.valueChanges.subscribe(() => {
        // Marcar solo este campo como touched cuando el usuario escribe
        if (!control.touched) {
          control.markAsTouched();
        }
      });
    });
  }

  private setupEditModeValidation() {
    // En modo EDITAR: Validación instantánea de todo el formulario
    this.postForm.valueChanges.subscribe(() => {
      if (this.originalValues()) {
        const hasChanges = this.hasChanges();
        this.formChanged.set(hasChanges);

        // Si hay cambios, activar validaciones INSTANTÁNEAMENTE en todo el formulario
        if (hasChanges) {
          this.markFormGroupTouched(this.postForm);
        }
      }
    });
  }

  private loadPost(id: number) {
    this.isLoading.set(true);

    this.postService.getPost(id).subscribe({
      next: (post) => {
        if (post) {
          const formValues = {
            title: post.title,
            body: post.body,
            userId: post.userId
          };

          this.postForm.patchValue(formValues);
          this.originalValues.set(formValues);

          this.postForm.markAsPristine();
          this.postForm.markAsUntouched();
          this.formValid.set(this.postForm.valid);
          this.formChanged.set(false); // Inicializar sin cambios
        } else {
          this.router.navigate(['/posts']);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading post:', error);
        this.isLoading.set(false);
        this.router.navigate(['/posts']);
      }
    });
  }

  onSubmit() {
    // En modo edición, verificar que hay cambios
    if (this.isEditMode() && !this.formChanged()) {
      return;
    }

    this.performSubmission();
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      control?.markAsTouched({ onlySelf: true });
    });
  }

  onCancel() {
    this.router.navigate(['/posts']);
  }

  // Helper methods for template
  getFieldError(fieldName: string): string {
    const field = this.postForm.get(fieldName);
    if (field?.errors && field.touched) {
      const errors = field.errors;

      if (errors['required']) {
        return fieldName === 'title' ? 'El título es requerido' :
               fieldName === 'body' ? 'El contenido es requerido' :
               'Este campo es requerido';
      }
      if (errors['minlength']) {
        return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
      }
      if (errors['maxlength']) {
        return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
      }
      if (errors['min']) return `Valor mínimo: ${errors['min'].min}`;
      if (errors['max']) return `Valor máximo: ${errors['max'].max}`;
      if (errors['prohibitedWord']) return errors['prohibitedWord'].message;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field?.invalid && field.touched);
  }

  isFieldValid(fieldName: string): boolean {
    const field = this.postForm.get(fieldName);
    return !!(field?.valid && field.touched);
  }

  readonly isSubmitEnabled = computed(() => {
    if (this.isLoading()) {
      return false;
    }

    // Use the reactive form validity signal
    const isFormValid = this.formValid();

    if (this.isEditMode()) {
      // En modo EDITAR: debe tener cambios Y ser válido
      return this.formChanged() && isFormValid;
    } else {
      // En modo CREAR: solo debe ser válido
      return isFormValid;
    }
  });

  getSubmitButtonTitle(): string {
    if (this.isLoading()) {
      return 'Guardando...';
    }

    if (this.isEditMode()) {
      if (!this.formChanged()) {
        return 'No hay cambios para guardar';
      }
      if (!this.formValid()) {
        return 'Corrige los errores para actualizar';
      }
      return 'Actualizar post';
    } else {
      if (!this.formValid()) {
        return 'Completa todos los campos requeridos';
      }
      return 'Crear post';
    }
  }


  private performSubmission() {
    // If we reach here, all validations are already passed
    this.isLoading.set(true);

    const postData: Omit<Post, 'id'> = {
      title: this.postForm.value.title.trim(),
      body: this.postForm.value.body.trim(),
      userId: this.postForm.value.userId
    };

    const operation$ = this.isEditMode()
      ? this.postService.updatePost(this.postId()!, { ...postData, id: this.postId()! })
      : this.postService.createPost(postData);

    operation$.subscribe({
      next: (result) => {
        this.isLoading.set(false);
        this.router.navigate(['/posts']);
      },
      error: (error) => {
        console.error('Error saving post:', error);
        this.isLoading.set(false);
      }
    });
  }

  // Debug method - can be called from browser console
  debugFormState() {
    console.log('🔍 FORM DEBUG INFO:');
    console.log('Form valid (direct):', this.postForm.valid);
    console.log('Form valid (signal):', this.formValid());
    console.log('Form changed (signal):', this.formChanged());
    console.log('Has changes (method):', this.hasChanges());
    console.log('Form touched:', this.postForm.touched);
    console.log('Is edit mode:', this.isEditMode());
    console.log('Is loading:', this.isLoading());
    console.log('Submit enabled:', this.isSubmitEnabled());
    console.log('Form values:', this.postForm.value);
    console.log('Original values:', this.originalValues());
    console.log('Form errors:', this.postForm.errors);
    console.log('Controls status:');
    Object.keys(this.postForm.controls).forEach(key => {
      const control = this.postForm.get(key);
      console.log(`  ${key}:`, {
        value: control?.value,
        valid: control?.valid,
        touched: control?.touched,
        errors: control?.errors
      });
    });
  }
}
