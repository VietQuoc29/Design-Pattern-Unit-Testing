import {
  AuthContext,
  LocalAuthStrategy,
  GoogleAuthStrategy,
  JwtAuthStrategy,
  AuthStrategy,
} from './auth';

describe('Authentication System (Strategy Pattern)', () => {

  describe('LocalAuthStrategy', () => {
    let ctx: AuthContext;

    beforeEach(() => {
      ctx = new AuthContext(new LocalAuthStrategy());
    });

    it('Successfully logged in with the correct account', () => {
      expect(ctx.login({ username: 'admin', password: 'admin123' })).toBe(true);
    });

    it('Failed to log in with incorrect password', () => {
      expect(ctx.login({ username: 'admin', password: 'user' })).toBe(false);
    });

    it('Failed to log in with non-existent username', () => {
      expect(ctx.login({ username: 'user', password: 'admin123' })).toBe(false);
    });
  });

  describe('GoogleAuthStrategy', () => {
    let ctx: AuthContext;

    beforeEach(() => {
      ctx = new AuthContext(new GoogleAuthStrategy());
    });

    it('accepts a valid Google token', () => {
      expect(ctx.login({ token: 'google_abc123xyz' })).toBe(true);
    });

    it('rejects a token without the google_ prefix', () => {
      expect(ctx.login({ token: 'facebook_token' })).toBe(false);
    });

    it('rejects the request when no token is provided', () => {
      expect(ctx.login({})).toBe(false);
    });
  });

  describe('JwtAuthStrategy', () => {
    let ctx: AuthContext;

    beforeEach(() => {
      ctx = new AuthContext(new JwtAuthStrategy());
    });

    it('accepts a valid JWT with the correct format', () => {
      expect(ctx.login({ token: 'header.payload.signature' })).toBe(true);
    });

    it('rejects a JWT with only 2 parts', () => {
      expect(ctx.login({ token: 'header.payload' })).toBe(false);
    });

    it('rejects a token that is not a valid JWT', () => {
      expect(ctx.login({ token: 'invalidtoken' })).toBe(false);
    });
  });

  describe('Changing strategy at runtime', () => {
    it('changes from Local to JWT', () => {
      const ctx = new AuthContext(new LocalAuthStrategy());
      // Local: true
      expect(ctx.login({ username: 'admin', password: 'admin123' })).toBe(true);
      // Switch to JWT
      ctx.setStrategy(new JwtAuthStrategy());
      expect(ctx.login({ token: 'a.b.c' })).toBe(true);
    });
  });

  describe('Mock strategy', () => {
    it('checks that credentials are passed correctly to the strategy', () => {
      const mockStrategy: AuthStrategy = {
        authenticate: jest.fn().mockReturnValue(true),
      };
      const ctx = new AuthContext(mockStrategy);
      const creds = { username: 'test', password: '1234' };
      ctx.login(creds);

      expect(mockStrategy.authenticate).toHaveBeenCalledWith(creds);
      expect(mockStrategy.authenticate).toHaveBeenCalledTimes(1);
    });
  });

});
