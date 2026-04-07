export interface AuthStrategy {
  authenticate(credentials: Record<string, string>): boolean;
}

export class LocalAuthStrategy implements AuthStrategy {
  private users = [
    { username: 'admin', password: 'admin123' },
    { username: 'user1', password: 'pass456' },
  ];

  authenticate(credentials: Record<string, string>): boolean {
    return this.users.some(
      u => u.username === credentials['username'] &&
           u.password === credentials['password']
    );
  }
}

export class GoogleAuthStrategy implements AuthStrategy {
  authenticate(credentials: Record<string, string>): boolean {
    return credentials['token']?.startsWith('google_') ?? false;
  }
}

export class JwtAuthStrategy implements AuthStrategy {
  authenticate(credentials: Record<string, string>): boolean {
    return (credentials['token']?.split('.').length ?? 0) === 3;
  }
}

export class AuthContext {
  constructor(private strategy: AuthStrategy) {}

  setStrategy(strategy: AuthStrategy): void {
    this.strategy = strategy;
  }

  login(credentials: Record<string, string>): boolean {
    return this.strategy.authenticate(credentials);
  }
}
