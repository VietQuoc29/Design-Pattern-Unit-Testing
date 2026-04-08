export interface Person {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
}

export class PersonBuilder {
  private person: Person = {
    firstName: 'Quoc',
    lastName: 'Tran',
    age: 20,
    email: 'quoc@gmail.com'
  };

  withFirstName(firstName: string): PersonBuilder {
    this.person.firstName = firstName;
    return this;
  }

  withLastName(lastName: string): PersonBuilder {
    this.person.lastName = lastName;
    return this;
  }

  withAge(age: number): PersonBuilder {
    this.person.age = age;
    return this;
  }

  withEmail(email: string): PersonBuilder {
    this.person.email = email;
    return this;
  }

  build(): Person {
    return { ...this.person };
  }
}
