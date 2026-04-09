import {
  MySQLFactory,
  PostgreSQLFactory,
  MongoDBFactory,
  DatabaseFactory,
  DatabaseConnection,
} from './database';

describe('Database Factory Method', () => {

  // Test each Concrete Factory
  it('MySQLFactory executes queries correctly', () => {
    const factory = new MySQLFactory();
    const conn = factory.createConnection();
    expect(conn.connect()).toBe('MySQL: Connected');
    expect(conn.disconnect()).toBe('MySQL: Disconnected');
  });

  it('PostgreSQLFactory executes queries correctly', () => {
    const factory = new PostgreSQLFactory();
    const result = factory.executeQuery('SELECT * FROM users');
    expect(result).toBe('PostgreSQL: SELECT * FROM users');
  });

  it('MongoDBFactory executes queries correctly', () => {
    const factory = new MongoDBFactory();
    expect(factory.executeQuery('db.users.find({})'))
      .toBe('MongoDB: db.users.find({})');
  });

  // Test template method: verify call order
  it('executeQuery() Call in correct order: connect → query → disconnect', () => {
    const callOrder: string[] = [];

    const mockConn: DatabaseConnection = {
      connect:    jest.fn().mockImplementation(() => { callOrder.push('connect');    return ''; }),
      query:      jest.fn().mockImplementation(() => { callOrder.push('query');      return 'result'; }),
      disconnect: jest.fn().mockImplementation(() => { callOrder.push('disconnect'); return ''; }),
    };

    class MockDBFactory extends DatabaseFactory {
      createConnection() { return mockConn; }
    }

    new MockDBFactory().executeQuery('SELECT 1');
    expect(callOrder).toEqual(['connect', 'query', 'disconnect']);
  });

  // Test query was passed correctly
  it('query() receives the correct SQL statement', () => {
    const mockConn: DatabaseConnection = {
      connect:    jest.fn().mockReturnValue(''),
      query:      jest.fn().mockReturnValue('ok'),
      disconnect: jest.fn().mockReturnValue(''),
    };
    class MockDBFactory extends DatabaseFactory {
      createConnection() { return mockConn; }
    }
    new MockDBFactory().executeQuery('DELETE FROM logs WHERE old = true');
    expect(mockConn.query).toHaveBeenCalledWith('DELETE FROM logs WHERE old = true');
  });

});
