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
 * Menggunakan Intl.RelativeTimeFormat untuk format waktu relatif yang otomatis update setiap menit.
 * Timer global dibagikan antar instance untuk efisiensi performa.
 *
 * @param {Date|string|number} date - Tanggal target yang akan dibandingkan dengan waktu sekarang
 * @param {string} [locale="id"] - Kode bahasa ISO 639-1 ('id', 'en', 'ms', 'ja', dll)
 * @returns {Object} Object yang berisi computed text
 * @returns {import('vue').ComputedRef<string>} returns.text - Teks waktu relatif (misal: "2 jam yang lalu", "dalam 3 hari")
 *
 * @example
 * // Bahasa Indonesia (default)
 * const { text } = useTimeAgo(new Date('2024-01-01'));
 * // text.value → "10 bulan yang lalu"
 *
 * @example
 * // Bahasa Inggris
 * const { text } = useTimeAgo('2024-12-31', 'en');
 * // text.value → "in 2 months"
 *
 * @example
 * // Dengan timestamp Unix
 * const { text } = useTimeAgo(1672531200000, 'ms');
 * // text.value → "1 tahun yang lalu" (Bahasa Melayu)
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
