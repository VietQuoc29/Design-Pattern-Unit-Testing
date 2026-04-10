// Component Interface
export interface Coffee {
  getDescription(): string;
  getCost(): number;
}

// Concrete Components – base drinks
export class Espresso implements Coffee {
  getDescription(): string { return 'Espresso'; }
  getCost(): number        { return 1.50; }
}

export class Drip implements Coffee {
  getDescription(): string { return 'Drip Coffee'; }
  getCost(): number        { return 1.00; }
}

// Base Decorator – forwards both methods by default
export abstract class CoffeeDecorator implements Coffee {
  constructor(protected coffee: Coffee) {}
  getDescription(): string { return this.coffee.getDescription(); }
  getCost(): number        { return this.coffee.getCost(); }
}

// Concrete Decorators – each adds exactly one add-on
export class MilkDecorator extends CoffeeDecorator {
  getDescription(): string { return `${super.getDescription()}, Milk`; }
  getCost(): number        { return super.getCost() + 0.25; }
}

export class VanillaDecorator extends CoffeeDecorator {
  getDescription(): string { return `${super.getDescription()}, Vanilla`; }
  getCost(): number        { return super.getCost() + 0.50; }
}

export class ExtraShotDecorator extends CoffeeDecorator {
  getDescription(): string { return `${super.getDescription()}, Extra Shot`; }
  getCost(): number        { return super.getCost() + 0.75; }
}
