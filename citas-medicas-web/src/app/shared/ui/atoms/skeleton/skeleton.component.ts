import { ChangeDetectionStrategy, Component, Input } from '@angular/core';


@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
  template: `
    @switch (variant) {
      @case ('text') {
        <div class="skeleton skeleton-text" [style.width]="width" [style.height]="height || 'var(--space-4)'"></div>
      }
      @case ('circular') {
        <div class="skeleton skeleton-circular" [style.width]="width || 'var(--space-8)'" [style.height]="height || 'var(--space-8)'"></div>
      }
      @case ('rectangular') {
        <div class="skeleton skeleton-rectangular" [style.width]="width || '100%'" [style.height]="height || 'var(--skeleton-rectangular-block-size)'"></div>
      }
      @case ('card') {
        <div class="skeleton-card">
          <div class="skeleton skeleton-rectangular skeleton-card-media"></div>
          <div class="skeleton-card-content">
            <div class="skeleton skeleton-text skeleton-card-title"></div>
            <div class="skeleton skeleton-text skeleton-card-line"></div>
            <div class="skeleton skeleton-text skeleton-card-line-short"></div>
          </div>
        </div>
      }
      @case ('avatar-text') {
        <div class="skeleton-avatar-text">
          <div class="skeleton skeleton-circular skeleton-avatar"></div>
          <div class="skeleton-text-group">
            <div class="skeleton skeleton-text skeleton-avatar-title"></div>
            <div class="skeleton skeleton-text skeleton-avatar-subtitle"></div>
          </div>
        </div>
      }
      @default {
        <div class="skeleton" [style.width]="width" [style.height]="height"></div>
      }
    }
  `,
  styles: [`
    /* Host display block needed for % widths to work */
    :host {
      display: block;
      width: 100%;
    }

    .skeleton {
      background: linear-gradient(90deg,
        var(--skeleton-gradient-start) 25%,
        var(--skeleton-gradient-mid) 50%,
        var(--skeleton-gradient-start) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite ease-in-out;
      border-radius: var(--radius-sm);
    }

    .skeleton-text {
      height: var(--space-4);
      border-radius: var(--radius-sm);
    }

    .skeleton-circular {
      border-radius: 50%;
    }

    .skeleton-rectangular {
      border-radius: var(--radius-md);
    }

    .skeleton-card-media {
      block-size: var(--skeleton-card-media-block-size);
    }

    .skeleton-card-title {
      inline-size: var(--skeleton-card-title-inline-size);
      block-size: var(--space-4);
    }

    .skeleton-card-line {
      inline-size: var(--skeleton-card-line-inline-size);
      block-size: var(--space-3);
    }

    .skeleton-card-line-short {
      inline-size: var(--skeleton-card-line-short-inline-size);
      block-size: var(--space-3);
    }

    .skeleton-avatar {
      inline-size: var(--skeleton-avatar-size);
      block-size: var(--skeleton-avatar-size);
      flex: 0 0 var(--skeleton-avatar-size);
    }

    .skeleton-avatar-title {
      inline-size: var(--skeleton-avatar-title-inline-size);
      block-size: var(--text-sm);
    }

    .skeleton-avatar-subtitle {
      inline-size: var(--skeleton-avatar-subtitle-inline-size);
      block-size: var(--space-3);
    }

    .skeleton-card {
      background: var(--skeleton-card-bg);
      border: 1px solid var(--skeleton-card-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .skeleton-card-content {
      padding: var(--space-4);
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .skeleton-avatar-text {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .skeleton-text-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
        background-position: 0 0;
      }
    }

    /*
     * Dark mode se maneja automáticamente via tokens semánticos.
     * --skeleton-gradient-start/mid y --skeleton-card-bg/border
     * ya tienen valores apropiados para temas oscuros.
     */
  `]
})
export class SkeletonComponent {
  @Input() variant: 'text' | 'circular' | 'rectangular' | 'card' | 'avatar-text' = 'text';
  @Input() width?: string;
  @Input() height?: string;
}
