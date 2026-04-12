1. # **STRATEGY PATTERN** 

   1. ## **Definition**

The Strategy Pattern defines a group of algorithms (algorithm family), encapsulating each algorithm and allowing them to be swapped with one another. This pattern enables algorithms to change independently of the clients using them. Instead of writing multiple if/else statements to handle different cases, each case is encapsulated in a separate class and can be swapped at runtime.

2. ## **Structure**

The Strategy Pattern consists of three main components:

- Strategy Interface: Define a common interface for all algorithms.  
- Concrete Strategy: Specific classes implement the Strategy Interface, each containing its own algorithm.  
- Context: Class uses a Strategy, holds a reference to a Strategy, and calls it.

  3. ## **Applicability**

- Want to use different variants of an algorithm within an object and be able to switch from one algorithm to another during runtime.  
- Have a lot of similar classes that only differ in the way they execute some behavior.  
- To isolate the business logic of a class from the implementation details of algorithms that may not be as important in the context of that logic.  
- Class has a massive conditional statement that switches between different variants of the same algorithm.

  4. ## **Props and Cons**

| Prospects | Consequence |
| :---- | :---- |
| Open/Closed Principle | Increase the number of classes in the project. |
| Can swap algorithms used inside an object at runtime | Clients need to know the differences between the strategies. |
| Can isolate the implementation details of an algorithm from the code that uses it | Overhead when you have few strategies |
| Can replace inheritance with composition |  |

2. # **Ex1 – Payment System**

## **Describe**

An e-commerce application needs to support multiple payment methods: credit cards, MoMo, ZaloPay. Instead of using if/else statements to create branches, we use the Strategy Pattern so that each method has its own strategy.

## **Source code: payment.ts**

export interface PaymentStrategy {  
  pay(amount: number): string;  
}

