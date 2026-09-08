import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { TableActionsComponent } from './table-actions.component';

describe('TableActionsComponent', () => {
  let component: TableActionsComponent;
  let fixture: ComponentFixture<TableActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableActionsComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TableActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('provides an accessible name for every icon action', () => {
    const buttons = fixture.nativeElement.querySelectorAll(
      '.action-btn',
    ) as NodeListOf<HTMLButtonElement>;

    expect(buttons.length).toBe(3);
    expect(Array.from(buttons).every((button) => !!button.getAttribute('aria-label'))).toBe(true);
  });

  it('emits view once through the native button click', () => {
    const view = vi.fn();
    component.view.subscribe(view);

    (fixture.nativeElement.querySelector('.action-btn.view') as HTMLButtonElement).click();

    expect(view).toHaveBeenCalledTimes(1);
  });
});
