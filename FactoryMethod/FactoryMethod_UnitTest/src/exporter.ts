export interface Exporter {
  export(data: string[]): string;
  getFileExtension(): string;
}

// Concrete Products
export class PDFExporter implements Exporter {
  export(data: string[]): string   { return `PDF: ${data.join(', ')}`; }
  getFileExtension(): string       { return '.pdf'; }
}

export class CSVExporter implements Exporter {
  export(data: string[]): string   { return `CSV: ${data.join(';')}`; }
  getFileExtension(): string       { return '.csv'; }
}

export class ExcelExporter implements Exporter {
  export(data: string[]): string   { return `Excel: ${data.join('\t')}`; }
  getFileExtension(): string       { return '.xlsx'; }
}

// Creator (Abstract Factory)
export abstract class ExportFactory {
  abstract createExporter(): Exporter;

  exportToFile(data: string[]): { content: string; ext: string } {
    const exporter = this.createExporter();
    return {
      content: exporter.export(data),
      ext:     exporter.getFileExtension(),
    };
  }
}

// Concrete Creators
export class PDFExportFactory extends ExportFactory {
  createExporter(): Exporter { return new PDFExporter(); }
}

export class CSVExportFactory extends ExportFactory {
  createExporter(): Exporter { return new CSVExporter(); }
}

export class ExcelExportFactory extends ExportFactory {
  createExporter(): Exporter { return new ExcelExporter(); }
}
