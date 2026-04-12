import {
  FormField,
  RequiredValidator,
  MinLengthValidator,
} from './formObserver';

describe('Form Validation Observer', () => {

  describe('RequiredValidator', () => {
    it('reports error when field value is empty', () => {
      const field     = new FormField('username');
      const validator = new RequiredValidator();
      field.subscribe(validator);
      field.setValue('');
      expect(validator.getErrors()).toContain('username is required');
    });

    it('reports error when value is only whitespace', () => {
      const field     = new FormField('username');
      const validator = new RequiredValidator();
      field.subscribe(validator);
      field.setValue('   ');
      expect(validator.getErrors()).toHaveLength(1);
    });

    it('clears error when a non-empty value is set', () => {
      const field     = new FormField('username');
      const validator = new RequiredValidator();
      field.subscribe(validator);
      field.setValue('');
      field.setValue('Quoc');
      expect(validator.getErrors()).toHaveLength(0);
    });
  });

  describe('MinLengthValidator', () => {
    it('reports error when value is shorter than the minimum', () => {
      const field     = new FormField('password');
      const validator = new MinLengthValidator(8);
      field.subscribe(validator);
      field.setValue('short');
      expect(validator.getErrors()[0]).toContain('at least 8 characters');
    });

    it('clears error when value meets the minimum length', () => {
      const field     = new FormField('password');
      const validator = new MinLengthValidator(8);
      field.subscribe(validator);
      field.setValue('longpassword123');
      expect(validator.getErrors()).toHaveLength(0);
    });

    it('exact minimum length passes validation', () => {
      const field     = new FormField('pin');
      const validator = new MinLengthValidator(4);
      field.subscribe(validator);
      field.setValue('1234');
      expect(validator.getErrors()).toHaveLength(0);
    });
  });

  describe('Multiple validators on the same field', () => {
    it('each validator reacts independently to the same value change', () => {
      const field     = new FormField('password');
      const required  = new RequiredValidator();
      const minLength = new MinLengthValidator(8);
      field.subscribe(required);
      field.subscribe(minLength);
      field.setValue('hi'); // not empty, but too short
      expect(required.getErrors()).toHaveLength(0);  // passes required
      expect(minLength.getErrors()).toHaveLength(1); // fails min length
    });

    it('all validators clear their errors when valid input is set', () => {
      const field     = new FormField('password');
      const required  = new RequiredValidator();
      const minLength = new MinLengthValidator(8);
      field.subscribe(required);
      field.subscribe(minLength);
      field.setValue('ValidPassword123');
      expect(required.getErrors()).toHaveLength(0);
      expect(minLength.getErrors()).toHaveLength(0);
    });
  });

  it('unsubscribed validator no longer receives field updates', () => {
    const field     = new FormField('name');
    const validator = new RequiredValidator();
    field.subscribe(validator);
    field.unsubscribe(validator);
    field.setValue('');
    expect(validator.getErrors()).toHaveLength(0);
  });

  it('setValue() calls onFieldChange with the correct field name and value', () => {
    const field   = new FormField('bio');
    const handler = jest.fn();
    field.subscribe({ onFieldChange: handler, getErrors: () => [] });
    field.setValue('Hello world');
    expect(handler).toHaveBeenCalledWith('bio', 'Hello world');
  });

});
