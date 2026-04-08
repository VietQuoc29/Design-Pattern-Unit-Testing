1. # **BUILDER PATTERN \- LÝ THUYẾT**

   1. ## **Định nghĩa**

Builder Pattern là một mẫu thiết kế creational pattern, được sử dụng để xây dựng các đối tượng phức tạp một cách từng bước. Thay vì tạo một đối tượng với tất cả các tham số cùng một lúc (thông qua constructor), Builder Pattern cho phép bạn xây dựng đối tượng từng thuộc tính một, với tính linh hoạt và dễ đọc cao.

Trong ngữ cảnh Unit Testing, Builder Pattern được sử dụng để tạo các đối tượng test fixture một cách dễ dàng và dễ bảo trì. Nó giúp giảm thiểu code boilerplate, cải thiện tính khả đọc của test cases, và làm cho việc tạo các biến thể của dữ liệu test trở nên đơn giản hơn.

2. ## **Cấu trúc**

Builder Pattern thường bao gồm các thành phần chính sau:

- Product**:** Đối tượng cuối cùng cần được tạo ra  
- Builder**:** Lớp chịu trách nhiệm xây dựng Product  
- Director (tuỳ chọn): Lớp điều khiển quá trình xây dựng  
- Chaining Methods: Các phương thức trong Builder trả về chính nó để cho phép method chaining

  3. ## **Sử dụng**

Builder Pattern đặc biệt hữu ích trong các tình huống sau:

- Tạo các đối tượng test fixture với nhiều thuộc tính tùy chọn  
- Cần tạo nhiều biến thể của cùng một đối tượng với các giá trị khác nhau  
- Muốn giảm thiểu số lượng constructor overloading hoặc parameterized constructors  
- Test cases cần dữ liệu phức tạp hoặc lồng nhau (nested objects)  
- Muốn làm cho test code dễ đọc và tự nhân diện (self-documenting)  
- Muốn tách biệt việc tạo object từ cách sử dụng nó

  4. ## **Ưu và nhược điểm**

| Ưu điểm | Nhược điểm |
| :---- | :---- |
| Tính dễ đọc | Tăng độ phức tạp |
| Linh hoạt với giá trị mặc định | Lệnh gọi hàm dài |
| Loại bỏ constructor overloading | State mutability |
| Dễ bảo trì |  |

# 

2. # **Ví dụ 1 \- EMAIL BUILDER**

## **Mô tả bài toán**

Tạo Builder cho đối tượng Email với các thuộc tính: to, subject, body, cc. Sử dụng giá trị mặc định để test các trường hợp khác nhau.

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
  it('Khởi tạo email với các giá trị tùy chỉnh', () \=\> {  
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

  it('Khởi tạo email với các giá trị mặc định', () \=\> {  
    const email \= new EmailBuilder().build();

    expect(email.to).toBe('user@gmail.com');  
    expect(email.subject).toBe('Hello');  
    expect(email.body).toBe('Test');  
    expect(email.cc).toBeUndefined();  
  });

  it('Khởi tạo email không có cc', () \=\> {  
    const email \= new EmailBuilder()  
      .withTo('test@gmail.com')  
      .withSubject('Test')  
      .withBody('Test')  
      .build();

    expect(email.to).toBe('test@gmail.com');  
    expect(email.cc).toBeUndefined();  
  });

  it('Khởi tạo email với các giá trị khác nhau', () \=\> {  
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

3. # **Ví dụ 2 \- PERSON BUILDER**

## **Mô tả bài toán**

Tạo Builder cho đối tượng Person với các thuộc tính: firstName, lastName, age, email. Sử dụng giá trị mặc định để test các trường hợp khác nhau.

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
  it('Khởi tạo người với các giá trị tùy chỉnh', () \=\> {  
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

  it('Khởi tạo người với các giá trị mặc định', () \=\> {  
    const person \= new PersonBuilder().build();

    expect(person.firstName).toBe('Quoc');  
    expect(person.lastName).toBe('Tran');  
    expect(person.age).toBe(20);  
    expect(person.email).toBe('quoc@gmail.com');  
  });

  it('Khởi tạo người với tùy chỉnh một phần', () \=\> {  
    const person \= new PersonBuilder()  
      .withFirstName('Quoc2')  
      .withAge(25)  
      .build();

    expect(person.firstName).toBe('Quoc2');  
    expect(person.age).toBe(25);  
    expect(person.lastName).toBe('Tran'); // default  
    expect(person.email).toBe('quoc@gmail.com'); // default  
  });

  it('Khởi tạo nhiều người khác nhau', () \=\> {  
    const person1 \= new PersonBuilder().withFirstName('Quoc1').build();  
    const person2 \= new PersonBuilder().withFirstName('Quoc2').build();

    expect(person1.firstName).toBe('Quoc1');  
    expect(person2.firstName).toBe('Quoc2');  
  });  
});

4. # **Ví dụ 3 \- PRODUCT BUILDER**

## **Mô tả bài toán**

Tạo Builder cho đối tượng Product với các thuộc tính: name, price, stock. Sử dụng giá trị mặc định để test các trường hợp khác nhau.

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
  it('Khởi tạo sản phẩm với các giá trị tùy chỉnh', () \=\> {  
    const product \= new ProductBuilder()  
      .withName('Laptop')  
      .withPrice(999)  
      .withStock(10)  
      .build();

    expect(product.name).toBe('Laptop');  
    expect(product.price).toBe(999);  
    expect(product.stock).toBe(10);  
  });

  it('Khởi tạo sản phẩm với các giá trị mặc định', () \=\> {  
    const product \= new ProductBuilder().build();

    expect(product.name).toBe('Keyboard');  
    expect(product.price).toBe(0);  
    expect(product.stock).toBe(0);  
  });

  it('Khởi tạo sản phẩm với tùy chỉnh một phần', () \=\> {  
    const product \= new ProductBuilder()  
      .withName('Mouse')  
      .withPrice(25)  
      .build();

    expect(product.name).toBe('Mouse');  
    expect(product.price).toBe(25);  
    expect(product.stock).toBe(0); // default  
  });  
});

