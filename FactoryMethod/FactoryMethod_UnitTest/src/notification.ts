export interface Notification {
  send(recipient: string, message: string): string;
}

// Concrete Products
export class EmailNotification implements Notification {
  send(recipient: string, message: string): string {
    return `[EMAIL] To: ${recipient} | ${message}`;
  }
}

export class SMSNotification implements Notification {
  send(recipient: string, message: string): string {
    return `[SMS] To: ${recipient} | ${message}`;
  }
}

export class PushNotification implements Notification {
  send(recipient: string, message: string): string {
    return `[PUSH] To: ${recipient} | ${message}`;
  }
}

// Creator (Abstract Factory)
export abstract class NotificationFactory {
  abstract createNotification(): Notification;

  notify(recipient: string, message: string): string {
    const notification = this.createNotification();
    return notification.send(recipient, message);
  }
}

// Concrete Creators
export class EmailFactory extends NotificationFactory {
  createNotification(): Notification {
    return new EmailNotification();
  }
}

export class SMSFactory extends NotificationFactory {
  createNotification(): Notification {
    return new SMSNotification();
  }
}

export class PushFactory extends NotificationFactory {
  createNotification(): Notification {
    return new PushNotification();
  }
}
