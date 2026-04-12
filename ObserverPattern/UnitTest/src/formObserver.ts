export interface FieldObserver {
  onFieldChange(fieldName: string, value: string): void;
  getErrors(): string[];
}

export class FormField {
  private value     = '';
  private observers: FieldObserver[] = [];

  constructor(public readonly name: string) {}

  subscribe(obs: FieldObserver): void {
    this.observers.push(obs);
  }

  unsubscribe(obs: FieldObserver): void {
    this.observers = this.observers.filter(o => o !== obs);
  }

  setValue(value: string): void {
    this.value = value;
    this.observers.forEach(o => o.onFieldChange(this.name, value));
  }

  getValue(): string { return this.value; }
}

// Concrete Validator Observers
export class RequiredValidator implements FieldObserver {
  private errors: string[] = [];
  onFieldChange(field: string, value: string): void {
    this.errors = value.trim() === '' ? [`${field} is required`] : [];
  }
  getErrors(): string[] { return [...this.errors]; }
}

export class MinLengthValidator implements FieldObserver {
  private errors: string[] = [];
  constructor(private min: number) {}
  onFieldChange(field: string, value: string): void {
    this.errors = value.length < this.min
      ? [`${field} must be at least ${this.min} characters`]
      : [];
  }
  getErrors(): string[] { return [...this.errors]; }
}
