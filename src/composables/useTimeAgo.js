import { ref, computed, onMounted, onUnmounted } from "vue";

const now = ref(Date.now());
let timer = null;
let subscriberCount = 0;

function startGlobalTimer() {
  if (!timer) {
    timer = setInterval(() => {
      now.value = Date.now();
    }, 60000);
  }
}

function stopGlobalTimer() {
  if (timer && subscriberCount === 0) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * Composable reaktif untuk menampilkan "time ago" multi-bahasa.
 * @param {Date|string|number} date - tanggal target
 * @param {string} locale - kode bahasa ('id', 'en', 'ms', dll)
 */
export function useTimeAgo(date, locale = "id") {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  const text = computed(() => {
    const diffSeconds = Math.floor((new Date(date) - now.value) / 1000);
    const abs = Math.abs(diffSeconds);

    const units = [
      ["year", 31536000],
      ["month", 2592000],
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60],
      ["second", 1],
    ];

    for (const [unit, secs] of units) {
      if (abs >= secs || unit === "second") {
        const value = Math.round(diffSeconds / secs);
        return rtf.format(value, unit);
      }
    }
  });

  onMounted(() => {
    subscriberCount++;
    startGlobalTimer();
  });

  onUnmounted(() => {
    subscriberCount--;
    stopGlobalTimer();
  });

  return { text };
}
