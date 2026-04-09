1. # **Factory Method Pattern**

   1. ## **Definition**

Factory Method Pattern defines an interface to create an object, but lets the subclasses decide which class will be instantiated. Factory methods allow a class to defer instantiation to its subclasses.

Instead of directly using the *new* keyword to create an object, we call a factory method – this method will return the appropriate object based on the parameter or context, without the caller needing to know which specific class was created.

2. ## **Structure**

Factory Method Pattern consists of four main components:

- Product Interface: Interface or abstract class defines the general behavior of the objects created.  
- Concrete Product: Specific classes implement the Product Interface, each class being a different type of object  
- Creator (Factory): Class or interface declares a factory method. A default implementation can be provided.  
- Concrete Creator: Specific class overrides the factory method to return the corresponding Concrete Product type.

  3. ## **Applicability**

- Don’t know beforehand the exact types and dependencies of the objects that code should work with  
- Want to provide users of your library or framework with a way to extend its internal components  
- Want to save system resources by reusing existing objects instead of rebuilding them each time

  4. ## **Pros and cons**

| Prospects | Consequences |
| :---- | :---- |
| Single Responsibility Principle | Increase the number of classes in the project. |
| Open/Closed Principle | Clients need to know which Concrete Creator is suitable. |
| Avoid tight coupling between the creator and the concrete products |  |
| Easy to write unit tests – mock factory |  |

# 

2. # **Ex1 \- Notification System**

## **Describe**

An application needs to send notifications through multiple channels: email, SMS, push notifications. Instead of creating each type directly in the business code, use Factory Method so that each channel is created by a separate factory.

## **Source code: notification.ts**

export interface Notification {  
  send(recipient: string, message: string): string;  
}

