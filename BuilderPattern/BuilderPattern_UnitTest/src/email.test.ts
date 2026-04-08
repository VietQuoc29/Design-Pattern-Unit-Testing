import { EmailBuilder } from './email';

describe('EmailBuilder', () => {
  it('Khởi tạo email với các giá trị tùy chỉnh', () => {
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

  it('Khởi tạo email với các giá trị mặc định', () => {
    const email = new EmailBuilder().build();

    expect(email.to).toBe('user@gmail.com');
    expect(email.subject).toBe('Hello');
    expect(email.body).toBe('Test');
    expect(email.cc).toBeUndefined();
  });

  it('Khởi tạo email không có cc', () => {
    const email = new EmailBuilder()
      .withTo('test@gmail.com')
      .withSubject('Test')
      .withBody('Test')
      .build();

    expect(email.to).toBe('test@gmail.com');
    expect(email.cc).toBeUndefined();
  });

  it('Khởi tạo email với các giá trị khác nhau', () => {
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
