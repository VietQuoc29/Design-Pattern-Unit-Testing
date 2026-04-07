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

    it('đăng nhập thành công với đúng tài khoản', () => {
      expect(ctx.login({ username: 'admin', password: 'admin123' })).toBe(true);
    });

    it('đăng nhập thất bại khi sai mật khẩu', () => {
      expect(ctx.login({ username: 'admin', password: 'user' })).toBe(false);
    });

    it('đăng nhập thất bại khi username không tồn tại', () => {
      expect(ctx.login({ username: 'user', password: 'admin123' })).toBe(false);
    });
  });

  describe('GoogleAuthStrategy', () => {
    let ctx: AuthContext;

    beforeEach(() => {
      ctx = new AuthContext(new GoogleAuthStrategy());
    });

    it('chấp nhận token Google hợp lệ', () => {
      expect(ctx.login({ token: 'google_abc123xyz' })).toBe(true);
    });

    it('từ chối token không có tiền tố google_', () => {
      expect(ctx.login({ token: 'facebook_token' })).toBe(false);
    });

    it('từ chối khi không có token', () => {
      expect(ctx.login({})).toBe(false);
    });
  });

  describe('JwtAuthStrategy', () => {
    let ctx: AuthContext;

    beforeEach(() => {
      ctx = new AuthContext(new JwtAuthStrategy());
    });

    it('chấp nhận JWT đúng định dạng 3 phần', () => {
      expect(ctx.login({ token: 'header.payload.signature' })).toBe(true);
    });

    it('từ chối JWT chỉ có 2 phần', () => {
      expect(ctx.login({ token: 'header.payload' })).toBe(false);
    });

    it('từ chối chuỗi không có dấu chấm', () => {
      expect(ctx.login({ token: 'invalidtoken' })).toBe(false);
    });
  });

  describe('Chuyển đổi strategy lúc runtime', () => {
    it('chuyển từ Local sang JWT', () => {
      const ctx = new AuthContext(new LocalAuthStrategy());
      // Local: đúng
      expect(ctx.login({ username: 'admin', password: 'admin123' })).toBe(true);
      // Chuyển sang JWT
      ctx.setStrategy(new JwtAuthStrategy());
      expect(ctx.login({ token: 'a.b.c' })).toBe(true);
    });
  });

  describe('Mock strategy', () => {
    it('kiểm tra credentials được truyền đúng vào strategy', () => {
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
