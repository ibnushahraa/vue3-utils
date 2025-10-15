import { ref, readonly, inject } from "vue";

const ToastSymbol = Symbol("Toast");

function createToast() {
  const toasts = ref([]);

  const show = (message, options = {}) => {
    const { type = "info", duration = 3000, position = "top-right" } = options;

    const id = Date.now();
    toasts.value.push({
      id,
      message,
      type,
      position,
      duration,
      start: Date.now(),
    });

    setTimeout(() => {
      toasts.value = toasts.value.filter((t) => t.id !== id);
    }, duration);
  };

  return {
    toasts: readonly(toasts),
    show,
  };
}

export function useToast() {
  return inject(ToastSymbol, createToast());
}

const globalToast = createToast();
if (typeof window !== "undefined") window.$toast = globalToast;

export default {
  install(app) {
    app.provide(ToastSymbol, globalToast);
    app.config.globalProperties.$toast = globalToast;
  },
  toast: globalToast,
};
