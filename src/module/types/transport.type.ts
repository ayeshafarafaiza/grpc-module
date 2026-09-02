// Publisher interface
export interface IMessagePublisher {
  publish<T>(topic: string, payload: T): Promise<void>;
}

// Subscriber interface
export interface IMessageSubscriber {
  subscribe<T>(topic: string, handler: (payload: T) => Promise<void>): Promise<void>;
}

// Combined transport interface
export interface IMessageTransport extends IMessagePublisher, IMessageSubscriber {
  initialize?(): Promise<void>;
  close?(): Promise<void>;
}
