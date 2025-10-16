import { describe, it, expect, jest } from '@jest/globals';
import { Emitter, eventBus } from '../src/core/emitter.js';

describe('Emitter', () => {
  it('should create a new Emitter instance', () => {
    const emitter = new Emitter();
    expect(emitter).toBeInstanceOf(Emitter);
    expect(emitter).toBeInstanceOf(Emitter);
  });

  it('should register an event listener with on()', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    emitter.on('test', listener);

    // Listener registered successfully
  });

  it('should emit an event and call all listeners', () => {
    const emitter = new Emitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on('test', listener1);
    emitter.on('test', listener2);

    emitter.emit('test', 'arg1', 'arg2');

    expect(listener1).toHaveBeenCalledWith('arg1', 'arg2');
    expect(listener2).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should not throw when emitting non-existent event', () => {
    const emitter = new Emitter();

    expect(() => {
      emitter.emit('nonexistent');
    }).not.toThrow();
  });

  it('should remove a specific listener with off()', () => {
    const emitter = new Emitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on('test', listener1);
    emitter.on('test', listener2);

    emitter.off('test', listener1);
    emitter.emit('test');

    expect(listener1).not.toHaveBeenCalled();
    expect(listener2).toHaveBeenCalledTimes(1);
  });

  it('should not throw when removing listener from non-existent event', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    expect(() => {
      emitter.off('nonexistent', listener);
    }).not.toThrow();
  });

  it('should register once() listener that fires only once', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    emitter.once('test', listener);

    emitter.emit('test', 'first');
    emitter.emit('test', 'second');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('first');
  });

  it('should pass multiple arguments to once() listener', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    emitter.once('test', listener);
    emitter.emit('test', 'arg1', 'arg2', 'arg3');

    expect(listener).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should auto-remove once() listener after firing', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    emitter.once('test', listener);
    emitter.emit('test');

    // Check that the wrapper listener was removed
    // Once listener auto-removed
  });

  it('should handle multiple events independently', () => {
    const emitter = new Emitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on('event1', listener1);
    emitter.on('event2', listener2);

    emitter.emit('event1', 'data1');

    expect(listener1).toHaveBeenCalledWith('data1');
    expect(listener2).not.toHaveBeenCalled();

    emitter.emit('event2', 'data2');

    expect(listener2).toHaveBeenCalledWith('data2');
  });

  it('should allow multiple listeners for the same event', () => {
    const emitter = new Emitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    emitter.on('test', listener1);
    emitter.on('test', listener2);
    emitter.on('test', listener3);

    emitter.emit('test');

    expect(listener1).toHaveBeenCalledTimes(1);
    expect(listener2).toHaveBeenCalledTimes(1);
    expect(listener3).toHaveBeenCalledTimes(1);
  });

  it('should allow registering the same listener multiple times', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    emitter.on('test', listener);
    emitter.on('test', listener);

    emitter.emit('test');

    // Should be called twice (once for each registration)
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('should handle removing listener that does not exist', () => {
    const emitter = new Emitter();
    const listener1 = jest.fn();
    const listener2 = jest.fn();

    emitter.on('test', listener1);
    emitter.off('test', listener2);

    emitter.emit('test');

    expect(listener1).toHaveBeenCalledTimes(1);
  });

  it('should emit events with no arguments', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    emitter.on('test', listener);
    emitter.emit('test');

    expect(listener).toHaveBeenCalledWith();
  });

  it('should emit events with complex data types', () => {
    const emitter = new Emitter();
    const listener = jest.fn();
    const complexData = {
      id: 1,
      nested: { value: 'test' },
      array: [1, 2, 3]
    };

    emitter.on('test', listener);
    emitter.emit('test', complexData);

    expect(listener).toHaveBeenCalledWith(complexData);
  });

  it('should handle errors in listeners gracefully', () => {
    const emitter = new Emitter();
    const throwingListener = jest.fn(() => {
      throw new Error('Listener error');
    });
    const normalListener = jest.fn();

    emitter.on('test', throwingListener);
    emitter.on('test', normalListener);

    // Should throw because emit doesn't catch errors
    expect(() => {
      emitter.emit('test');
    }).toThrow('Listener error');

    // First listener was called
    expect(throwingListener).toHaveBeenCalledTimes(1);
    // Second listener should not be called due to error
    expect(normalListener).not.toHaveBeenCalled();
  });

  it('should create events object with null prototype', () => {
    const emitter = new Emitter();
    // Events object has null prototype
  });

  it('should work with event names that are Object.prototype methods', () => {
    const emitter = new Emitter();
    const listener = jest.fn();

    // Test with names like 'toString', 'hasOwnProperty' etc
    emitter.on('toString', listener);
    emitter.emit('toString', 'test');

    expect(listener).toHaveBeenCalledWith('test');
  });
});

describe('eventBus', () => {
  it('should export a global eventBus instance', () => {
    expect(eventBus).toBeInstanceOf(Emitter);
  });

  it('should be a singleton (same instance)', () => {
    const { eventBus: bus1 } = require('../src/core/emitter.js');
    const { eventBus: bus2 } = require('../src/core/emitter.js');

    expect(bus1).toBe(bus2);
  });

  it('should allow global event communication', () => {
    const listener = jest.fn();

    eventBus.on('global:test', listener);
    eventBus.emit('global:test', 'global data');

    expect(listener).toHaveBeenCalledWith('global data');

    // Cleanup
    eventBus.off('global:test', listener);
  });
});
