import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TextComponent } from '../../atoms/text/text.component';
import { IconButtonComponent } from '../../atoms/icon-button/icon-button.component';
import { Select2Component } from '../../molecules/select2/select2.component';

@Component({
  selector: 'app-data-pager',
  standalone: true,
  imports: [FormsModule, TextComponent, IconButtonComponent, Select2Component],
  template: `
    <div class="data-pager-container">
      <!-- Left: Page size & Total -->
      <div class="pager-group pager-left">
        <div class="pager-page-size-group">
          <app-text variant="body-sm" color="muted" weight="semibold">Registros por página:</app-text>
          <div class="page-size-select-wrapper">
            <app-select2 
              [options]="selectOptions()" 
              [ngModel]="pageSize" 
              (ngModelChange)="onPageSizeChange($event)"
              [searchable]="false">
            </app-select2>
          </div>
        </div>
        
        <app-text variant="body-sm" color="muted" weight="semibold">Total de registros: {{ total }}</app-text>
      </div>

      <!-- Right: Pagination Controls -->
      <div class="pager-group pager-right">
        <app-text variant="body-sm" color="muted" weight="semibold">Página {{ page }} de {{ totalPages() }}</app-text>
        
        <div class="pager-controls">
          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page === 1"
            (clicked)="goToPage(1)"
            title="Primera página"
          >
            <i class="fa-solid fa-angles-left"></i>
          </app-icon-button>
          
          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page === 1"
            (clicked)="goToPage(page - 1)"
            title="Página anterior"
          >
            <i class="fa-solid fa-angle-left"></i>
          </app-icon-button>
          
          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page === totalPages()"
            (clicked)="goToPage(page + 1)"
            title="Página siguiente"
          >
            <i class="fa-solid fa-angle-right"></i>
          </app-icon-button>
          
          <app-icon-button 
            size="sm" 
            variant="ghost" 
            [disabled]="page === totalPages()"
            (clicked)="goToPage(totalPages())"
            title="Última página"
          >
            <i class="fa-solid fa-angles-right"></i>
          </app-icon-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .data-pager-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: var(--space-3) var(--space-4);
      background: var(--surface-background);
      border: var(--border-width-thin) solid var(--border-color);
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-sm);
    }

    .pager-group {
      display: flex;
      align-items: center;
      gap: var(--space-5);
    }

    .pager-page-size-group {
      display: flex;
      align-items: center;
      gap: var(--space-2);
    }

    .page-size-select-wrapper {
      width: 4.375rem;
      --select2-min-width: 3.75rem;
    }

    .pager-controls {
      display: flex;
      align-items: center;
      gap: var(--space-1);
    }

    /* Modificamos el Select2 para que se vea más pequeño / compacto */
    ::ng-deep .page-size-select-wrapper app-select2 {
      width: 100%;
    }
    ::ng-deep .page-size-select-wrapper .select2-trigger {
      min-height: var(--control-height-sm) !important;
      height: var(--control-height-sm) !important;
      padding: 0 var(--space-2) !important;
      border-radius: var(--radius-sm);
      font-size: var(--text-sm);
      font-weight: 600;
    }
    ::ng-deep .page-size-select-wrapper .select2-value {
      line-height: var(--control-height-sm);
      margin: 0;
    }

    /* En pantallas móviles se apila */
    @media (max-width: 40rem) {
      .data-pager-container {
        flex-direction: column;
        gap: var(--space-4);
        align-items: flex-start;
      }
      .pager-group {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class DataPagerComponent {
  @Input() total = 0;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() pageSizeOptions = [5, 10, 20, 50];

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  selectOptions(): {value: number, label: string}[] {
    return this.pageSizeOptions.map(size => ({
      value: size,
      label: size.toString()
    }));
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages() && p !== this.page) {
      this.pageChange.emit(p);
    }
  }

  onPageSizeChange(newSize: number | string): void {
    const size = typeof newSize === 'string' ? parseInt(newSize, 10) : newSize;
    if (size !== this.pageSize) {
      this.pageSizeChange.emit(size);
    }
  }
}
