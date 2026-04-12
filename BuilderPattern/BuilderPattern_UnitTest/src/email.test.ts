import { EmailBuilder } from './email';

describe('EmailBuilder', () => {
  it('Creates an email with the specified values', () => {
    const email = new EmailBuilder()
      .withTo('quoc@gmail.com')
      .withSubject('Meeting')
      .withBody('Let\'s meet tomorrow')
      .withCc('manager@gmail.com')
      .build();

    expect(email.to).toBe('quoc@gmail.com');
    expect(email.subject).toBe('Meeting');
    expect(email.body).toBe('Let\'s meet tomorrow');
    expect(email.cc).toBe('manager@gmail.com');
  });

  it('Creates an email with the default values', () => {
    const email = new EmailBuilder().build();

    expect(email.to).toBe('user@gmail.com');
    expect(email.subject).toBe('Hello');
    expect(email.body).toBe('Test');
    expect(email.cc).toBeUndefined();
  });

  it('Creates an email without CC', () => {
    const email = new EmailBuilder()
      .withTo('test@gmail.com')
      .withSubject('Test')
      .withBody('Test')
      .build();

    expect(email.to).toBe('test@gmail.com');
    expect(email.cc).toBeUndefined();
  });

  it('Creates different emails with unique values', () => {
    const welcomeEmail = new EmailBuilder()
      .withSubject('Welcome')
      .withBody('Hello!')
      .build();

    const alertEmail = new EmailBuilder()
      .withSubject('Alert')
      .withBody('Alert!')
      .withCc('admin@gmail.com')
      .build();

    expect(welcomeEmail.subject).toBe('Welcome');
    expect(alertEmail.cc).toBe('admin@gmail.com');
  });
});
