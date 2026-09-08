import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';

export interface ReceiptPanelField {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly emphasis?: boolean;
}

let receiptPanelSequence = 0;

const RECEIPT_PRINT_TOKENS = [
  '--receipt-paper-width',
  '--receipt-printable-width',
  '--receipt-print-padding',
  '--receipt-print-background',
  '--receipt-print-color',
  '--receipt-print-font-family',
  '--receipt-print-font-size',
  '--receipt-print-font-weight',
  '--receipt-print-letter-spacing',
  '--receipt-print-line-height',
] as const;

const RECEIPT_PRINT_STYLES = `
  @page {
    size: auto;
    margin: 0;
  }

  html,
  body {
    box-sizing: border-box;
    width: var(--receipt-paper-width, 58mm);
    min-width: var(--receipt-paper-width, 58mm);
    min-height: 0;
    margin: 0;
    padding: 0;
    overflow: visible;
    background: var(--receipt-print-background);
    color: var(--receipt-print-color);
  }

  body {
    padding-block: var(--receipt-print-padding, 1mm);
    padding-inline:
      calc(
        (
            var(--receipt-paper-width, 58mm) -
              var(--receipt-printable-width, 48mm)
          ) / 2
      );
  }

  pre {
    display: block;
    box-sizing: border-box;
    width: var(--receipt-printable-width, 48mm);
    margin: 0;
    overflow: visible;
    background: var(--receipt-print-background);
    color: var(--receipt-print-color);
    font-family: var(--receipt-print-font-family, 'Courier New', Courier, monospace);
    font-size: var(--receipt-print-font-size, 7pt);
    font-weight: var(--receipt-print-font-weight, 700);
    letter-spacing: var(--receipt-print-letter-spacing, 0);
    line-height: var(--receipt-print-line-height, 1.25);
    overflow-wrap: anywhere;
    white-space: pre-wrap;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
`;

/**
 * Organismo canónico para presentar e imprimir comprobantes térmicos.
 *
 * El contenido financiero permanece en el consumidor. Este componente aporta
 * la superficie responsive y crea un documento aislado de impresión de 58 mm.
 */
@Component({
  selector: 'app-receipt-panel, prest-receipt-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './receipt-panel.html',
  styleUrl: './receipt-panel.scss',
})
export class ReceiptPanel {
  readonly title = input('Comprobante');
  readonly titleId = input(`receipt-panel-title-${++receiptPanelSequence}`);
  readonly eyebrow = input('Operación confirmada');
  readonly subtitle = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly formatLabel = input('Tiquetera térmica de 58 mm');
  readonly fields = input<readonly ReceiptPanelField[]>([]);
  readonly printText = input('');

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  print(): boolean {
    const view = this.document.defaultView;
    const receiptText = this.printText();
    if (!view || receiptText.trim().length === 0) {
      return false;
    }

    const printWindow = view.open('', '_blank', 'popup=yes,width=420,height=640');
    if (!printWindow) {
      return false;
    }

    printWindow.opener = null;
    this.preparePrintDocument(printWindow, receiptText, view);

    const closePrintWindow = () => {
      printWindow.removeEventListener('afterprint', closePrintWindow);
      printWindow.close();
    };
    printWindow.addEventListener('afterprint', closePrintWindow, { once: true });

    printWindow.requestAnimationFrame(() => {
      printWindow.requestAnimationFrame(() => {
        if (printWindow.closed) {
          return;
        }

        try {
          void printWindow.document.body.offsetHeight;
          printWindow.focus();
          printWindow.print();
        } catch {
          closePrintWindow();
        }
      });
    });

    return true;
  }

  private preparePrintDocument(
    printWindow: Window,
    receiptText: string,
    sourceView: Window,
  ): void {
    const printDocument = printWindow.document;
    const sourceStyles = sourceView.getComputedStyle(this.host.nativeElement);

    printDocument.documentElement.lang = 'es';
    printDocument.title = this.title().trim() || 'Comprobante';

    for (const token of RECEIPT_PRINT_TOKENS) {
      const value = sourceStyles.getPropertyValue(token).trim();
      if (value) {
        printDocument.documentElement.style.setProperty(token, value);
      }
    }

    const charset = printDocument.createElement('meta');
    charset.setAttribute('charset', 'utf-8');

    const style = printDocument.createElement('style');
    style.textContent = RECEIPT_PRINT_STYLES;

    const receipt = printDocument.createElement('pre');
    receipt.textContent = receiptText;

    printDocument.head.replaceChildren(charset, style);
    printDocument.body.replaceChildren(receipt);
  }
}
