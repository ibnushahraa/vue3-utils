// composables/useSSE.js
import { ref, onBeforeUnmount } from "vue";

/**
 * @typedef {Object} SSEOptions
 * @property {boolean} [autoStart=false] - Mulai otomatis saat composable dipanggil
 * @property {boolean} [autoReconnect=true] - Auto reconnect saat connection terputus
 * @property {number} [reconnectDelay=1000] - Delay awal reconnect dalam milliseconds
 * @property {number} [maxReconnectDelay=30000] - Maximum delay untuk reconnect dalam milliseconds
 * @property {number} [maxRetries=Infinity] - Maksimal jumlah retry attempts
 * @property {OnMessageCallback} [onMessage] - Callback yang dipanggil saat menerima pesan
 * @property {OnErrorCallback} [onError] - Callback yang dipanggil saat terjadi error
 * @property {OnOpenCallback} [onOpen] - Callback yang dipanggil saat connection berhasil terbuka
 * @property {Object.<string, EventHandlerCallback>} [eventHandlers] - Custom event handlers untuk SSE events
 */

/**
 * @callback OnMessageCallback
 * @param {any} data - Data yang diterima (sudah di-parse jika JSON, atau raw string)
 * @param {MessageEvent} event - Raw MessageEvent object
 * @returns {void}
 */

/**
 * @callback OnErrorCallback
 * @param {Event} error - Error event object
 * @param {number} retryCount - Jumlah retry yang sudah dilakukan
 * @returns {void}
 */

/**
 * @callback OnOpenCallback
 * @param {Event} event - Open event object
 * @returns {void}
 */

/**
 * @callback EventHandlerCallback
 * @param {any} data - Data yang diterima dari custom event
 * @param {Event} event - Raw event object
 * @returns {void}
 */

/**
 * @typedef {Object} SSEReturn
 * @property {import('vue').Ref<any>} data - Reactive data terbaru yang diterima dari SSE
 * @property {import('vue').Ref<Event|null>} error - Reactive error object jika ada error
 * @property {import('vue').Ref<boolean>} isConnected - Reactive connection status
 * @property {import('vue').Ref<number>} retryCount - Reactive retry attempt counter
 * @property {Function} start - Function untuk memulai SSE connection
 * @property {Function} stop - Function untuk menghentikan SSE connection secara manual
 * @property {Function} reset - Function untuk reset state (stop + clear data/error)
 */

/**
 * Reactive composable untuk Server-Sent Events (SSE) dengan auto-reconnection
 *
 * @example
 * // Basic usage
 * const { data, isConnected, start, stop } = useSSE('/api/events', {
 *   autoStart: true,
 *   onMessage: (data) => console.log('Received:', data)
 * });
 *
 * @example
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
 *
 * @param {string} url - URL endpoint untuk SSE connection
 * @param {SSEOptions} [options={}] - Konfigurasi optional untuk SSE
 * @returns {SSEReturn} Object dengan reactive state dan control methods
 */
export function useSSE(url, options = {}) {
  const {
    autoStart = false,
    autoReconnect = true,
    reconnectDelay = 1000,
    maxReconnectDelay = 30000,
    maxRetries = Infinity,
    onMessage = null,
    onError = null,
    onOpen = null,
    eventHandlers = {},
  } = options;

  const data = ref(null);
  const error = ref(null);
  const isConnected = ref(false);
  const retryCount = ref(0);

  let source = null;
  let reconnectTimer = null;
  let currentReconnectDelay = reconnectDelay;
  let isManuallyClosed = false;

  const clearReconnectTimer = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (!autoReconnect || isManuallyClosed || retryCount.value >= maxRetries) {
      return;
    }

    clearReconnectTimer();
    reconnectTimer = setTimeout(() => {
      retryCount.value++;
      currentReconnectDelay = Math.min(
        currentReconnectDelay * 2,
        maxReconnectDelay
      );
      start();
    }, currentReconnectDelay);
  };

  const start = () => {
    // Jika sudah ada connection yang aktif, jangan buat baru
    if (source && source.readyState !== EventSource.CLOSED) {
      return;
    }

    // Cleanup existing connection
    if (source) {
      source.close();
      source = null;
    }

    isManuallyClosed = false;
    error.value = null;

    try {
      source = new EventSource(url);

      source.onopen = (event) => {
        isConnected.value = true;
        retryCount.value = 0;
        currentReconnectDelay = reconnectDelay;
        error.value = null;

        try {
          onOpen?.(event);
        } catch (err) {
          console.error("Error in onOpen callback:", err);
        }
      };

      source.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          data.value = parsed;
          onMessage?.(parsed, event);
        } catch {
          data.value = event.data;
          onMessage?.(event.data, event);
        }
      };

      source.onerror = (e) => {
        error.value = e;
        isConnected.value = false;

        try {
          onError?.(e, retryCount.value);
        } catch (err) {
          console.error("Error in onError callback:", err);
        }

        // Cleanup current connection
        if (source) {
          source.close();
          source = null;
        }

        // Schedule reconnect jika belum manually closed
        scheduleReconnect();
      };

      // Register custom event handlers
      Object.entries(eventHandlers).forEach(([eventName, handler]) => {
        if (source && typeof handler === "function") {
          source.addEventListener(eventName, (event) => {
            try {
              let eventData;
              try {
                eventData = JSON.parse(event.data);
              } catch {
                eventData = event.data;
              }
              handler(eventData, event);
            } catch (err) {
              console.error(`Error in custom event handler (${eventName}):`, err);
            }
          });
        }
      });
    } catch (err) {
      error.value = err;
      isConnected.value = false;
      console.error("Error creating EventSource:", err);
    }
  };

  const stop = () => {
    isManuallyClosed = true;
    clearReconnectTimer();

    if (source) {
      source.close();
      source = null;
      isConnected.value = false;
    }

    retryCount.value = 0;
    currentReconnectDelay = reconnectDelay;
  };

  const reset = () => {
    stop();
    data.value = null;
    error.value = null;
  };

  // Auto cleanup saat component unmount
  onBeforeUnmount(stop);

  // Auto start jika diminta
  if (autoStart) {
    start();
  }

  return {
    data,
    error,
    isConnected,
    retryCount,
    start,
    stop,
    reset,
  };
}
