1. # **Builder Pattern**

   1. ## **Definition**

The Builder Pattern is a creational design pattern used to build complex objects step-by-step. Instead of creating an object with all its parameters at once (via the constructor), the Builder Pattern allows you to build the object property by property, offering greater flexibility and readability.

2. ## **Structure**

Builder Pattern consists of four main components:

- Product**:** The final object needs to be created.  
- Builder**:** The class is responsible for building the Product.  
- Director (optional): Construction process control layer  
- Chaining Methods: The methods in Builder return themselves to allow method chaining.

  3. ## **Applicability**

- Get rid of a “telescoping constructor”.  
- Want your code to be able to create different representations of some product.  
- Construct Composite trees or other complex objects.

  4. ## **Pros and Cons**

| Prospects | Consequences |
| :---- | :---- |
| Single Responsibility Principle | The overall complexity of the code increases since the pattern requires creating multiple new classes |
| Can construct objects step-by-step, defer construction steps or run steps recursively |  |
| Can reuse the same construction code when building various representations of products |  |

# 

2. # **Ex1 \- Email Builder**

## **Describe**

Create a Builder for the Email object with the following attributes: to, subject, body, cc. Use the default values ​​to test different scenarios.

## **Source code: email.ts**

export interface Email {  
  to: string;  
  subject: string;  
  body: string;  
  cc?: string;  
}

export class EmailBuilder {  
  private email: Email \= {  
    to: 'user@gmail.com',  
    subject: 'Hello',  
    body: 'Test',  
    cc: undefined  
  };

  withTo(to: string): EmailBuilder {  
    this.email.to \= to;  
    return this;  
  }

  withSubject(subject: string): EmailBuilder {  
    this.email.subject \= subject;  
    return this;  
  }

  withBody(body: string): EmailBuilder {  
    this.email.body \= body;  
    return this;  
  }

  withCc(cc: string): EmailBuilder {  
    this.email.cc \= cc;  
    return this;  
  }

  build(): Email {  
    return { ...this.email };  
  }  
}

## **Source code: email.test.ts**

import { EmailBuilder } from './email';

