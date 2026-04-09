export interface DatabaseConnection {
  connect(): string;
  query(sql: string): string;
  disconnect(): string;
}

// Concrete Products
export class MySQLConnection implements DatabaseConnection {
  connect():            string { return 'MySQL: Connected'; }
  query(sql: string):   string { return `MySQL: ${sql}`; }
  disconnect():         string { return 'MySQL: Disconnected'; }
}

export class PostgreSQLConnection implements DatabaseConnection {
  connect():            string { return 'PostgreSQL: Connected'; }
  query(sql: string):   string { return `PostgreSQL: ${sql}`; }
  disconnect():         string { return 'PostgreSQL: Disconnected'; }
}

export class MongoDBConnection implements DatabaseConnection {
  connect():            string { return 'MongoDB: Connected'; }
  query(sql: string):   string { return `MongoDB: ${sql}`; }
  disconnect():         string { return 'MongoDB: Disconnected'; }
}

// Creator (Abstract Factory)
export abstract class DatabaseFactory {
  abstract createConnection(): DatabaseConnection;

  executeQuery(sql: string): string {
    const conn = this.createConnection();
    conn.connect();
    const result = conn.query(sql);
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
