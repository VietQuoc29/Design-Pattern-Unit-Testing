import {
  FileWriter,
  CompressionDecorator,
  EncryptionDecorator,
  ChecksumDecorator,
  DataWriter,
} from './streamDecorator';

describe('Data Stream Decorator', () => {

  // ── Concrete Component ──────────────────────────────
  describe('FileWriter (base component)', () => {
    it('prepend FILE: to the written data', () => {
      expect(new FileWriter().write('hello')).toBe('FILE:hello');
    });

    it('handle empty string without error', () => {
      expect(new FileWriter().write('')).toBe('FILE:');
    });
  });

  // ── Individual Decorators ───────────────────────────
  describe('CompressionDecorator', () => {
    it('wrap data in COMPRESSED() before passing to the next layer', () => {
      const result = new CompressionDecorator(new FileWriter()).write('data');
      expect(result).toBe('FILE:COMPRESSED(data)');
    });

    it('delegate with the transformed payload', () => {
      const mockWriter: DataWriter = { write: jest.fn().mockReturnValue('ok') };
      new CompressionDecorator(mockWriter).write('payload');
      expect(mockWriter.write).toHaveBeenCalledWith('COMPRESSED(payload)');
    });
  });

  describe('EncryptionDecorator', () => {
    it('wrap data with the encryption key in the output string', () => {
      const result = new EncryptionDecorator(new FileWriter(), 'k1').write('data');
      expect(result).toBe('FILE:ENCRYPTED[k1](data)');
    });

    it('use the exact key string provided at construction', () => {
      const mockWriter: DataWriter = { write: jest.fn().mockReturnValue('') };
      new EncryptionDecorator(mockWriter, 'supersecret').write('msg');
      expect(mockWriter.write).toHaveBeenCalledWith('ENCRYPTED[supersecret](msg)');
    });

    it('different keys produce different encrypted output', () => {
      const w1 = new EncryptionDecorator(new FileWriter(), 'key-A').write('x');
      const w2 = new EncryptionDecorator(new FileWriter(), 'key-B').write('x');
      expect(w1).not.toBe(w2);
    });
  });

  describe('ChecksumDecorator', () => {
    it('append |cs=<length> to the data before delegating', () => {
      const mockWriter: DataWriter = { write: jest.fn().mockReturnValue('') };
      new ChecksumDecorator(mockWriter).write('hello');
      expect(mockWriter.write).toHaveBeenCalledWith('hello|cs=5');
    });

    it('calculate checksum based on original (pre-checksum) data length', () => {
      const mockWriter: DataWriter = { write: jest.fn().mockReturnValue('') };
      new ChecksumDecorator(mockWriter).write('ab');
      expect(mockWriter.write).toHaveBeenCalledWith('ab|cs=2');
    });
  });

  // ── Stacked Decorators ──────────────────────────────
  describe('Stacked Decorators', () => {
    it('Compress -> Encrypt -> File produces correct layered output', () => {
      const writer = new CompressionDecorator(
        new EncryptionDecorator(new FileWriter(), 'k1'));
      expect(writer.write('hi')).toBe('FILE:ENCRYPTED[k1](COMPRESSED(hi))');
    });

    it('Encrypt -> Compress -> File produces a different output (order matters)', () => {
      const compThenEnc = new EncryptionDecorator(
        new CompressionDecorator(new FileWriter()), 'k');
      const encThenComp = new CompressionDecorator(
        new EncryptionDecorator(new FileWriter(), 'k'));
      expect(compThenEnc.write('x')).not.toBe(encThenComp.write('x'));
    });

    it('Checksum -> Compress -> File: all three layers present in output', () => {
      const writer = new ChecksumDecorator(
        new CompressionDecorator(new FileWriter()));
      const result = writer.write('abc');
      expect(result).toContain('FILE:');
      expect(result).toContain('COMPRESSED');
      expect(result).toContain('cs=');
    });

    it('triple-stacked same decorator applies the transformation three times', () => {
      const writer = new CompressionDecorator(
        new CompressionDecorator(
          new CompressionDecorator(new FileWriter())));
      expect(writer.write('x')).toBe(
        'FILE:COMPRESSED(COMPRESSED(COMPRESSED(x)))');
    });
  });

});
