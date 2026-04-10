import {
  Espresso,
  Drip,
  MilkDecorator,
  VanillaDecorator,
  ExtraShotDecorator,
  Coffee,
} from './coffeeDecorator';

describe('Coffee Order Builder (Decorator)', () => {

  // ── Concrete Components ─────────────────────────────
  describe('Base Drinks', () => {
    it('Espresso has correct description and cost', () => {
      const drink = new Espresso();
      expect(drink.getDescription()).toBe('Espresso');
      expect(drink.getCost()).toBe(1.50);
    });

    it('Drip has correct description and cost', () => {
      const drink = new Drip();
      expect(drink.getDescription()).toBe('Drip Coffee');
      expect(drink.getCost()).toBe(1.00);
    });
  });

  // ── Single Decorators ───────────────────────────────
  describe('Single Add-ons', () => {
    it('MilkDecorator appends ", Milk" and adds 0.25', () => {
      const drink = new MilkDecorator(new Espresso());
      expect(drink.getDescription()).toBe('Espresso, Milk');
      expect(drink.getCost()).toBeCloseTo(1.75);
    });

    it('VanillaDecorator appends ", Vanilla" and adds 0.50', () => {
      const drink = new VanillaDecorator(new Drip());
      expect(drink.getDescription()).toBe('Drip Coffee, Vanilla');
      expect(drink.getCost()).toBeCloseTo(1.50);
    });

    it('ExtraShotDecorator appends ", Extra Shot" and adds 0.75', () => {
      const drink = new ExtraShotDecorator(new Espresso());
      expect(drink.getDescription()).toBe('Espresso, Extra Shot');
      expect(drink.getCost()).toBeCloseTo(2.25);
    });
  });

  // ── Stacked Decorators ──────────────────────────────
  describe('Stacked Add-ons', () => {
    it('Espresso + Milk + Vanilla: description and cost accumulate correctly', () => {
      const drink = new VanillaDecorator(new MilkDecorator(new Espresso()));
      expect(drink.getDescription()).toBe('Espresso, Milk, Vanilla');
      expect(drink.getCost()).toBeCloseTo(2.25);
    });

    it('applying Milk twice doubles the milk cost', () => {
      const drink = new MilkDecorator(new MilkDecorator(new Espresso()));
      expect(drink.getDescription()).toBe('Espresso, Milk, Milk');
      expect(drink.getCost()).toBeCloseTo(2.00);
    });

    it('full order: Drip + Extra Shot + Vanilla + Milk = 2.50', () => {
      const drink = new MilkDecorator(
        new VanillaDecorator(
          new ExtraShotDecorator(new Drip())));
      expect(drink.getDescription()).toBe('Drip Coffee, Extra Shot, Vanilla, Milk');
      expect(drink.getCost()).toBeCloseTo(2.50);
    });

    it('different stacking order produces different description order', () => {
      const milkFirst    = new VanillaDecorator(new MilkDecorator(new Espresso()));
      const vanillaFirst = new MilkDecorator(new VanillaDecorator(new Espresso()));
      expect(milkFirst.getDescription()).toBe('Espresso, Milk, Vanilla');
      expect(vanillaFirst.getDescription()).toBe('Espresso, Vanilla, Milk');
      // But costs are equal regardless of order
      expect(milkFirst.getCost()).toBeCloseTo(vanillaFirst.getCost());
    });
  });

  // ── Mock Base ───────────────────────────────────────
  it('each decorator is independently testable with a mock base', () => {
    const mockCoffee: Coffee = {
      getDescription: jest.fn().mockReturnValue('Mock'),
      getCost:        jest.fn().mockReturnValue(1.00),
    };
    const drink = new ExtraShotDecorator(mockCoffee);
    expect(drink.getDescription()).toBe('Mock, Extra Shot');
    expect(drink.getCost()).toBeCloseTo(1.75);
    expect(mockCoffee.getDescription).toHaveBeenCalledTimes(1);
    expect(mockCoffee.getCost).toHaveBeenCalledTimes(1);
  });

});
