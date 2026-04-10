import {
  BaseHttpClient,
  LoggingDecorator,
  AuthDecorator,
  RetryDecorator,
  HttpClient,
} from './httpDecorator';

describe('HTTP Request Pipeline (Decorator)', () => {

  // ── LoggingDecorator ────────────────────────────────
  describe('LoggingDecorator', () => {
    it('record a before-request and after-request log entry', () => {
      const logger = new LoggingDecorator(new BaseHttpClient());
      logger.request('https://api.example.com/users');
      const logs = logger.getLogs();
      expect(logs).toHaveLength(2);
      expect(logs[0]).toContain('[LOG] GET');
      expect(logs[1]).toContain('200');
    });

    it('delegate the request to the wrapped client', () => {
      const mockClient: HttpClient = {
        request: jest.fn().mockReturnValue({ status: 201, body: 'Created' }),
      };
      const logger = new LoggingDecorator(mockClient);
      const result = logger.request('/items');
      expect(mockClient.request).toHaveBeenCalledWith('/items', undefined);
      expect(result).toEqual({ status: 201, body: 'Created' });
    });

    it('return the wrapped response unchanged', () => {
      const mockClient: HttpClient = {
        request: jest.fn().mockReturnValue({ status: 404, body: 'Not found' }),
      };
      const result = new LoggingDecorator(mockClient).request('/missing');
      expect(result.status).toBe(404);
    });
  });

  // ── AuthDecorator ───────────────────────────────────
  describe('AuthDecorator', () => {
    it('inject Authorization header with Bearer token', () => {
      const mockClient: HttpClient = {
        request: jest.fn().mockReturnValue({ status: 200, body: '' }),
      };
      const auth = new AuthDecorator(mockClient, 'my-secret-token');
      auth.request('/protected');
      expect(mockClient.request).toHaveBeenCalledWith('/protected', {
        headers: { Authorization: 'Bearer my-secret-token' },
      });
    });

    it('merge Authorization with pre-existing headers', () => {
      const mockClient: HttpClient = {
        request: jest.fn().mockReturnValue({ status: 200, body: '' }),
      };
      new AuthDecorator(mockClient, 'tok').request('/data', {
        headers: { 'X-App': 'v1' },
      });
      const opts = (mockClient.request as jest.Mock).mock.calls[0][1];
      expect(opts.headers['X-App']).toBe('v1');
      expect(opts.headers['Authorization']).toBe('Bearer tok');
    });

    it('does not modify the original options object', () => {
      const mockClient: HttpClient = {
        request: jest.fn().mockReturnValue({ status: 200, body: '' }),
      };
      const original = { headers: { 'X-Trace': 'abc' } };
      new AuthDecorator(mockClient, 'tok').request('/', original);
      // Original must be immutable
      expect(original.headers).not.toHaveProperty('Authorization');
    });
  });

  // ── RetryDecorator ──────────────────────────────────
  describe('RetryDecorator', () => {
    it('return immediately on a 2xx success without retrying', () => {
      const mockClient: HttpClient = {
        request: jest.fn().mockReturnValue({ status: 200, body: 'ok' }),
      };
      new RetryDecorator(mockClient, 3).request('/health');
      expect(mockClient.request).toHaveBeenCalledTimes(1);
    });

    it('retries exactly maxRetries times on persistent 500 errors', () => {
      const mockClient: HttpClient = {
        request: jest.fn().mockReturnValue({ status: 500, body: 'err' }),
      };
      new RetryDecorator(mockClient, 2).request('/flaky');
      // 1 initial attempt + 2 retries = 3 total calls
      expect(mockClient.request).toHaveBeenCalledTimes(3);
    });

    it('stop retrying as soon as a non-5xx response is received', () => {
      const mockClient: HttpClient = {
        request: jest.fn()
          .mockReturnValueOnce({ status: 500, body: 'err' })
          .mockReturnValueOnce({ status: 200, body: 'ok' }),
      };
      const result = new RetryDecorator(mockClient, 3).request('/recovering');
      expect(mockClient.request).toHaveBeenCalledTimes(2);
      expect(result.status).toBe(200);
    });
  });

  // ── Stacked Decorator Chain ─────────────────────────
  it('stacked: Log -> Auth -> Retry -> Base all cooperate correctly', () => {
    const mockBase: HttpClient = {
      request: jest.fn().mockReturnValue({ status: 200, body: 'ok' }),
    };
    const pipeline = new LoggingDecorator(
      new AuthDecorator(
        new RetryDecorator(mockBase, 1), 'tok'));
    const result = pipeline.request('/stack');
    expect(result.status).toBe(200);
    expect(mockBase.request).toHaveBeenCalledTimes(1);
  });

});
