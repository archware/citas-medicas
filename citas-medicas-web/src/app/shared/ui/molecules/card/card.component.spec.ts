import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    fixture.detectChanges();
  });

  it('allows the container and body to shrink around responsive content', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(getComputedStyle(host).minWidth).toBe('0px');
    expect(getComputedStyle(host.querySelector('.card') as HTMLElement).minWidth).toBe('0px');
    expect(getComputedStyle(host.querySelector('.card__body') as HTMLElement).minWidth).toBe('0px');
  });
});