describe('EmailBuilder', () \=\> {  
  it('Creates an email with the specified values', () \=\> {  
    const email \= new EmailBuilder()  
      .withTo('quoc@gmail.com')  
      .withSubject('Meeting')  
      .withBody('Let\\'s meet tomorrow')  
      .withCc('manager@gmail.com')  
      .build();

    expect(email.to).toBe('quoc@gmail.com');  
    expect(email.subject).toBe('Meeting');  
    expect(email.body).toBe('Let\\'s meet tomorrow');  
    expect(email.cc).toBe('manager@gmail.com');  
  });

  it('Creates an email with the default values', () \=\> {  
    const email \= new EmailBuilder().build();

    expect(email.to).toBe('user@gmail.com');  
    expect(email.subject).toBe('Hello');  
    expect(email.body).toBe('Test');  
    expect(email.cc).toBeUndefined();  
  });

  it('Creates an email without CC', () \=\> {  
    const email \= new EmailBuilder()  
      .withTo('test@gmail.com')  
      .withSubject('Test')  
      .withBody('Test')  
      .build();

    expect(email.to).toBe('test@gmail.com');  
    expect(email.cc).toBeUndefined();  
  });

  it('Creates different emails with unique values', () \=\> {  
    const welcomeEmail \= new EmailBuilder()  
      .withSubject('Welcome')  
      .withBody('Hello\!')  
      .build();

    const alertEmail \= new EmailBuilder()  
      .withSubject('Alert')  
      .withBody('Alert\!')  
      .withCc('admin@gmail.com')  
      .build();

    expect(welcomeEmail.subject).toBe('Welcome');  
    expect(alertEmail.cc).toBe('admin@gmail.com');  
  });  
});

3. # **Ex2 \- Person Builder**

## **Describe**

Create a Builder object for Person with the following attributes: firstName, lastName, age, and email. Use the default values ​​to test different scenarios.

## **Source code: person.ts**

export interface Person {  
  firstName: string;  
  lastName: string;  
  age: number;  
  email: string;  
}

export class PersonBuilder {  
  private person: Person \= {  
    firstName: 'Quoc',  
    lastName: 'Tran',  
    age: 20,  
    email: 'quoc@gmail.com'  
  };

  withFirstName(firstName: string): PersonBuilder {  
    this.person.firstName \= firstName;  
    return this;  
  }

  withLastName(lastName: string): PersonBuilder {  
    this.person.lastName \= lastName;  
    return this;  
  }

  withAge(age: number): PersonBuilder {  
    this.person.age \= age;  
    return this;  
  }

  withEmail(email: string): PersonBuilder {  
    this.person.email \= email;  
    return this;  
  }

  build(): Person {  
    return { ...this.person };  
  }  
}

## **Source code: person.test.ts**

import { PersonBuilder } from './person';

describe('PersonBuilder', () \=\> {  
  it('Creates a person with the specified values', () \=\> {  
    const person \= new PersonBuilder()  
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

  it('Creates a person with the default values', () \=\> {  
    const person \= new PersonBuilder().build();

    expect(person.firstName).toBe('Quoc');  
    expect(person.lastName).toBe('Tran');  
    expect(person.age).toBe(20);  
    expect(person.email).toBe('quoc@gmail.com');  
  });

  it('Creates a person with some customized values', () \=\> {  
    const person \= new PersonBuilder()  
      .withFirstName('Quoc2')  
      .withAge(25)  
      .build();

    expect(person.firstName).toBe('Quoc2');  
    expect(person.age).toBe(25);  
    expect(person.lastName).toBe('Tran'); // default  
    expect(person.email).toBe('quoc@gmail.com'); // default  
  });

  it('Creates different people with unique values', () \=\> {  
    const person1 \= new PersonBuilder().withFirstName('Quoc1').build();  
    const person2 \= new PersonBuilder().withFirstName('Quoc2').build();

    expect(person1.firstName).toBe('Quoc1');  
    expect(person2.firstName).toBe('Quoc2');  
  });  
});

4. # **Ex3 \- Product Builder**

## **Describe**

Create a Builder object for the Product object with the following attributes: name, price, and stock. Use the default values ​​to test different scenarios.

## **Source code: product.ts**

export interface Product {  
  name: string;  
  price: number;  
  stock: number;  
}

export class ProductBuilder {  
  private product: Product \= {  
    name: 'Keyboard',  
    price: 0,  
    stock: 0  
  };

  withName(name: string): ProductBuilder {  
    this.product.name \= name;  
    return this;  
  }

  withPrice(price: number): ProductBuilder {  
    this.product.price \= price;  
    return this;  
  }

  withStock(stock: number): ProductBuilder {  
    this.product.stock \= stock;  
    return this;  
  }

  build(): Product {  
    return { ...this.product };  
  }  
}

## **Source code: product.test.ts**

import { ProductBuilder } from './product';

describe('ProductBuilder', () \=\> {  
  it('Creates a product with the specified values', () \=\> {  
    const product \= new ProductBuilder()  
      .withName('Laptop')  
      .withPrice(999)  
      .withStock(10)  
      .build();

    expect(product.name).toBe('Laptop');  
    expect(product.price).toBe(999);  
    expect(product.stock).toBe(10);  
  });

  it('Creates a product with the default values', () \=\> {  
    const product \= new ProductBuilder().build();

    expect(product.name).toBe('Keyboard');  
    expect(product.price).toBe(0);  
    expect(product.stock).toBe(0);  
  });

  it('Creates a product with some customized values', () \=\> {  
    const product \= new ProductBuilder()  
      .withName('Mouse')  
      .withPrice(25)  
      .build();

    expect(product.name).toBe('Mouse');  
    expect(product.price).toBe(25);  
    expect(product.stock).toBe(0); // default  
  });  
});  
