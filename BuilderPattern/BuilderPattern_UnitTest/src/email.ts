export interface Email {
  to: string;
  subject: string;
  body: string;
  cc?: string;
}

export class EmailBuilder {
  private email: Email = {
    to: 'user@gmail.com',
    subject: 'Hello',
    body: 'Test',
    cc: undefined
  };

  withTo(to: string): EmailBuilder {
    this.email.to = to;
    return this;
  }

  withSubject(subject: string): EmailBuilder {
    this.email.subject = subject;
    return this;
  }

  withBody(body: string): EmailBuilder {
    this.email.body = body;
    return this;
  }

  withCc(cc: string): EmailBuilder {
    this.email.cc = cc;
    return this;
  }

  build(): Email {
    return { ...this.email };
  }
}
