// Component Interface
export interface DataWriter {
  write(data: string): string;
}

// Concrete Component – writes raw data with a FILE: prefix
export class FileWriter implements DataWriter {
  write(data: string): string {
    return `FILE:${data}`;
  }
}

// Base Decorator
export abstract class DataWriterDecorator implements DataWriter {
  constructor(protected wrapped: DataWriter) {}

  write(data: string): string {
    return this.wrapped.write(data);
  }
}

// Concrete Decorator 1 – Compression
export class CompressionDecorator extends DataWriterDecorator {
  write(data: string): string {
    const compressed = `COMPRESSED(${data})`;
    return super.write(compressed);
  }
}

// Concrete Decorator 2 – Encryption (key-based)
export class EncryptionDecorator extends DataWriterDecorator {
  constructor(wrapped: DataWriter, private key: string) { super(wrapped); }

  write(data: string): string {
    const encrypted = `ENCRYPTED[${this.key}](${data})`;
    return super.write(encrypted);
  }
}

// Concrete Decorator 3 – Checksum (append data length as checksum)
export class ChecksumDecorator extends DataWriterDecorator {
  write(data: string): string {
    const checksum = data.length;
    return super.write(`${data}|cs=${checksum}`);
  }
}
