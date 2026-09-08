import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  inject,
  input,
} from '@angular/core';

export interface PrintDocumentField {
  readonly id: string;
  readonly label: string;
  readonly value: string;
}

export interface PrintDocumentTableColumn {
  readonly key: string;
  readonly label: string;
  readonly align?: 'start' | 'center' | 'end';
}

export interface PrintDocumentTable {
  readonly caption: string;
  readonly columns: readonly PrintDocumentTableColumn[];
  readonly rows: readonly Readonly<Record<string, string>>[];
}

export interface PrintDocumentSection {
  readonly id: string;
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly fields?: readonly PrintDocumentField[];
  readonly table?: PrintDocumentTable;
}

export interface PrintDocumentPage {
  readonly id: string;
  readonly title: string;
  readonly eyebrow?: string;
  readonly subtitle?: string;
  readonly fields?: readonly PrintDocumentField[];
  readonly sections?: readonly PrintDocumentSection[];
  readonly signatures?: readonly string[];
  readonly footer?: string;
}

let printDocumentPanelSequence = 0;

const PRINT_DOCUMENT_TOKENS = [
  '--print-document-paper-background',
  '--print-document-paper-color',
  '--print-document-muted-color',
  '--print-document-border-color',
  '--print-document-accent-color',
  '--print-document-font-family',
] as const;

const PRINT_DOCUMENT_STYLES = `
  @page {
    size: A4 portrait;
    margin: 15mm;
  }

  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    background: var(--print-document-paper-background);
    color: var(--print-document-paper-color);
    font-family: var(--print-document-font-family, Arial, sans-serif);
    font-size: 10pt;
    line-height: 1.4;
  }

  .print-page {
    break-after: page;
    min-height: 260mm;
  }

  .print-page:last-child {
    break-after: auto;
  }

  .eyebrow,
  .subtitle,
  .footer {
    color: var(--print-document-muted-color);
  }

  .eyebrow {
    margin: 0 0 2mm;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    color: var(--print-document-accent-color);
    font-size: 18pt;
  }

  h2 {
    margin: 7mm 0 3mm;
    font-size: 12pt;
  }

  .subtitle {
    margin: 2mm 0 6mm;
  }

  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2mm 6mm;
    margin: 4mm 0;
  }

  dl div {
    border-bottom: 0.2mm solid var(--print-document-border-color);
    padding: 1.5mm 0;
  }

  dt {
    color: var(--print-document-muted-color);
    font-size: 8pt;
    font-weight: 700;
    text-transform: uppercase;
  }

  dd {
    margin: 1mm 0 0;
    overflow-wrap: anywhere;
    font-weight: 600;
  }

  p {
    margin: 0 0 3mm;
    text-align: justify;
  }

  table {
    width: 100%;
    margin-top: 3mm;
    border-collapse: collapse;
    font-size: 8pt;
  }

  caption {
    margin-bottom: 2mm;
    font-weight: 700;
    text-align: left;
  }

  th,
  td {
    border: 0.2mm solid var(--print-document-border-color);
    padding: 1.4mm;
    vertical-align: top;
  }

  th {
    background: color-mix(
      in srgb,
      var(--print-document-border-color) 45%,
      var(--print-document-paper-background)
    );
    text-align: left;
  }

  .align-center {
    text-align: center;
  }

  .align-end {
    text-align: right;
  }

  .signatures {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18mm;
    margin-top: 24mm;
  }

  .signature {
    border-top: 0.3mm solid var(--print-document-paper-color);
    padding-top: 2mm;
    text-align: center;
  }

  .footer {
    margin-top: 8mm;
    border-top: 0.2mm solid var(--print-document-border-color);
    padding-top: 2mm;
    font-size: 8pt;
  }
`;

