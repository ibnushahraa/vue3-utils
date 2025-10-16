import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { useEventBus } from '../src/wrapper/useEventBus.js';
import { Emitter } from '../src/core/emitter.js';

describe('useEventBus', () => {
  beforeEach(() => {
    // Clear all event listeners before each test
    const bus = useEventBus();
    // Clear handled in each test
  });

  it('should return an Emitter instance', () => {
    const bus = useEventBus();
    expect(bus).toBeInstanceOf(Emitter);
  });

  it('should return the same instance on multiple calls', () => {
    const bus1 = useEventBus();
    const bus2 = useEventBus();
    expect(bus1).toBe(bus2);
  });

  it('should allow emitting and listening to events', () => {
    const bus = useEventBus();
    const listener = jest.fn();

    bus.on('test:event', listener);
    bus.emit('test:event', 'data');

    expect(listener).toHaveBeenCalledWith('data');
  });

  it('should support multiple listeners for same event', () => {
    const bus = useEventBus();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    bus.on('user:updated', listener1);
    bus.on('user:updated', listener2);

    bus.emit('user:updated', { id: 123, name: 'John' });

    expect(listener1).toHaveBeenCalledWith({ id: 123, name: 'John' });
    expect(listener2).toHaveBeenCalledWith({ id: 123, name: 'John' });
  });

  it('should allow removing event listeners', () => {
    const bus = useEventBus();
    const listener = jest.fn();

    bus.on('test:event', listener);
    bus.emit('test:event');
    expect(listener).toHaveBeenCalledTimes(1);

    bus.off('test:event', listener);
    bus.emit('test:event');
    expect(listener).toHaveBeenCalledTimes(1); // Still 1, not called again
  });

  it('should support once() for single-fire listeners', () => {
    const bus = useEventBus();
    const listener = jest.fn();

    bus.once('notification', listener);

    bus.emit('notification', 'First');
    bus.emit('notification', 'Second');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('First');
  });

  it('should pass multiple arguments to listeners', () => {
    const bus = useEventBus();
    const listener = jest.fn();

    bus.on('multi:arg', listener);
    bus.emit('multi:arg', 'arg1', 'arg2', 'arg3');

    expect(listener).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should handle complex data types', () => {
    const bus = useEventBus();
    const listener = jest.fn();
    const complexData = {
      user: { id: 1, name: 'John' },
      items: [1, 2, 3],
      meta: { timestamp: Date.now() }
    };

    bus.on('data:received', listener);
    bus.emit('data:received', complexData);

    expect(listener).toHaveBeenCalledWith(complexData);
  });

  it('should handle event names with special characters', () => {
    const bus = useEventBus();
    const listener = jest.fn();

    bus.on('user:login:success', listener);
    bus.emit('user:login:success', 'logged in');

    expect(listener).toHaveBeenCalledWith('logged in');
  });

  it('should not interfere with different event names', () => {
    const bus = useEventBus();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    bus.on('event:a', listener1);
    bus.on('event:b', listener2);

    bus.emit('event:a', 'data-a');

    expect(listener1).toHaveBeenCalledWith('data-a');
    expect(listener2).not.toHaveBeenCalled();
  });

  it('should work for cross-component communication', () => {
    // Simulate Component A
    const busA = useEventBus();
    const componentAListener = jest.fn();
    busA.on('global:update', componentAListener);

    // Simulate Component B
    const busB = useEventBus();
    busB.emit('global:update', { message: 'Hello from B' });

    // Component A should receive the event
    expect(componentAListener).toHaveBeenCalledWith({ message: 'Hello from B' });
  });

  it('should handle rapid event emissions', () => {
    const bus = useEventBus();
    const listener = jest.fn();

    bus.on('rapid:event', listener);

    for (let i = 0; i < 100; i++) {
      bus.emit('rapid:event', i);
    }

    expect(listener).toHaveBeenCalledTimes(100);
  });

  it('should maintain event isolation', () => {
    const bus = useEventBus();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    bus.on('isolated:1', listener1);
    bus.on('isolated:2', listener2);

    bus.emit('isolated:1', 'data1');
    bus.emit('isolated:2', 'data2');

    expect(listener1).toHaveBeenCalledWith('data1');
    expect(listener1).not.toHaveBeenCalledWith('data2');
    expect(listener2).toHaveBeenCalledWith('data2');
    expect(listener2).not.toHaveBeenCalledWith('data1');
  });

  it('should handle listener that throws error', () => {
    const bus = useEventBus();
    const throwingListener = jest.fn(() => {
      throw new Error('Listener error');
    });
    const normalListener = jest.fn();

    bus.on('error:test', throwingListener);
    bus.on('error:test', normalListener);

    expect(() => {
      bus.emit('error:test');
    }).toThrow('Listener error');

    expect(throwingListener).toHaveBeenCalled();
    // Due to the error, subsequent listeners won't be called
    expect(normalListener).not.toHaveBeenCalled();
  });

  it('should allow re-registering after removal', () => {
    const bus = useEventBus();
    const listener = jest.fn();

    bus.on('reregister', listener);
    bus.emit('reregister');
    expect(listener).toHaveBeenCalledTimes(1);

    bus.off('reregister', listener);
    bus.emit('reregister');
    expect(listener).toHaveBeenCalledTimes(1);

    bus.on('reregister', listener);
    bus.emit('reregister');
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
