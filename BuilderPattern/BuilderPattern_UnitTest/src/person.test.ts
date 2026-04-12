import { PersonBuilder } from './person';

describe('PersonBuilder', () => {
  it('Creates a person with the specified values', () => {
    const person = new PersonBuilder()
      .withFirstName('Quoc1')
      .withLastName('Tran1')
      .withAge(28)
      .withEmail('quoc1@gmail.com')
      .build();

    expect(person.firstName).toBe('Quoc1');
    expect(person.lastName).toBe('Tran1');
    expect(person.age).toBe(28);
    expect(person.email).toBe('quoc1@gmail.com');
  });

  it('Creates a person with the default values', () => {
    const person = new PersonBuilder().build();

    expect(person.firstName).toBe('Quoc');
    expect(person.lastName).toBe('Tran');
    expect(person.age).toBe(20);
    expect(person.email).toBe('quoc@gmail.com');
  });

  it('Creates a person with some customized values', () => {
    const person = new PersonBuilder()
      .withFirstName('Quoc2')
      .withAge(25)
      .build();

    expect(person.firstName).toBe('Quoc2');
    expect(person.age).toBe(25);
    expect(person.lastName).toBe('Tran'); // default
    expect(person.email).toBe('quoc@gmail.com'); // default
  });

  it('Creates different people with unique values', () => {
    const person1 = new PersonBuilder().withFirstName('Quoc1').build();
    const person2 = new PersonBuilder().withFirstName('Quoc2').build();

    expect(person1.firstName).toBe('Quoc1');
    expect(person2.firstName).toBe('Quoc2');
  });
});
