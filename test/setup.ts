// Suppress Vue lifecycle warnings in tests
// These warnings are expected when testing composables outside component context
const originalWarn = console.warn;

beforeAll(() => {
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('[Vue warn]') ||
        message.includes('onMounted is called when there is no active component instance') ||
        message.includes('onUnmounted is called when there is no active component instance'))
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
