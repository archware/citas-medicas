import { vi } from 'vitest';
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TopbarComponent } from './topbar.component';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopbarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TranslateService, useValue: { use: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
  });

  it('can hide optional language and notification controls', () => {
    component.showLanguageSwitcher = false;
    component.showNotifications = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-language-switcher')).toBeNull();
    expect(fixture.nativeElement.querySelector('.fa-bell')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-user-menu')).not.toBeNull();
  });

  it('passes the user role to the session menu', () => {
    component.showLanguageSwitcher = false;
    component.userRole = 'Administrador';
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.user-menu__trigger') as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.user-menu__role')?.textContent?.trim()).toBe(
      'Administrador',
    );
  });

  it('emits notification clicks', () => {
    component.showLanguageSwitcher = false;
    component.showNotifications = true;
    const notificationClick = vi.fn();
    component.notificationClick.subscribe(notificationClick);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('app-icon-button button');
    (buttons[1] as HTMLButtonElement).click();

    expect(notificationClick).toHaveBeenCalledTimes(1);
  });
});
