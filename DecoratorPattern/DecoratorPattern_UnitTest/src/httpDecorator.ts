// Component Interface
export interface HttpClient {
  request(url: string, options?: RequestOptions): HttpResponse;
}

export interface RequestOptions { headers?: Record<string, string>; }
export interface HttpResponse   { status: number; body: string; }

// Concrete Component – bare HTTP client with no cross-cutting concerns
export class BaseHttpClient implements HttpClient {
  request(url: string, _options?: RequestOptions): HttpResponse {
    return { status: 200, body: `Response from ${url}` };
  }
}

// Base Decorator – delegate by default, subclasses override selectively
export abstract class HttpClientDecorator implements HttpClient {
  constructor(protected wrapped: HttpClient) {}

  request(url: string, options?: RequestOptions): HttpResponse {
    return this.wrapped.request(url, options);
  }
}

// Concrete Decorator 1 – Logging (record before/after each request)
export class LoggingDecorator extends HttpClientDecorator {
  private logs: string[] = [];

  request(url: string, options?: RequestOptions): HttpResponse {
    this.logs.push(`[LOG] GET ${url}`);
    const response = super.request(url, options);
    this.logs.push(`[LOG] ${response.status} ${url}`);
    return response;
  }

  getLogs(): string[] { return [...this.logs]; }
}

// Concrete Decorator 2 – Authentication (injects Bearer token header)
export class AuthDecorator extends HttpClientDecorator {
  constructor(wrapped: HttpClient, private token: string) { super(wrapped); }

  request(url: string, options: RequestOptions = {}): HttpResponse {
    const authedOptions: RequestOptions = {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${this.token}` },
    };
    return super.request(url, authedOptions);
  }
}

// Concrete Decorator 3 – Retry (retries on 5xx responses)
export class RetryDecorator extends HttpClientDecorator {
  constructor(wrapped: HttpClient, private maxRetries: number) { super(wrapped); }

  request(url: string, options?: RequestOptions): HttpResponse {
    let lastResponse: HttpResponse = { status: 500, body: 'No response' };
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      lastResponse = super.request(url, options);
      if (lastResponse.status < 500) return lastResponse;
    }
    return lastResponse;
  }
}
