import {
  EmailFactory,
  SMSFactory,
  PushFactory,
  NotificationFactory,
  Notification,
} from './notification';

describe('Notification Factory Method', () => {

  it('EmailFactory creates the right type of notification', () => {
    const factory = new EmailFactory();
    const notif = factory.createNotification();
    expect(notif.send('user@gmail.com', 'Hello')).toBe('[EMAIL] To: user@gmail.com | Hello');
  });

  it('SMSFactory sends SMS messages', () => {
    const factory = new SMSFactory();
    expect(factory.notify('0912345678', 'Hi'))
      .toBe('[SMS] To: 0912345678 | Hi');
  });

  it('PushFactory sends push notifications', () => {
    const factory = new PushFactory();
    expect(factory.notify('phone', 'New notification'))
      .toBe('[PUSH] To: phone | New notification');
  });

  // Test template method through mock
  it('notify() call createNotification() first then call send()', () => {
    const mockNotif: Notification = {
      send: jest.fn().mockReturnValue('Mock sent'),
    };
    // Create anonymous class extend abstract factory
    const mockFactory = {
      createNotification: jest.fn().mockReturnValue(mockNotif),
      notify: NotificationFactory.prototype.notify,
    };
    mockFactory.notify.call(mockFactory, 'user@gmail.com', 'Test message');

    expect(mockFactory.createNotification).toHaveBeenCalledTimes(1);
    expect(mockNotif.send).toHaveBeenCalledWith('user@gmail.com', 'Test message');
  });

  it('EmailFactory sends to multiple recipients independently', () => {
    const factory = new EmailFactory();
    expect(factory.notify('user1@gmail.com', 'Hi user1')).toContain('user1@gmail.com');
    expect(factory.notify('user2@gmail.com',   'Hi user2'  )).toContain('user2@gmail.com');
  });

});
