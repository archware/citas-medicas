import { Component, Input, forwardRef, signal, computed, ElementRef, HostListener, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FloatingInputComponent, FloatingInputVariant } from '../../atoms/floating-input/floating-input.component';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  imports: [CommonModule, FloatingInputComponent, DatePipe],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true
    },
    DatePipe
  ],
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css']
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() variant: FloatingInputVariant = 'floating';
  @Input() error = '';
  @Input() disabled = false;

  // State
  isOpen = signal(false);
  value = signal<Date | null>(null);
  currentViewDate = signal(new Date()); // Controls which month/year is visible
  currentView = signal<'day' | 'month' | 'year'>('day');

  // Constants
  weekDays = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
  months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  // CVA Callbacks
  onChange: (value: Date | null) => void = () => { };
  onTouched: () => void = () => { };

  private readonly elementRef = inject(ElementRef);
  private readonly datePipe = inject(DatePipe);

  // Computed Properties
  formattedValue = computed(() => {
    const v = this.value();
    return v ? this.datePipe.transform(v, 'dd/MM/yyyy') || '' : '';
  });

  daysInMonth = computed(() => {
    const view = this.currentViewDate();
    const year = view.getFullYear();
    const month = view.getMonth();
    const days = new Date(year, month + 1, 0).getDate();

    const result: Date[] = [];
    for (let i = 1; i <= days; i++) {
      result.push(new Date(year, month, i));
    }
    return result;
  });

  emptyPrefixDays = computed(() => {
    const view = this.currentViewDate();
    const firstDayOfMonth = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    // Create an array of empty items just for looping in template
    return new Array(firstDayOfMonth);
  });

  // Generate range of years for the year view (12 years around current view date)
  yearsList = computed(() => {
    const currentYear = this.currentViewDate().getFullYear();
    const startYear = currentYear - 5;
    const years: number[] = [];
    for (let i = 0; i < 12; i++) {
      years.push(startYear + i);
    }
    return years;
  });

  // Methods
  toggle() {
    if (this.disabled) return;
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      // If we have a value, jump view to that value's month
      if (this.value()) {
        const val = new Date(this.value()!);
        this.currentViewDate.set(val);
      }
      this.currentView.set('day'); // Reset to day view on open
    } else {
      this.onTouched();
    }
  }

  close() {
    this.isOpen.set(false);
    this.onTouched();
  }

  prev(e: Event) {
    e.stopPropagation();
    const d = new Date(this.currentViewDate());
    const view = this.currentView();

    if (view === 'day') {
      d.setMonth(d.getMonth() - 1);
    } else if (view === 'month') {
      d.setFullYear(d.getFullYear() - 1);
    } else if (view === 'year') {
      d.setFullYear(d.getFullYear() - 12);
    }

    this.currentViewDate.set(d);
  }

  next(e: Event) {
    e.stopPropagation();
    const d = new Date(this.currentViewDate());
    const view = this.currentView();

    if (view === 'day') {
      d.setMonth(d.getMonth() + 1);
    } else if (view === 'month') {
      d.setFullYear(d.getFullYear() + 1);
    } else if (view === 'year') {
      d.setFullYear(d.getFullYear() + 12);
    }

    this.currentViewDate.set(d);
  }

  // View Switching
  setView(view: 'day' | 'month' | 'year', e?: Event) {
    if (e) e.stopPropagation();
    this.currentView.set(view);
  }

  // Selection Methods
  selectDate(date: Date) {
    this.value.set(date);
    this.onChange(date);
    this.isOpen.set(false);
    this.onTouched();
  }

  selectMonth(monthIndex: number) {
    const d = new Date(this.currentViewDate());
    d.setMonth(monthIndex);
    this.currentViewDate.set(d);
    this.currentView.set('day');
  }

  selectYear(year: number) {
    const d = new Date(this.currentViewDate());
    d.setFullYear(year);
    this.currentViewDate.set(d);
    this.currentView.set('month'); // Go to month selection after year, or day? Let's go to day for faster flow.
    // Actually, usually Year -> Month -> Day. Let's send to Month view to be safe/granular, or Day if month is assumed.
    // Let's go to Month view as it allows refining the month.
    this.currentView.set('month');
    // Wait, user might want to keep the same month. Let's go to 'day' view directly to check the date?
    // Standard pattern: Year > Month > Date. If I select 2025, I likely want to select the month next. 
    // But if I already had a month selected, maybe I just updated the year.
    // Let's stick to Month view for now so user confirms month.
  }

  onKeyDown(event: KeyboardEvent, day?: Date): void {
    if (this.disabled) return;

    if (!this.isOpen()) {
      if (event.key === 'Enter' || event.key === ' ') {
        this.toggle();
        event.preventDefault();
      }
      return;
    }

    if (this.currentView() !== 'day') {
      if (event.key === 'Escape') {
        this.close();
        this.elementRef.nativeElement.querySelector('.datepicker-trigger')?.focus();
      }
      return;
    }

    const d = new Date(day || this.value() || new Date());

    switch (event.key) {
      case 'ArrowLeft':
        d.setDate(d.getDate() - 1);
        this.updateViewAndFocus(d);
        event.preventDefault();
        break;
      case 'ArrowRight':
        d.setDate(d.getDate() + 1);
        this.updateViewAndFocus(d);
        event.preventDefault();
        break;
      case 'ArrowUp':
        d.setDate(d.getDate() - 7);
        this.updateViewAndFocus(d);
        event.preventDefault();
        break;
      case 'ArrowDown':
        d.setDate(d.getDate() + 7);
        this.updateViewAndFocus(d);
        event.preventDefault();
        break;
      case 'Enter':
      case ' ':
        if (day) {
          this.selectDate(day);
          event.preventDefault();
        }
        break;
      case 'Escape':
        this.close();
        this.elementRef.nativeElement.querySelector('.datepicker-trigger')?.focus();
        event.preventDefault();
        break;
    }
  }

  private updateViewAndFocus(date: Date): void {
    // If month changed, update view date
    if (date.getMonth() !== this.currentViewDate().getMonth() ||
      date.getFullYear() !== this.currentViewDate().getFullYear()) {
      this.currentViewDate.set(new Date(date.getFullYear(), date.getMonth(), 1));
    }

    // Focus the new date after re-render
    setTimeout(() => {
      const dayEl = this.elementRef.nativeElement.querySelector(
        `.calendar-day[data-date="${date.getDate()}"]:not(.empty)`
      );
      if (dayEl) dayEl.focus();
    }, 0);
  }

  isSameDay(d1: Date, d2: Date): boolean {
    return d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear();
  }

  isSelected(date: Date): boolean {
    const v = this.value();
    if (!v) return false;
    return this.isSameDay(v, date);
  }

  isToday(date: Date): boolean {
    return this.isSameDay(new Date(), date);
  }

  // Click Outside Handling
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  // CVA Implementation
  writeValue(obj: Date | string | null): void {
    if (obj instanceof Date) {
      this.value.set(obj);
    } else if (typeof obj === 'string') {
      const d = new Date(obj);
      if (!isNaN(d.getTime())) {
        this.value.set(d);
      } else {
        this.value.set(null);
      }
    } else {
      this.value.set(null);
    }
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