@Component({
  selector: 'app-print-document-panel, prest-print-document-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './print-document-panel.html',
  styleUrl: './print-document-panel.scss',
})
export class PrintDocumentPanel {
  readonly title = input('Documentos');
  readonly titleId = input(`print-document-panel-title-${++printDocumentPanelSequence}`);
  readonly subtitle = input('');
  readonly ariaLabel = input<string | null>(null);
  readonly documents = input<readonly PrintDocumentPage[]>([]);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  print(): boolean {
    const view = this.document.defaultView;
    const documents = this.documents();
    if (!view || documents.length === 0) {
      return false;
    }

    const printWindow = view.open('', '_blank', 'popup=yes,width=960,height=720');
    if (!printWindow) {
      return false;
    }

    printWindow.opener = null;
    this.preparePrintDocument(printWindow, documents, view);

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
    documents: readonly PrintDocumentPage[],
    sourceView: Window,
  ): void {
    const target = printWindow.document;
    const sourceStyles = sourceView.getComputedStyle(this.host.nativeElement);
    target.documentElement.lang = 'es';

    for (const token of PRINT_DOCUMENT_TOKENS) {
      const value = sourceStyles.getPropertyValue(token).trim();
      if (value) {
        target.documentElement.style.setProperty(token, value);
      }
    }

    const charset = target.createElement('meta');
    charset.setAttribute('charset', 'utf-8');
    const style = target.createElement('style');
    style.textContent = PRINT_DOCUMENT_STYLES;
    target.head.replaceChildren(charset, style);
    target.title = this.title().trim() || 'Documentos';
    target.body.replaceChildren(...documents.map((document) => this.createPage(target, document)));
  }

  private createPage(target: Document, document: PrintDocumentPage): HTMLElement {
    const page = target.createElement('article');
    page.className = 'print-page';

    if (document.eyebrow) {
      page.append(this.textElement(target, 'p', document.eyebrow, 'eyebrow'));
    }
    page.append(this.textElement(target, 'h1', document.title));
    if (document.subtitle) {
      page.append(this.textElement(target, 'p', document.subtitle, 'subtitle'));
    }
    if (document.fields?.length) {
      page.append(this.createFields(target, document.fields));
    }

    for (const section of document.sections ?? []) {
      page.append(this.textElement(target, 'h2', section.heading));
      for (const paragraph of section.paragraphs ?? []) {
        page.append(this.textElement(target, 'p', paragraph));
      }
      if (section.fields?.length) {
        page.append(this.createFields(target, section.fields));
      }
      if (section.table) {
        page.append(this.createTable(target, section.table));
      }
    }

    if (document.signatures?.length) {
      const signatures = target.createElement('div');
      signatures.className = 'signatures';
      for (const label of document.signatures) {
        signatures.append(this.textElement(target, 'div', label, 'signature'));
      }
      page.append(signatures);
    }
    if (document.footer) {
      page.append(this.textElement(target, 'p', document.footer, 'footer'));
    }
    return page;
  }

  private createFields(
    target: Document,
    fields: readonly PrintDocumentField[],
  ): HTMLDListElement {
    const list = target.createElement('dl');
    for (const field of fields) {
      const row = target.createElement('div');
      row.append(
        this.textElement(target, 'dt', field.label),
        this.textElement(target, 'dd', field.value),
      );
      list.append(row);
    }
    return list;
  }

  private createTable(target: Document, data: PrintDocumentTable): HTMLTableElement {
    const table = target.createElement('table');
    table.append(this.textElement(target, 'caption', data.caption));

    const head = target.createElement('thead');
    const headRow = target.createElement('tr');
    for (const column of data.columns) {
      const cell = this.textElement(target, 'th', column.label);
      cell.className = this.alignmentClass(column.align);
      headRow.append(cell);
    }
    head.append(headRow);

    const body = target.createElement('tbody');
    for (const row of data.rows) {
      const tableRow = target.createElement('tr');
      for (const column of data.columns) {
        const cell = this.textElement(target, 'td', row[column.key] ?? '');
        cell.className = this.alignmentClass(column.align);
        tableRow.append(cell);
      }
      body.append(tableRow);
    }
    table.append(head, body);
    return table;
  }

  private textElement<K extends keyof HTMLElementTagNameMap>(
    target: Document,
    tag: K,
    text: string,
    className = '',
  ): HTMLElementTagNameMap[K] {
    const element = target.createElement(tag);
    element.textContent = text;
    element.className = className;
    return element;
  }

  private alignmentClass(align: PrintDocumentTableColumn['align']): string {
    return align && align !== 'start' ? `align-${align}` : '';
  }
}
