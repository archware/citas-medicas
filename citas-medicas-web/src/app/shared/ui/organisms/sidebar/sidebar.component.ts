import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { ScrollOverlayComponent } from '../scroll-overlay/scroll-overlay.component';

export interface SidebarMenuItem {
  id?: string;
  label: string;
  icon: string;
  iconColor?: string;
  active?: boolean;
  route?: string;
  badge?: string | number;
  children?: SidebarMenuItem[];
  expanded?: boolean;
}

export interface SidebarUser {
  name: string;
  role: string;
  initials?: string;
  photo?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AvatarComponent, NgTemplateOutlet, ScrollOverlayComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Menu items to display */
  @Input() menuItems: SidebarMenuItem[] = [];

  /** Current user information */
  @Input() user?: SidebarUser | null;

  /** Check if the sidebar is expanded (visual mode) */
  @Input() collapsed = false;

  /** Logo text */
  @Input() logoText = 'Atomic UI';

  /** Logo icon */
  @Input() logoIcon = 'fa-solid fa-atom';

  /** Event emitted when a menu item is clicked */
  @Output() navigate = new EventEmitter<SidebarMenuItem>();

  private readonly expansionOverrides = new Map<string, boolean>();

  onItemClick(item: SidebarMenuItem): void {
    if (this.hasChildren(item)) {
      this.expansionOverrides.set(this.itemKey(item), !this.isExpanded(item));
      return;
    }
    this.navigate.emit(item);
  }

  hasChildren(item: SidebarMenuItem): boolean {
    return (item.children?.length ?? 0) > 0;
  }

  isExpanded(item: SidebarMenuItem): boolean {
    const override = this.expansionOverrides.get(this.itemKey(item));
    if (override !== undefined) {
      return override;
    }
    return item.expanded ?? this.containsActiveItem(item);
  }

  itemKey(item: SidebarMenuItem): string {
    return item.id ?? item.route ?? item.label;
  }

  handleKeydown(event: KeyboardEvent): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const items = Array.from(
      this.host.nativeElement.querySelectorAll<HTMLElement>('.sidebar-nav .nav-link'),
    );
    if (!items.length) return;

    const activeIndex = Math.max(
      items.indexOf(this.host.nativeElement.ownerDocument.activeElement as HTMLElement),
      0,
    );
    let nextIndex: number | undefined;

    switch (event.key) {
      case 'ArrowDown':
        nextIndex = (activeIndex + 1) % items.length;
        break;
      case 'ArrowUp':
        nextIndex = (activeIndex - 1 + items.length) % items.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = items.length - 1;
        break;
    }

    if (nextIndex !== undefined) {
      items[nextIndex]?.focus();
      event.preventDefault();
    }
  }

  private containsActiveItem(item: SidebarMenuItem): boolean {
    return !!item.active || !!item.children?.some((child) => this.containsActiveItem(child));
  }
}
