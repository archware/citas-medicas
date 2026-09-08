import { Component, Input, Output, EventEmitter } from '@angular/core';

import { ScrollOverlayComponent } from '../../organisms/scroll-overlay/scroll-overlay.component';
import { FooterComponent } from '../../organisms/footer/footer.component';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [ScrollOverlayComponent, FooterComponent],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.css'
})
export class LayoutShellComponent {
  /** Whether the sidebar is visible */
  @Input() sidebarVisible = true;

  /** Sidebar width (default: 260px). Supports any CSS value: '260px', '25%', 'clamp(200px, 20%, 300px)' */
  @Input() sidebarWidth = '260px';

  /** Controls the canonical footer row outside the scroll viewport. */
  @Input() footerVisible = true;
  @Input() footerCompanyName = 'Company';
  @Input() footerYear = new Date().getFullYear();
  @Input() footerCopyrightText = 'Todos los derechos reservados.';
  @Input() footerShowVersion = true;
  @Input() footerVersion = 'v1.0.0';
  @Input() footerEnvironment = 'BETA';

  /** Event emitted when sidebar backdrop is clicked */
  @Output() closeSidebar = new EventEmitter<void>();

  onOverlayClick() {
    this.closeSidebar.emit();
  }
}
