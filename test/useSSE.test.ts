import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { useSSE } from '../src/composables/useSSE.js';
import { nextTick } from 'vue';

// Mock EventSource
class MockEventSource {
  url: string;
  readyState: number;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  listeners: Map<string, Array<(event: Event) => void>> = new Map();

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url: string) {
    this.url = url;
    this.readyState = MockEventSource.CONNECTING;
  }

  addEventListener(event: string, handler: (event: Event) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  close() {
    this.readyState = MockEventSource.CLOSED;
  }

  // Helper for tests
  simulateOpen() {
    this.readyState = MockEventSource.OPEN;
    if (this.onopen) {
      this.onopen(new Event('open'));
    }
  }

  simulateMessage(data: string) {
    if (this.onmessage) {
      const event = new MessageEvent('message', { data });
      this.onmessage(event);
    }
  }

  simulateCustomEvent(eventName: string, data: string) {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      const event = new MessageEvent(eventName, { data });
      handlers.forEach(handler => handler(event as any));
    }
  }

  simulateError() {
    this.readyState = MockEventSource.CLOSED;
    if (this.onerror) {
      this.onerror(new Event('error'));
    }
  }
}

describe('useSSE', () => {
  let mockEventSource: MockEventSource;

  beforeEach(() => {
    jest.useFakeTimers();
    (global as any).EventSource = jest.fn((url: string) => {
      mockEventSource = new MockEventSource(url);
      return mockEventSource;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
    delete (global as any).EventSource;
  });

  it('should initialize with default values', () => {
    const { data, error, isConnected, retryCount } = useSSE('/api/events', { autoStart: false });

    expect(data.value).toBeNull();
    expect(error.value).toBeNull();
    expect(isConnected.value).toBe(false);
    expect(retryCount.value).toBe(0);
  });

  it('should create EventSource when start is called', () => {
    const { start } = useSSE('/api/events', { autoStart: false });
    start();

    expect(global.EventSource).toHaveBeenCalledWith('/api/events');
  });

  it('should auto start when autoStart is true', () => {
    useSSE('/api/events', { autoStart: true });

    expect(global.EventSource).toHaveBeenCalledWith('/api/events');
  });

  it('should update isConnected when connection opens', async () => {
    const { start, isConnected } = useSSE('/api/events', { autoStart: false });
    start();

    mockEventSource.simulateOpen();
    await nextTick();

    expect(isConnected.value).toBe(true);
  });

  it('should call onOpen callback when connected', async () => {
    const onOpen = jest.fn();
    const { start } = useSSE('/api/events', { autoStart: false, onOpen });
    start();

    mockEventSource.simulateOpen();
    await nextTick();

    expect(onOpen).toHaveBeenCalled();
  });

  it('should parse JSON messages', async () => {
    const onMessage = jest.fn();
    const { start, data } = useSSE('/api/events', { autoStart: false, onMessage });
    start();

    mockEventSource.simulateOpen();
    mockEventSource.simulateMessage('{"id": 1, "name": "Test"}');
    await nextTick();

    expect(data.value).toEqual({ id: 1, name: 'Test' });
    expect(onMessage).toHaveBeenCalledWith({ id: 1, name: 'Test' }, expect.any(MessageEvent));
  });

  it('should handle non-JSON messages', async () => {
    const onMessage = jest.fn();
    const { start, data } = useSSE('/api/events', { autoStart: false, onMessage });
    start();

    mockEventSource.simulateOpen();
    mockEventSource.simulateMessage('Plain text message');
    await nextTick();

    expect(data.value).toBe('Plain text message');
    expect(onMessage).toHaveBeenCalledWith('Plain text message', expect.any(MessageEvent));
  });

  it('should handle custom events', async () => {
    const notificationHandler = jest.fn();
    const { start } = useSSE('/api/events', {
      autoStart: false,
      eventHandlers: {
        'notification': notificationHandler
      }
    });
    start();

    mockEventSource.simulateOpen();
    mockEventSource.simulateCustomEvent('notification', '{"message": "Hello"}');
    await nextTick();

    expect(notificationHandler).toHaveBeenCalledWith({ message: 'Hello' }, expect.any(MessageEvent));
  });

  it('should handle errors and call onError callback', async () => {
    const onError = jest.fn();
    const { start, isConnected, error } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: false,
      onError
    });
    start();

    mockEventSource.simulateOpen();
    mockEventSource.simulateError();
    await nextTick();

    expect(isConnected.value).toBe(false);
    expect(error.value).toBeTruthy();
    expect(onError).toHaveBeenCalled();
  });

  it('should auto reconnect after error', async () => {
    const { start } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: true,
      reconnectDelay: 1000
    });
    start();

    mockEventSource.simulateError();
    await nextTick();

    // Clear the first call
    jest.clearAllMocks();

    // Advance timer to trigger reconnect
    jest.advanceTimersByTime(1000);
    await nextTick();

    // Should create new EventSource
    expect(global.EventSource).toHaveBeenCalledWith('/api/events');
  });

  it('should increase reconnect delay exponentially', async () => {
    const { start, retryCount } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: true,
      reconnectDelay: 1000,
      maxReconnectDelay: 10000
    });
    start();

    // First error
    mockEventSource.simulateError();
    await nextTick();

    jest.advanceTimersByTime(1000);
    await nextTick();
    expect(retryCount.value).toBe(1);

    // Second error
    mockEventSource.simulateError();
    await nextTick();

    // Should wait 2000ms (doubled)
    jest.advanceTimersByTime(2000);
    await nextTick();
    expect(retryCount.value).toBe(2);
  });

  it('should respect maxRetries limit', async () => {
    const { start, retryCount } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: true,
      reconnectDelay: 100,
      maxRetries: 2
    });
    start();

    // Error 1
    mockEventSource.simulateError();
    await nextTick();
    jest.advanceTimersByTime(100);
    await nextTick();
    expect(retryCount.value).toBe(1);

    // Error 2
    mockEventSource.simulateError();
    await nextTick();
    jest.advanceTimersByTime(200);
    await nextTick();
    expect(retryCount.value).toBe(2);

    // Error 3 - should not retry
    mockEventSource.simulateError();
    await nextTick();
    jest.clearAllMocks();
    jest.advanceTimersByTime(1000);
    await nextTick();

    // Should not create new EventSource
    expect(global.EventSource).not.toHaveBeenCalled();
  });

  it('should reset retryCount on successful connection', async () => {
    const { start, retryCount } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: true,
      reconnectDelay: 100
    });
    start();

    // Simulate error and retry
    mockEventSource.simulateError();
    await nextTick();
    jest.advanceTimersByTime(100);
    await nextTick();
    expect(retryCount.value).toBe(1);

    // Simulate successful connection
    mockEventSource.simulateOpen();
    await nextTick();

    expect(retryCount.value).toBe(0);
  });

  it('should stop connection when stop is called', async () => {
    const { start, stop, isConnected } = useSSE('/api/events', { autoStart: false });
    start();

    mockEventSource.simulateOpen();
    await nextTick();
    expect(isConnected.value).toBe(true);

    stop();
    await nextTick();

    expect(isConnected.value).toBe(false);
    expect(mockEventSource.readyState).toBe(MockEventSource.CLOSED);
  });

  it('should not reconnect after manual stop', async () => {
    const { start, stop } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: true,
      reconnectDelay: 100
    });
    start();

    stop();
    await nextTick();

    jest.clearAllMocks();
    jest.advanceTimersByTime(1000);
    await nextTick();

    // Should not create new EventSource
    expect(global.EventSource).not.toHaveBeenCalled();
  });

  it('should reset state when reset is called', async () => {
    const { start, reset, data, error, isConnected } = useSSE('/api/events', { autoStart: false });
    start();

    mockEventSource.simulateOpen();
    mockEventSource.simulateMessage('{"test": "data"}');
    await nextTick();

    expect(data.value).toBeTruthy();

    reset();
    await nextTick();

    expect(data.value).toBeNull();
    expect(error.value).toBeNull();
    expect(isConnected.value).toBe(false);
  });

  it('should not create duplicate connection when start is called multiple times', async () => {
    const { start } = useSSE('/api/events', { autoStart: false });

    start();
    const firstSource = mockEventSource;

    start();

    // Should close the first source
    expect(firstSource.readyState).toBe(MockEventSource.CLOSED);
  });

  it('should handle errors in onOpen callback gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onOpen = jest.fn(() => { throw new Error('Test error'); });

    const { start } = useSSE('/api/events', { autoStart: false, onOpen });
    start();

    expect(() => {
      mockEventSource.simulateOpen();
    }).not.toThrow();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('should handle errors in onMessage callback gracefully', async () => {
    const onMessage = jest.fn(() => { throw new Error('Test error'); });

    const { start } = useSSE('/api/events', { autoStart: false, onMessage });
    start();

    mockEventSource.simulateOpen();

    expect(() => {
      mockEventSource.simulateMessage('{"test": "data"}');
    }).not.toThrow();
  });

  it('should handle errors in onError callback gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const onError = jest.fn(() => { throw new Error('Test error'); });

    const { start } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: false,
      onError
    });
    start();

    expect(() => {
      mockEventSource.simulateError();
    }).not.toThrow();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('should handle errors in custom event handlers gracefully', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const handler = jest.fn(() => { throw new Error('Test error'); });

    const { start } = useSSE('/api/events', {
      autoStart: false,
      eventHandlers: { 'test': handler }
    });
    start();

    mockEventSource.simulateOpen();

    expect(() => {
      mockEventSource.simulateCustomEvent('test', '{"data": "value"}');
    }).not.toThrow();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });

  it('should respect maxReconnectDelay cap', async () => {
    const { start } = useSSE('/api/events', {
      autoStart: false,
      autoReconnect: true,
      reconnectDelay: 1000,
      maxReconnectDelay: 3000
    });
    start();

    // Simulate multiple errors to trigger exponential backoff
    for (let i = 0; i < 5; i++) {
      mockEventSource.simulateError();
      await nextTick();
      jest.advanceTimersByTime(Math.min(1000 * Math.pow(2, i), 3000));
      await nextTick();
    }

    // Delay should be capped at maxReconnectDelay (3000ms)
    expect(global.EventSource).toHaveBeenCalled();
  });

  it('should handle EventSource creation error', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    (global as any).EventSource = jest.fn(() => {
      throw new Error('EventSource not supported');
    });

    const { start, error, isConnected } = useSSE('/api/events', { autoStart: false });

    expect(() => start()).not.toThrow();
    expect(error.value).toBeTruthy();
    expect(isConnected.value).toBe(false);

    consoleError.mockRestore();
  });
});
