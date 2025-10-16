import { Ref } from 'vue';

/**
 * Callback yang dipanggil saat menerima pesan dari SSE
 */
export type OnMessageCallback = (data: any, event: MessageEvent) => void;

/**
 * Callback yang dipanggil saat terjadi error pada SSE connection
 */
export type OnErrorCallback = (error: Event, retryCount: number) => void;

/**
 * Callback yang dipanggil saat SSE connection berhasil terbuka
 */
export type OnOpenCallback = (event: Event) => void;

/**
 * Callback untuk custom event handlers
 */
export type EventHandlerCallback = (data: any, event: Event) => void;

/**
 * Konfigurasi options untuk useSSE composable
 */
export interface SSEOptions {
  /**
   * Mulai otomatis saat composable dipanggil
   * @default false
   */
  autoStart?: boolean;

  /**
   * Auto reconnect saat connection terputus
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Delay awal reconnect dalam milliseconds
   * @default 1000
   */
  reconnectDelay?: number;

  /**
   * Maximum delay untuk reconnect dalam milliseconds
   * @default 30000
   */
  maxReconnectDelay?: number;

  /**
   * Maksimal jumlah retry attempts
   * @default Infinity
   */
  maxRetries?: number;

  /**
   * Callback yang dipanggil saat menerima pesan
   */
  onMessage?: OnMessageCallback;

  /**
   * Callback yang dipanggil saat terjadi error
   */
  onError?: OnErrorCallback;

  /**
   * Callback yang dipanggil saat connection berhasil terbuka
   */
  onOpen?: OnOpenCallback;

  /**
   * Custom event handlers untuk SSE events
   * @example
   * {
   *   'notification': (data) => console.log(data),
   *   'update': (data) => handleUpdate(data)
   * }
   */
  eventHandlers?: Record<string, EventHandlerCallback>;
}

/**
 * Return type dari useSSE composable
 */
export interface SSEReturn {
  /**
   * Reactive data terbaru yang diterima dari SSE
   */
  data: Ref<any>;

  /**
   * Reactive error object jika ada error
   */
  error: Ref<Event | null>;

  /**
   * Reactive connection status
   */
  isConnected: Ref<boolean>;

  /**
   * Reactive retry attempt counter
   */
  retryCount: Ref<number>;

  /**
   * Memulai SSE connection
   */
  start: () => void;

  /**
   * Menghentikan SSE connection secara manual
   */
  stop: () => void;

  /**
   * Reset state (stop + clear data/error)
   */
  reset: () => void;
}

/**
 * Reactive composable untuk Server-Sent Events (SSE) dengan auto-reconnection
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { data, isConnected, start, stop } = useSSE('/api/events', {
 *   autoStart: true,
 *   onMessage: (data) => console.log('Received:', data)
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage dengan custom events dan error handling
 * const sse = useSSE('/api/stream', {
 *   autoReconnect: true,
 *   reconnectDelay: 2000,
 *   maxRetries: 5,
 *   onOpen: () => console.log('Connected!'),
 *   onError: (err, retries) => console.log(`Error, retry attempt: ${retries}`),
 *   onMessage: (data) => console.log('Default message:', data),
 *   eventHandlers: {
 *     'notification': (data) => showNotification(data),
 *     'update': (data) => updateUI(data)
 *   }
 * });
 * ```
 *
 * @param url - URL endpoint untuk SSE connection
 * @param options - Konfigurasi optional untuk SSE
 * @returns Object dengan reactive state dan control methods
 */
export declare function useSSE(url: string, options?: SSEOptions): SSEReturn;
