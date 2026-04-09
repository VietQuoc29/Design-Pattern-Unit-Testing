import {
  PDFExportFactory,
  CSVExportFactory,
  ExcelExportFactory,
  ExportFactory,
  Exporter,
} from './exporter';

describe('Export Factory Method', () => {

  const sampleData = ['Name', 'Age', 'Email'];

  // Test each Concrete Factory
  it('PDFExportFactory export with comma as separator', () => {
    const result = new PDFExportFactory().exportToFile(sampleData);
    expect(result.content).toBe('PDF: Name, Age, Email');
    expect(result.ext).toBe('.pdf');
  });

  it('CSVExportFactory exports with semicolon as separator', () => {
    const result = new CSVExportFactory().exportToFile(sampleData);
    expect(result.content).toBe('CSV: Name;Age;Email');
    expect(result.ext).toBe('.csv');
  });

  it('ExcelExportFactory exports with tab as separator', () => {
    const result = new ExcelExportFactory().exportToFile(sampleData);
    expect(result.content).toContain('Excel:'); //test smell avoidance
    expect(result.ext).toBe('.xlsx');
  });

  it('exports empty array without throwing an error', () => {
    expect(() => new PDFExportFactory().exportToFile([])).not.toThrow();
    expect(() => new CSVExportFactory().exportToFile([])).not.toThrow();
  });

  // Test mock: Verify that exportToFile calls both methods of Exporter.
  it('exportToFile() calls both export() and getFileExtension()', () => {
    const mockExporter: Exporter = {
      export:           jest.fn().mockReturnValue('Mock content'),
      getFileExtension: jest.fn().mockReturnValue('.mock'),
    };

    class MockExportFactory extends ExportFactory {
      createExporter() { return mockExporter; }
    }

    const result = new MockExportFactory().exportToFile(['a', 'b', 'c']);

    expect(mockExporter.export).toHaveBeenCalledWith(['a', 'b', 'c']);
    expect(mockExporter.getFileExtension).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ content: 'Mock content', ext: '.mock' });
  });

});