// Concrete Products  
export class EmailNotification implements Notification {  
  send(recipient: string, message: string): string {  
    return \`\[EMAIL\] To: ${recipient} | ${message}\`;  
  }  
}

export class SMSNotification implements Notification {  
  send(recipient: string, message: string): string {  
    return \`\[SMS\] To: ${recipient} | ${message}\`;  
  }  
}

export class PushNotification implements Notification {  
  send(recipient: string, message: string): string {  
    return \`\[PUSH\] To: ${recipient} | ${message}\`;  
  }  
}

// Creator (Abstract Factory)  
export abstract class NotificationFactory {  
  abstract createNotification(): Notification;

  // Template method – dùng product tạo ra từ factory  
  notify(recipient: string, message: string): string {  
    const notification \= this.createNotification();  
    return notification.send(recipient, message);  
  }  
}

// Concrete Creators  
export class EmailFactory extends NotificationFactory {  
  createNotification(): Notification {  
    return new EmailNotification();  
  }  
}

export class SMSFactory extends NotificationFactory {  
  createNotification(): Notification {  
    return new SMSNotification();  
  }  
}

export class PushFactory extends NotificationFactory {  
  createNotification(): Notification {  
    return new PushNotification();  
  }  
}

## **Source code: notification.test.ts**

import {  
  EmailFactory,  
  SMSFactory,  
  PushFactory,  
  NotificationFactory,  
  Notification,  
} from './notification';

describe('Notification Factory Method', () \=\> {

  it('EmailFactory creates the right type of notification', () \=\> {  
    const factory \= new EmailFactory();  
    const notif \= factory.createNotification();  
    expect(notif.send('user@gmail.com', 'Hello')).toBe('\[EMAIL\] To: user@gmail.com | Hello');  
  });

  it('SMSFactory sends SMS messages', () \=\> {  
    const factory \= new SMSFactory();  
    expect(factory.notify('0912345678', 'Hi'))  
      .toBe('\[SMS\] To: 0912345678 | Hi');  
  });

  it('PushFactory sends push notifications', () \=\> {  
    const factory \= new PushFactory();  
    expect(factory.notify('phone', 'New notification'))  
      .toBe('\[PUSH\] To: phone | New notification');  
  });

  // Test template method through mock  
  it('notify() call createNotification() first then call send()', () \=\> {  
    const mockNotif: Notification \= {  
      send: jest.fn().mockReturnValue('Mock sent'),  
    };  
    // Create anonymous class extend abstract factory  
    const mockFactory \= {  
      createNotification: jest.fn().mockReturnValue(mockNotif),  
      notify: NotificationFactory.prototype.notify,  
    };  
    mockFactory.notify.call(mockFactory, 'user@gmail.com', 'Test message');

    expect(mockFactory.createNotification).toHaveBeenCalledTimes(1);  
    expect(mockNotif.send).toHaveBeenCalledWith('user@gmail.com', 'Test message');  
  });

  it('EmailFactory sends to multiple recipients independently', () \=\> {  
    const factory \= new EmailFactory();  
    expect(factory.notify('user1@gmail.com', 'Hi user1')).toContain('user1@gmail.com');  
    expect(factory.notify('user2@gmail.com',   'Hi user2'  )).toContain('user2@gmail.com');  
  });

});

3. # **Ex2 \- Database Connection System**

## **Describe**

An application needs to connect to multiple types of databases: MySQL, PostgreSQL, MongoDB. Each has different connection and query syntax. Factory methods help create the correct driver without changing the business code.

## **Source code: database.ts**

export interface DatabaseConnection {  
  connect(): string;  
  query(sql: string): string;  
  disconnect(): string;  
}

// Concrete Products  
export class MySQLConnection implements DatabaseConnection {  
  connect():            string { return 'MySQL: Connected'; }  
  query(sql: string):   string { return \`MySQL: ${sql}\`; }  
  disconnect():         string { return 'MySQL: Disconnected'; }  
}

export class PostgreSQLConnection implements DatabaseConnection {  
  connect():            string { return 'PostgreSQL: Connected'; }  
  query(sql: string):   string { return \`PostgreSQL: ${sql}\`; }  
  disconnect():         string { return 'PostgreSQL: Disconnected'; }  
}

export class MongoDBConnection implements DatabaseConnection {  
  connect():            string { return 'MongoDB: Connected'; }  
  query(sql: string):   string { return \`MongoDB: ${sql}\`; }  
  disconnect():         string { return 'MongoDB: Disconnected'; }  
}

// Creator (Abstract Factory)  
export abstract class DatabaseFactory {  
  abstract createConnection(): DatabaseConnection;

  executeQuery(sql: string): string {  
    const conn \= this.createConnection();  
    conn.connect();  
    const result \= conn.query(sql);  
    conn.disconnect();  
    return result;  
  }  
}

// Concrete Creators  
export class MySQLFactory extends DatabaseFactory {  
  createConnection(): DatabaseConnection { return new MySQLConnection(); }  
}

export class PostgreSQLFactory extends DatabaseFactory {  
  createConnection(): DatabaseConnection { return new PostgreSQLConnection(); }  
}

export class MongoDBFactory extends DatabaseFactory {  
  createConnection(): DatabaseConnection { return new MongoDBConnection(); }  
}

## **Source code: database.test.ts**

import {  
  MySQLFactory,  
  PostgreSQLFactory,  
  MongoDBFactory,  
  DatabaseFactory,  
  DatabaseConnection,  
} from './database';

describe('Database Factory Method', () \=\> {

  // Test each Concrete Factory  
  it('MySQLFactory executes queries correctly', () \=\> {  
    const factory \= new MySQLFactory();  
    const conn \= factory.createConnection();  
    expect(conn.connect()).toBe('MySQL: Connected');  
    expect(conn.disconnect()).toBe('MySQL: Disconnected');  
  });

  it('PostgreSQLFactory executes queries correctly', () \=\> {  
    const factory \= new PostgreSQLFactory();  
    const result \= factory.executeQuery('SELECT \* FROM users');  
    expect(result).toBe('PostgreSQL: SELECT \* FROM users');  
  });

  it('MongoDBFactory executes queries correctly', () \=\> {  
    const factory \= new MongoDBFactory();  
    expect(factory.executeQuery('db.users.find({})'))  
      .toBe('MongoDB: db.users.find({})');  
  });

  // Test template method: verify call order  
  it('executeQuery() Call in correct order: connect → query → disconnect', () \=\> {  
    const callOrder: string\[\] \= \[\];

    const mockConn: DatabaseConnection \= {  
      connect:    jest.fn().mockImplementation(() \=\> { callOrder.push('connect');    return ''; }),  
      query:      jest.fn().mockImplementation(() \=\> { callOrder.push('query');      return 'result'; }),  
      disconnect: jest.fn().mockImplementation(() \=\> { callOrder.push('disconnect'); return ''; }),  
    };

    class MockDBFactory extends DatabaseFactory {  
      createConnection() { return mockConn; }  
    }

    new MockDBFactory().executeQuery('SELECT 1');  
    expect(callOrder).toEqual(\['connect', 'query', 'disconnect'\]);  
  });

  // Test query was passed correctly  
  it('query() receives the correct SQL statement', () \=\> {  
    const mockConn: DatabaseConnection \= {  
      connect:    jest.fn().mockReturnValue(''),  
      query:      jest.fn().mockReturnValue('ok'),  
      disconnect: jest.fn().mockReturnValue(''),  
    };  
    class MockDBFactory extends DatabaseFactory {  
      createConnection() { return mockConn; }  
    }  
    new MockDBFactory().executeQuery('DELETE FROM logs WHERE old \= true');  
    expect(mockConn.query).toHaveBeenCalledWith('DELETE FROM logs WHERE old \= true');  
  });

});

4. # **Ex3 \- Export System**

## **Describe**

A reporting application allows data to be exported in multiple formats: PDF, CSV, Excel. Each format has different export logic. Factory methods help the system easily expand to support new formats without breaking existing code.

## **Source code: exporter.ts**

export interface Exporter {  
  export(data: string\[\]): string;  
  getFileExtension(): string;  
}

// Concrete Products  
export class PDFExporter implements Exporter {  
  export(data: string\[\]): string   { return \`PDF: ${data.join(', ')}\`; }  
  getFileExtension(): string       { return '.pdf'; }  
}

export class CSVExporter implements Exporter {  
  export(data: string\[\]): string   { return \`CSV: ${data.join(';')}\`; }  
  getFileExtension(): string       { return '.csv'; }  
}

export class ExcelExporter implements Exporter {  
  export(data: string\[\]): string   { return \`Excel: ${data.join('\\t')}\`; }  
  getFileExtension(): string       { return '.xlsx'; }  
}

// Creator (Abstract Factory)  
export abstract class ExportFactory {  
  abstract createExporter(): Exporter;

  exportToFile(data: string\[\]): { content: string; ext: string } {  
    const exporter \= this.createExporter();  
    return {  
      content: exporter.export(data),  
      ext:     exporter.getFileExtension(),  
    };  
  }  
}

// Concrete Creators  
export class PDFExportFactory extends ExportFactory {  
  createExporter(): Exporter { return new PDFExporter(); }  
}

export class CSVExportFactory extends ExportFactory {  
  createExporter(): Exporter { return new CSVExporter(); }  
}

export class ExcelExportFactory extends ExportFactory {  
  createExporter(): Exporter { return new ExcelExporter(); }  
}

## **Source code: exporter.test.ts**

import {  
  PDFExportFactory,  
  CSVExportFactory,  
  ExcelExportFactory,  
  ExportFactory,  
  Exporter,  
} from './exporter';

describe('Export Factory Method', () \=\> {

  const sampleData \= \['Name', 'Age', 'Email'\];

  // Test each Concrete Factory  
  it('PDFExportFactory export with comma as separator', () \=\> {  
    const result \= new PDFExportFactory().exportToFile(sampleData);  
    expect(result.content).toBe('PDF: Name, Age, Email');  
    expect(result.ext).toBe('.pdf');  
  });

  it('CSVExportFactory exports with semicolon as separator', () \=\> {  
    const result \= new CSVExportFactory().exportToFile(sampleData);  
    expect(result.content).toBe('CSV: Name;Age;Email');  
    expect(result.ext).toBe('.csv');  
  });

  it('ExcelExportFactory exports with tab as separator', () \=\> {  
    const result \= new ExcelExportFactory().exportToFile(sampleData);  
    expect(result.content).toContain('Excel:'); //test smell avoidance  
    expect(result.ext).toBe('.xlsx');  
  });

  it('exports empty array without throwing an error', () \=\> {  
    expect(() \=\> new PDFExportFactory().exportToFile(\[\])).not.toThrow();  
    expect(() \=\> new CSVExportFactory().exportToFile(\[\])).not.toThrow();  
  });

  // Test mock: Verify that exportToFile calls both methods of Exporter.  
  it('exportToFile() calls both export() and getFileExtension()', () \=\> {  
    const mockExporter: Exporter \= {  
      export:           jest.fn().mockReturnValue('Mock content'),  
      getFileExtension: jest.fn().mockReturnValue('.mock'),  
    };

    class MockExportFactory extends ExportFactory {  
      createExporter() { return mockExporter; }  
    }

    const result \= new MockExportFactory().exportToFile(\['a', 'b', 'c'\]);

    expect(mockExporter.export).toHaveBeenCalledWith(\['a', 'b', 'c'\]);  
    expect(mockExporter.getFileExtension).toHaveBeenCalledTimes(1);  
    expect(result).toEqual({ content: 'Mock content', ext: '.mock' });  
  });

});