export class CreditCardStrategy implements PaymentStrategy {  
  pay(amount: number): string {  
    return \`Pays ${amount}đ with credit card\`;  
  }  
}

export class MomoStrategy implements PaymentStrategy {  
  pay(amount: number): string {  
    return \`Pays ${amount}đ with MoMo\`;  
  }  
}

export class ZaloPayStrategy implements PaymentStrategy {  
  pay(amount: number): string {  
    return \`Pays ${amount}đ with ZaloPay\`;  
  }  
}

export class PaymentContext {  
  constructor(private strategy: PaymentStrategy) {}

  setStrategy(strategy: PaymentStrategy): void {  
    this.strategy \= strategy;  
  }

  executePayment(amount: number): string {  
    return this.strategy.pay(amount);  
  }  
}

## **Source code: payment.test.ts**

import {  
  PaymentContext,  
  CreditCardStrategy,  
  MomoStrategy,  
  ZaloPayStrategy,  
  PaymentStrategy,  
} from './payment';

describe('Payment System', () \=\> {

  it('pays with credit card', () \=\> {  
    const ctx \= new PaymentContext(new CreditCardStrategy());  
    expect(ctx.executePayment(100000)).toBe('Pays 100000d with credit card');  
  });

  it('pays with MoMo', () \=\> {  
    const ctx \= new PaymentContext(new MomoStrategy());  
    expect(ctx.executePayment(50000)).toBe('Pays 50000d with MoMo');  
  });

  it('pays with ZaloPay', () \=\> {  
    const ctx \= new PaymentContext(new ZaloPayStrategy());  
    expect(ctx.executePayment(75000)).toBe('Pays 75000d with ZaloPay');  
  });

  it('switches strategy from CreditCard to MoMo at runtime', () \=\> {  
    const ctx \= new PaymentContext(new CreditCardStrategy());  
    ctx.setStrategy(new MomoStrategy());  
    expect(ctx.executePayment(50000)).toBe('Pays 50000d with MoMo');  
  });

  it('mock strategy – checks call count and arguments', () \=\> {  
    const mockStrategy: PaymentStrategy \= {  
      pay: jest.fn().mockReturnValue('Mock payment OK'),  
    };  
    const ctx \= new PaymentContext(mockStrategy);  
    ctx.executePayment(200000);

    expect(mockStrategy.pay).toHaveBeenCalledWith(200000);  
    expect(mockStrategy.pay).toHaveBeenCalledTimes(1);  
  });

});

3. # **Ex2 – Sorting**

## **Describe**

An application needs to support multiple sorting algorithms: Bubble Sort, Quick Sort, Merge Sort. Depending on the data size, the system can choose the appropriate algorithm.

## **Source code: sorter.ts**

export interface SortStrategy {  
  sort(data: number\[\]): number\[\];  
}

export class BubbleSortStrategy implements SortStrategy {  
  sort(data: number\[\]): number\[\] {  
    const arr \= \[...data\];  
    for (let i \= 0; i \< arr.length; i\++)  
      for (let j \= 0; j \< arr.length \- i \- 1; j\++)  
        if (arr\[j\] \> arr\[j \+ 1\])  
          \[arr\[j\], arr\[j \+ 1\]\] \= \[arr\[j \+ 1\], arr\[j\]\];  
    return arr;  
  }  
}

export class QuickSortStrategy implements SortStrategy {  
  sort(data: number\[\]): number\[\] {  
    if (data.length \<= 1) return data;  
    const pivot \= data\[Math.floor(data.length / 2)\];  
    const left  \= data.filter(x \=\> x \< pivot);  
    const mid   \= data.filter(x \=\> x \=== pivot);  
    const right \= data.filter(x \=\> x \> pivot);  
    return \[...this.sort(left), ...mid, ...this.sort(right)\];  
  }  
}

export class Sorter {  
  constructor(private strategy: SortStrategy) {}

  setStrategy(strategy: SortStrategy): void {  
    this.strategy \= strategy;  
  }

  sort(data: number\[\]): number\[\] {  
    return this.strategy.sort(data);  
  }  
}

## **Source code: sorter.test.ts**

import { Sorter, BubbleSortStrategy, QuickSortStrategy, SortStrategy } from './sorter';

describe('Sorting System', () \=\> {

  const unsorted \= \[5, 3, 8, 1, 9, 2\];  
  const expected \= \[1, 2, 3, 5, 8, 9\];

  it('sorts an array in ascending order using Bubble Sort', () \=\> {  
    const sorter \= new Sorter(new BubbleSortStrategy());  
    expect(sorter.sort(unsorted)).toEqual(expected);  
  });

  it('sorts an array in ascending order using Quick Sort', () \=\> {  
    const sorter \= new Sorter(new QuickSortStrategy());  
    expect(sorter.sort(unsorted)).toEqual(expected);  
  });

  it('returns an empty array when given an empty array', () \=\> {  
    const sorter \= new Sorter(new QuickSortStrategy());  
    expect(sorter.sort(\[\])).toEqual(\[\]);  
  });

  it('does not change the array when it contains only one element', () \=\> {  
    const sorter \= new Sorter(new BubbleSortStrategy());  
    expect(sorter.sort(\[42\])).toEqual(\[42\]);  
  });

  it('switches strategy from Bubble to Quick at runtime', () \=\> {  
    const sorter \= new Sorter(new BubbleSortStrategy());  
    sorter.setStrategy(new QuickSortStrategy());  
    expect(sorter.sort(\[3, 1, 2\])).toEqual(\[1, 2, 3\]);  
  });

  it('mock strategy – checks call count and arguments', () \=\> {  
    const mockStrategy: SortStrategy \= {  
      sort: jest.fn().mockReturnValue(\[1, 2, 3\]),  
    };  
    const sorter \= new Sorter(mockStrategy);  
    sorter.sort(\[3, 1, 2\]);  
    expect(mockStrategy.sort).toHaveBeenCalledWith(\[3, 1, 2\]);  
  });

});

4. # **Ex3 – Authentication System**

## **Describe**

An application that supports multiple login methods: regular account/password, Google OAuth, and JWT Token. Each method is an independent strategy, easily testable separately.

## **Source code: auth.ts**

export interface AuthStrategy {  
  authenticate(credentials: Record\<string, string\>): boolean;  
}

export class LocalAuthStrategy implements AuthStrategy {  
  private users \= \[  
    { username: 'admin', password: 'admin123' },  
    { username: 'user1', password: 'pass456' },  
  \];

  authenticate(credentials: Record\<string, string\>): boolean {  
    return this.users.some(  
      u \=\> u.username \=== credentials\['username'\] &&  
           u.password \=== credentials\['password'\]  
    );  
  }  
}

export class GoogleAuthStrategy implements AuthStrategy {  
  authenticate(credentials: Record\<string, string\>): boolean {  
    return credentials\['token'\]?.startsWith('google\_') ?? false;  
  }  
}

export class JwtAuthStrategy implements AuthStrategy {  
  authenticate(credentials: Record\<string, string\>): boolean {  
    return (credentials\['token'\]?.split('.').length ?? 0) \=== 3;  
  }  
}

export class AuthContext {  
  constructor(private strategy: AuthStrategy) {}

  setStrategy(strategy: AuthStrategy): void {  
    this.strategy \= strategy;  
  }

  login(credentials: Record\<string, string\>): boolean {  
    return this.strategy.authenticate(credentials);  
  }  
}

## **Source code: auth.test.ts**

import {  
  AuthContext,  
  LocalAuthStrategy,  
  GoogleAuthStrategy,  
  JwtAuthStrategy,  
  AuthStrategy,  
} from './auth';

describe('Authentication System (Strategy Pattern)', () \=\> {

  describe('LocalAuthStrategy', () \=\> {  
    let ctx: AuthContext;

    beforeEach(() \=\> {  
      ctx \= new AuthContext(new LocalAuthStrategy());  
    });

    it('Successfully logged in with the correct account', () \=\> {  
      expect(ctx.login({ username: 'admin', password: 'admin123' })).toBe(true);  
    });

    it('Failed to log in with incorrect password', () \=\> {  
      expect(ctx.login({ username: 'admin', password: 'user' })).toBe(false);  
    });

    it('Failed to log in with non-existent username', () \=\> {  
      expect(ctx.login({ username: 'user', password: 'admin123' })).toBe(false);  
    });  
  });

  describe('GoogleAuthStrategy', () \=\> {  
    let ctx: AuthContext;

    beforeEach(() \=\> {  
      ctx \= new AuthContext(new GoogleAuthStrategy());  
    });

    it('accepts a valid Google token', () \=\> {  
      expect(ctx.login({ token: 'google\_abc123xyz' })).toBe(true);  
    });

    it('rejects a token without the google\_ prefix', () \=\> {  
      expect(ctx.login({ token: 'facebook\_token' })).toBe(false);  
    });

    it('rejects the request when no token is provided', () \=\> {  
      expect(ctx.login({})).toBe(false);  
    });  
  });

  describe('JwtAuthStrategy', () \=\> {  
    let ctx: AuthContext;

    beforeEach(() \=\> {  
      ctx \= new AuthContext(new JwtAuthStrategy());  
    });

    it('accepts a valid JWT with the correct format', () \=\> {  
      expect(ctx.login({ token: 'header.payload.signature' })).toBe(true);  
    });

    it('rejects a JWT with only 2 parts', () \=\> {  
      expect(ctx.login({ token: 'header.payload' })).toBe(false);  
    });

    it('rejects a token that is not a valid JWT', () \=\> {  
      expect(ctx.login({ token: 'invalidtoken' })).toBe(false);  
    });  
  });

  describe('Changing strategy at runtime', () \=\> {  
    it('changes from Local to JWT', () \=\> {  
      const ctx \= new AuthContext(new LocalAuthStrategy());  
      // Local: true  
      expect(ctx.login({ username: 'admin', password: 'admin123' })).toBe(true);  
      // Switch to JWT  
      ctx.setStrategy(new JwtAuthStrategy());  
      expect(ctx.login({ token: 'a.b.c' })).toBe(true);  
    });  
  });

  describe('Mock strategy', () \=\> {  
    it('checks that credentials are passed correctly to the strategy', () \=\> {  
      const mockStrategy: AuthStrategy \= {  
        authenticate: jest.fn().mockReturnValue(true),  
      };  
      const ctx \= new AuthContext(mockStrategy);  
      const creds \= { username: 'test', password: '1234' };  
      ctx.login(creds);

      expect(mockStrategy.authenticate).toHaveBeenCalledWith(creds);  
      expect(mockStrategy.authenticate).toHaveBeenCalledTimes(1);  
    });  
  });

});