# vue3-utils

[![Test](https://github.com/ibnushahraa/vue3-utils/actions/workflows/test.yml/badge.svg)](https://github.com/ibnushahraa/vue3-utils/actions/workflows/test.yml)
![Coverage](https://img.shields.io/badge/coverage-92%25-brightgreen)
[![npm version](https://img.shields.io/github/package-json/v/ibnushahraa/vue3-utils)](https://github.com/ibnushahraa/vue3-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Kumpulan composable dan wrapper utility untuk Vue 3

## 📋 Daftar Isi

- [📦 Instalasi](#-instalasi)
- [🚀 Composables](#-composables)
  - [useCountdown](#usecountdown)
  - [useTimeAgo](#usetimeago)
  - [useCountUp](#usecountup)
  - [useTypewriter](#usetypewriter)
  - [useSSE](#usesse)
  - [useClipboard](#useclipboard)
  - [useRandomWords 🆕](#userandomwords-)
  - [useTheme 🆕](#usetheme-)
  - [useDevice 🆕](#usedevice-)
- [🔧 Wrapper](#-wrapper)
  - [useEventBus](#useeventbus)
  - [useFetch](#usefetch)
  - [useAuthGuard](#useauthguard)
  - [useFetchServer](#usefetchserver)
  - [useDateTime](#usedatetime)
  - [useCurrency](#usecurrency)
- [📄 License](#-license)

## 📦 Instalasi

### Install Latest Version

```bash
npm install github:ibnushahraa/vue3-utils
```

### Install Specific Version

```bash
# Install versi tertentu (recommended untuk production)
npm install github:ibnushahraa/vue3-utils#v0.0.4

# Atau dengan semver tag
npm install github:ibnushahraa/vue3-utils#semver:^0.0.4
```

### Update Library

Jika ada penambahan fitur baru, update library dengan perintah:

```bash
npm update vue3-utils
```

Atau untuk memaksa update ke versi terbaru:

```bash
npm install github:ibnushahraa/vue3-utils@latest
```

### Version Info

Current version: **v0.0.4** (Pre-release)

Lihat [CHANGELOG.md](CHANGELOG.md) untuk detail perubahan setiap versi.

## 🚀 Usage

### useCountdown

Composable untuk fungsionalitas timer hitung mundur.

```javascript
import { useCountdown } from "vue3-utils";

const expiredAt = Math.floor(Date.now() / 1000) + 3600; // 1 jam dari sekarang

const {
  hours,
  minutes,
  seconds,
  remaining,
  onSuccess,
  onExpired,
  triggerSuccess,
} = useCountdown(expiredAt, {
  onExpired: () => {
    console.log("Waktu habis!");
  },
});

// Set handler untuk event success (opsional)
onSuccess(() => {
  console.log("Countdown dihentikan secara manual!");
});

// Set handler untuk event expired (bisa override yang di options)
onExpired(() => {
  console.log("Timer expired!");
});

// Trigger success secara manual (misal saat pembayaran berhasil)
triggerSuccess();
```

#### Parameter

- `expiredUnix` (number): Unix timestamp kapan countdown berakhir
- `options` (object, opsional):
  - `onExpired` (function): Callback yang dipanggil saat countdown mencapai 0

#### Return

- `hours` (computed): Jam tersisa (format: "00")
- `minutes` (computed): Menit tersisa (format: "00")
- `seconds` (computed): Detik tersisa (format: "00")
- `remaining` (ref): Total detik tersisa
- `onExpired` (function): Set handler untuk event expired
- `onSuccess` (function): Set handler untuk event success
- `triggerSuccess` (function): Trigger success secara manual dan hentikan timer

### useTimeAgo

Composable untuk menampilkan waktu relatif dalam berbagai bahasa dengan pembaruan otomatis.

```javascript
import { useTimeAgo } from "vue3-utils";

// Bahasa Indonesia (default)
const { text: timeAgoId } = useTimeAgo(new Date("2024-01-01"));
console.log(timeAgoId.value); // "10 bulan yang lalu"

// Bahasa Inggris
const { text: timeAgoEn } = useTimeAgo("2024-12-31", "en");
console.log(timeAgoEn.value); // "in 2 months"

// Dengan Unix timestamp (Bahasa Melayu)
const timestamp = 1672531200000;
const { text: timeAgoMs } = useTimeAgo(timestamp, "ms");
console.log(timeAgoMs.value); // "1 tahun yang lalu"

// Gunakan di template
// <p>{{ text }}</p>
```

#### Parameter

- `date` (Date|string|number): Tanggal target yang akan dibandingkan dengan waktu sekarang
- `locale` (string, opsional, default: "id"): Kode bahasa ISO 639-1 ('id', 'en', 'ms', 'ja', dll)

#### Return

- `text` (computed): Teks waktu relatif yang otomatis update setiap menit

#### Fitur

- **Multi-bahasa**: Mendukung semua locale yang didukung oleh Intl.RelativeTimeFormat
- **Auto-update**: Teks otomatis update setiap 1 menit
- **Shared timer**: Menggunakan timer global yang dibagikan antar instance untuk efisiensi performa
- **Format otomatis**: Memilih unit waktu yang paling sesuai (detik, menit, jam, hari, bulan, tahun)

### useCountUp

Composable untuk animasi count up seperti countup.js.

```javascript
import { useCountUp } from "vue3-utils";

// Basic usage - animasi dari 0 ke 1000
const { displayValue, start } = useCountUp(1000);
start();

// Dengan opsi lengkap
const counter = useCountUp(5000, {
  startValue: 0,
  duration: 3000, // durasi dalam ms
  decimalPlaces: 2,
  separator: ",", // separator ribuan
  decimal: ".",
  prefix: "Rp ",
  suffix: "",
  useEasing: true,
  onComplete: () => {
    console.log("Animasi selesai!");
  },
});

// Kontrol animasi
counter.start(); // mulai animasi
counter.pause(); // pause animasi
counter.resume(); // lanjutkan animasi
counter.reset(); // reset ke nilai awal

// Update ke nilai baru (animasi dari nilai saat ini)
counter.update(10000);

// Gunakan di template
// <h1>{{ displayValue }}</h1>
```

#### Parameter

- `endValue` (number): Nilai akhir yang ingin dicapai
- `options` (object, opsional):
  - `startValue` (number, default: 0): Nilai awal
  - `duration` (number, default: 2000): Durasi animasi dalam milidetik
  - `decimalPlaces` (number, default: 0): Jumlah angka desimal
  - `separator` (string, default: ""): Separator ribuan (contoh: ",")
  - `decimal` (string, default: "."): Separator desimal
  - `prefix` (string, default: ""): Prefix sebelum angka (contoh: "$")
  - `suffix` (string, default: ""): Suffix setelah angka (contoh: " USD")
  - `useEasing` (boolean, default: true): Gunakan easing function
  - `easingFn` (function): Custom easing function
  - `onComplete` (function): Callback saat animasi selesai

#### Return

- `displayValue` (ref): Nilai yang sudah diformat sebagai string (untuk ditampilkan)
- `currentValue` (ref): Nilai numerik saat ini
- `start` (function): Mulai animasi dari awal
- `pause` (function): Pause animasi
- `resume` (function): Lanjutkan animasi yang di-pause
- `reset` (function): Reset ke nilai awal
- `update` (function): Update ke nilai akhir baru dengan animasi

#### Fitur

- **Animasi halus**: Menggunakan requestAnimationFrame untuk performa optimal
- **Easing function**: Mendukung easing default (easeOutExpo) atau custom easing
- **Format angka**: Mendukung separator ribuan, desimal, prefix, dan suffix
- **Kontrol penuh**: Bisa start, pause, resume, reset, dan update nilai
- **Auto-cleanup**: Otomatis membersihkan animasi saat component unmount

### useTypewriter

Composable untuk membuat efek typewriter/typing animation dengan array teks.

```javascript
import { useTypewriter } from "vue3-utils";

// Basic usage
const { displayTextWithCursor } = useTypewriter([
  "Hello World",
  "Vue 3 is awesome",
  "TypeScript is great",
]);

// Gunakan di template
// <h1>{{ displayTextWithCursor }}</h1>

// Dengan opsi lengkap
const typewriter = useTypewriter(["First text", "Second text", "Third text"], {
  typeSpeed: 80, // kecepatan mengetik (ms per karakter)
  deleteSpeed: 40, // kecepatan menghapus (ms per karakter)
  delayBeforeDelete: 3000, // delay sebelum mulai hapus
  delayBeforeType: 500, // delay sebelum ketik teks berikutnya
  loop: true, // loop infinite
  autoStart: true, // auto start saat mount
  showCursor: true, // tampilkan cursor berkedip
  cursorChar: "_", // karakter cursor
  onTypeComplete: (text, index) => {
    console.log(`Selesai mengetik: ${text} (index: ${index})`);
  },
  onDeleteComplete: (index) => {
    console.log(`Selesai menghapus index: ${index}`);
  },
  onLoopComplete: () => {
    console.log("Loop selesai!");
  },
});

// Manual control
const typewriter = useTypewriter(["Text 1", "Text 2"], { autoStart: false });

typewriter.start(); // mulai atau restart animasi
typewriter.pause(); // pause animasi
typewriter.resume(); // lanjutkan animasi
typewriter.stop(); // stop dan reset
typewriter.next(); // skip ke teks berikutnya
typewriter.prev(); // skip ke teks sebelumnya

// Update array teks secara dinamis
typewriter.updateTexts(["New text 1", "New text 2"]);
```

#### Parameter

- `texts` (string[]): Array string yang akan ditampilkan dengan efek typewriter
- `options` (object, opsional):
  - `typeSpeed` (number, default: 100): Kecepatan mengetik dalam ms per karakter
  - `deleteSpeed` (number, default: 50): Kecepatan menghapus dalam ms per karakter
  - `delayBeforeDelete` (number, default: 2000): Delay sebelum mulai menghapus dalam ms
  - `delayBeforeType` (number, default: 500): Delay sebelum mengetik teks berikutnya dalam ms
  - `loop` (boolean, default: true): Loop terus menerus melalui array
  - `autoStart` (boolean, default: true): Autostart animasi saat composable di-mount
  - `showCursor` (boolean, default: true): Tampilkan cursor berkedip
  - `cursorChar` (string, default: "|"): Karakter cursor
  - `onTypeComplete` (function): Callback saat selesai mengetik satu teks
  - `onDeleteComplete` (function): Callback saat selesai menghapus satu teks
  - `onLoopComplete` (function): Callback saat loop selesai (jika loop: false)

#### Return

- `displayText` (ref): Teks yang sedang ditampilkan (tanpa cursor)
- `displayTextWithCursor` (computed): Teks lengkap dengan cursor berkedip
- `currentIndex` (ref): Index teks yang sedang aktif dari array
- `isTyping` (ref): Status apakah animasi sedang berjalan
- `isDeleting` (ref): Status apakah sedang menghapus
- `isPaused` (ref): Status apakah animasi sedang di-pause
- `start` (function): Mulai atau restart animasi
- `pause` (function): Pause animasi
- `resume` (function): Resume animasi yang di-pause
- `stop` (function): Stop animasi dan reset
- `next` (function): Skip ke teks berikutnya
- `prev` (function): Skip ke teks sebelumnya
- `updateTexts` (function): Update array teks secara dinamis

#### Fitur

- **Efek typewriter realistis**: Animasi mengetik dan menghapus karakter per karakter
- **Multiple texts**: Mendukung array teks yang ditampilkan secara berurutan
- **Cursor berkedip**: Cursor animasi yang dapat dikustomisasi
- **Loop control**: Bisa loop infinite atau sekali jalan
- **Manual control**: Kontrol penuh dengan start, pause, resume, stop, next, prev
- **Dynamic update**: Bisa update array teks saat runtime
- **Event callbacks**: Callback untuk setiap event penting
- **Auto-cleanup**: Otomatis membersihkan timeout dan interval saat unmount

#### ⚠️ IMPORTANT: Prevent Layout Shift

Untuk menghindari perubahan tinggi konten yang menyebabkan layout shift (website bergerak/melompat) saat typewriter berganti teks, **SANGAT PENTING** untuk membungkus `displayTextWithCursor` dengan class CSS yang memiliki `min-height` tetap.

**Contoh implementasi:**

```vue
<template>
  <div class="typewriter-container">
    {{ displayTextWithCursor }}
  </div>
</template>

<script setup>
import { useTypewriter } from "vue3-utils";

const { displayTextWithCursor } = useTypewriter([
  "Teks pertama yang pendek",
  "Teks kedua yang sangat panjang dan bisa sampai beberapa baris",
  "Teks ketiga",
]);
</script>

<style scoped>
.typewriter-container {
  min-height: 3.6rem; /* Sesuaikan dengan tinggi teks terpanjang */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Untuk responsive */
@media (max-width: 600px) {
  .typewriter-container {
    min-height: 5rem; /* Teks mungkin lebih tinggi di mobile */
  }
}
</style>
```

**Penjelasan:**

- `min-height`: Berikan tinggi minimum yang cukup untuk menampung teks terpanjang dalam array (biasanya 2-4 baris)
- `display: flex` dengan `align-items: center`: Membuat teks tetap center vertikal meskipun tinggi berubah
- `justify-content: center`: Center horizontal (opsional, sesuaikan kebutuhan)

Tanpa `min-height`, container akan berubah tinggi saat teks berganti-ganti, menyebabkan elemen di bawahnya bergerak naik-turun (layout shift).

### useSSE

Composable untuk Server-Sent Events (SSE) dengan auto-reconnection dan custom event handlers.

```javascript
import { useSSE } from "vue3-utils";

// Basic usage
const { data, isConnected, error, start, stop } = useSSE("/api/events", {
  autoStart: true,
  onMessage: (data) => {
    console.log("Received:", data);
  },
});

// Gunakan di template
// <div v-if="!isConnected">Connecting...</div>
// <div v-else-if="error">Error: {{ error }}</div>
// <div v-else>{{ data }}</div>

// Advanced usage dengan custom events dan auto-reconnect
const sse = useSSE("/api/stream", {
  autoReconnect: true,
  reconnectDelay: 2000,
  maxReconnectDelay: 30000,
  maxRetries: 5,
  onOpen: () => {
    console.log("SSE connection established!");
  },
  onMessage: (data, event) => {
    console.log("Default message:", data);
  },
  onError: (error, retryCount) => {
    console.error(`Connection error, retry attempt: ${retryCount}`, error);
  },
  eventHandlers: {
    notification: (data) => {
      // Handle custom 'notification' event
      showNotification(data);
    },
    update: (data) => {
      // Handle custom 'update' event
      updateUI(data);
    },
    heartbeat: (data) => {
      // Handle custom 'heartbeat' event
      console.log("Server heartbeat:", data);
    },
  },
});

// Manual control
sse.start(); // Mulai connection
sse.stop(); // Stop connection (manual close, tidak akan auto-reconnect)
sse.reset(); // Stop + clear data/error

// Monitor retry count
watch(sse.retryCount, (count) => {
  if (count > 3) {
    console.warn("Multiple reconnection attempts:", count);
  }
});

// Contoh backend (Node.js/Express)
// app.get('/api/events', (req, res) => {
//   res.setHeader('Content-Type', 'text/event-stream');
//   res.setHeader('Cache-Control', 'no-cache');
//   res.setHeader('Connection', 'keep-alive');
//
//   // Default message event
//   res.write(`data: ${JSON.stringify({ message: 'Hello' })}\n\n`);
//
//   // Custom event
//   res.write(`event: notification\n`);
//   res.write(`data: ${JSON.stringify({ title: 'New Message' })}\n\n`);
// });
```

#### Parameter

- `url` (string): URL endpoint untuk SSE connection
- `options` (object, opsional):
  - `autoStart` (boolean, default: false): Mulai otomatis saat composable dipanggil
  - `autoReconnect` (boolean, default: true): Auto reconnect saat connection terputus
  - `reconnectDelay` (number, default: 1000): Delay awal reconnect dalam milliseconds
  - `maxReconnectDelay` (number, default: 30000): Maximum delay untuk reconnect dalam milliseconds
  - `maxRetries` (number, default: Infinity): Maksimal jumlah retry attempts
  - `onMessage` (function): Callback saat menerima pesan `(data, event) => void`
  - `onError` (function): Callback saat terjadi error `(error, retryCount) => void`
  - `onOpen` (function): Callback saat connection berhasil terbuka `(event) => void`
  - `eventHandlers` (object): Custom event handlers `{ eventName: (data, event) => void }`

#### Return

- `data` (ref): Reactive data terbaru yang diterima dari SSE
- `error` (ref): Reactive error object jika ada error
- `isConnected` (ref): Reactive connection status
- `retryCount` (ref): Reactive retry attempt counter
- `start` (function): Memulai SSE connection
- `stop` (function): Menghentikan SSE connection secara manual
- `reset` (function): Reset state (stop + clear data/error)

#### Fitur

- **Auto-reconnection**: Reconnect otomatis dengan exponential backoff strategy (1s → 2s → 4s → 8s → max 30s)
- **Connection State Management**: Accurate connection state tracking dengan `onopen` event
- **Custom Event Handlers**: Support untuk SSE custom events selain default `message` event
- **Error Handling**: Try-catch di semua callback untuk prevent crash
- **Request Cancellation**: Proper cleanup dan cancellation saat stop atau unmount
- **Manual vs Network Error**: Bedakan manual close vs network error untuk auto-reconnect logic
- **Retry Tracking**: Monitor jumlah retry attempts dengan reactive `retryCount`
- **Smart Reconnection**: Reset delay setelah connection sukses
- **Memory Safe**: Auto cleanup saat component unmount
- **JSON Auto-parse**: Otomatis parse JSON data atau return raw string

#### Use Case

Ideal untuk:

- Real-time notifications
- Live dashboard updates
- Chat applications
- Live activity feeds
- Stock/crypto price updates
- Server logs streaming
- Progress monitoring

### useClipboard

Composable untuk copy text ke clipboard dengan automatic fallback untuk browser lama.

```javascript
import { useClipboard } from "vue3-utils";

// Basic usage
const { copy, copied } = useClipboard();

const handleCopy = async () => {
  const success = await copy("Hello World");
  if (success) {
    console.log("Text copied!");
  }
};

// Gunakan di template
// <button @click="copy('Text to copy')">
//   {{ copied ? 'Copied!' : 'Copy' }}
// </button>

// Copy dengan reactive feedback
const { copy, copied, copiedText } = useClipboard();

const copyUrl = async () => {
  await copy(window.location.href);
  // copied.value akan true selama 2 detik
  // copiedText.value = window.location.href
};

// Custom duration untuk feedback
const { copy, copied } = useClipboard({ copiedDuration: 3000 });

// Copy code snippet
const codeSnippet = `
function hello() {
  console.log('Hello World');
}
`;

const { copy, copied } = useClipboard();

// Di template
// <pre>{{ codeSnippet }}</pre>
// <button @click="copy(codeSnippet)">
//   <span v-if="copied">✓ Copied!</span>
//   <span v-else>Copy Code</span>
// </button>

// Check browser support
const { isSupported, copy } = useClipboard();

if (!isSupported.value) {
  console.warn("Clipboard API not supported, using fallback");
}

// Disable fallback (hanya gunakan modern API)
const { copy } = useClipboard({ legacy: false });
```

#### Parameter

- `options` (object, opsional):
  - `copiedDuration` (number, default: 2000): Durasi status 'copied' dalam milliseconds sebelum reset
  - `legacy` (boolean, default: true): Enable fallback ke execCommand untuk browser lama

#### Return

- `copied` (ref): Reactive state indicating apakah baru saja copy (auto-reset setelah duration)
- `copiedText` (ref): Reactive text yang terakhir berhasil di-copy
- `isSupported` (ref): Apakah browser support Clipboard API modern
- `copy` (function): Function untuk copy text ke clipboard, returns `Promise<boolean>`

#### Fitur

- **Modern Clipboard API**: Menggunakan `navigator.clipboard.writeText()` untuk modern browsers
- **Automatic Fallback**: Fallback ke `execCommand('copy')` jika Clipboard API tidak tersedia
- **Auto-reset State**: Status `copied` otomatis reset setelah duration (default 2 detik)
- **Promise-based**: Async/await support dengan return value true/false
- **Type Safe**: Full TypeScript support dengan type definitions
- **Browser Compatibility**: Work di semua modern browsers + fallback untuk IE11/old browsers
- **HTTPS/Localhost**: Clipboard API butuh HTTPS, tapi fallback work di HTTP
- **Error Handling**: Graceful error handling dengan console warning

#### Use Case

Ideal untuk:

- Copy button untuk share URLs
- Copy code snippets di documentation
- Copy API keys atau tokens
- Copy formatted text dari tables
- Copy hasil generate (invoice number, order ID, etc)
- Copy to clipboard dari modal/tooltip
- Social media share text

#### Browser Support

- **Modern Browsers** (Chrome 63+, Firefox 53+, Safari 13.1+): Clipboard API
- **Legacy Browsers** (IE11, older versions): execCommand fallback
- **Mobile**: iOS Safari 13.4+, Chrome Android, Firefox Android

### useRandomWords 🆕

Composable untuk menampilkan kata/kalimat secara random dari array dengan dukungan filtering berdasarkan kategori.

```javascript
import { useRandomWords } from "vue3-utils";

// Basic - array string
const { randomWord } = useRandomWords(["Hello", "Hi", "Hey"]);
// Di template: {{ randomWord }}

// Dengan object dan kategori
const words = [
  { text: "Selamat pagi", category: "morning" },
  { text: "Selamat siang", category: "afternoon" },
  { text: "Selamat malam", category: "evening" },
];

const { randomWord } = useRandomWords(words, { category: "morning" });
// randomWord.value akan random dari yang category 'morning' saja

// Dengan refresh manual
const { randomWord, refresh } = useRandomWords(["A", "B", "C"]);
// Panggil refresh() untuk ganti kata

// Akses data lengkap
const { randomWord, randomItem } = useRandomWords([
  { text: "Halo", category: "greeting", emoji: "👋" },
  { text: "Hi", category: "greeting", emoji: "🖐️" },
]);
// randomWord.value -> teks saja ("Halo")
// randomItem.value -> object lengkap { text: "Halo", category: "greeting", emoji: "👋" }
```

#### Parameter

- `words` (Array<string | WordItem>): Array kata/kalimat
- `options` (object, opsional):
  - `category` (string): Filter berdasarkan kategori tertentu

#### Return

- `randomWord` (ref): Kata/kalimat yang terpilih secara random (string)
- `randomItem` (ref): Data lengkap item yang terpilih (object/string)
- `refresh` (function): Fungsi untuk pilih kata random yang baru
- `filteredWords` (ref): Array kata setelah filtering

#### Fitur

- **Simple API**: Langsung return kata random yang bisa dipakai di template
- **Category Filter**: Filter kata berdasarkan kategori
- **Flexible Input**: Support array string atau object dengan property text
- **Manual Refresh**: Ganti kata random kapan saja dengan `refresh()`
- **Full Data Access**: Akses data lengkap object via `randomItem`

### useTheme 🆕

Composable untuk dark/light theme management dengan localStorage persistence dan auto-detect system preference.

> **⚠️ IMPORTANT:** Composable ini **hanya mendukung Tailwind CSS v4**. Untuk Tailwind v3 atau CSS framework lain, Anda perlu menyesuaikan implementasinya.

```javascript
import { useTheme } from "vue3-utils";
import { onMounted } from "vue";

// Basic usage
const { isDark, initTheme, toggleTheme, watchSystemTheme } = useTheme();

onMounted(() => {
  initTheme(); // Deteksi preferensi sistem atau load dari localStorage
  watchSystemTheme(); // Watch perubahan system theme
});

// Toggle theme
// <button @click="toggleTheme">
//   {{ isDark ? '☀️ Light Mode' : '🌙 Dark Mode' }}
// </button>

// Set theme manual
const { setTheme } = useTheme();
setTheme("dark"); // atau 'light'

// Custom options
const theme = useTheme({
  storageKey: "my-app-theme", // default: 'theme'
  attribute: "class", // default: 'class', bisa juga 'data-theme'
  darkValue: "dark", // default: 'dark'
  lightValue: "light", // default: 'light'
});
```

#### Setup untuk Tailwind CSS v4

**1. Tambahkan custom variant di `style.css`:**

```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

**2. Setup root dan dark class:**

```css
:root {
  color: #213547;
  background-color: #f5f5f5;
}

.dark {
  color-scheme: dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;
}
```

**3. Gunakan di component:**

```vue
<template>
  <div>
    <!-- Toggle button -->
    <button @click="toggleTheme" class="p-2 rounded-lg bg-gray-200 dark:bg-slate-800">
      <span v-if="isDark">☀️ Light Mode</span>
      <span v-else>🌙 Dark Mode</span>
    </button>

    <!-- Example dengan dark mode classes -->
    <div class="bg-white dark:bg-slate-900 text-black dark:text-white">
      <h1 class="text-gray-900 dark:text-gray-100">Hello World</h1>
      <p class="text-gray-600 dark:text-gray-400">This is dark mode example</p>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from "vue3-utils";
import { onMounted } from "vue";

const { isDark, initTheme, toggleTheme, watchSystemTheme } = useTheme();

onMounted(() => {
  initTheme();
  watchSystemTheme();
});
</script>
```

#### Parameter

- `options` (object, opsional):
  - `storageKey` (string, default: 'theme'): Key untuk menyimpan preferensi theme di localStorage
  - `attribute` (string, default: 'class'): HTML attribute untuk apply theme ('class' atau 'data-theme')
  - `darkValue` (string, default: 'dark'): Value untuk dark mode
  - `lightValue` (string, default: 'light'): Value untuk light mode

#### Return

- `isDark` (ref): Reactive state indicating apakah dark mode aktif
- `initTheme` (function): Initialize theme dari localStorage atau system preference
- `toggleTheme` (function): Toggle antara light dan dark mode
- `setTheme` (function): Set theme secara manual ('light' atau 'dark')
- `watchSystemTheme` (function): Watch perubahan system theme preference

#### Fitur

- **Auto-detect System**: Otomatis deteksi preferensi dark/light mode dari sistem operasi
- **localStorage Persistence**: Menyimpan preferensi user di localStorage
- **System Theme Watcher**: Auto-update saat user ganti theme OS (jika belum ada preferensi manual)
- **Tailwind CSS v4 Support**: Terintegrasi dengan `@custom-variant dark`
- **Manual Override**: User preference override system preference
- **Class Strategy**: Menggunakan `.dark` class di `<html>` element

#### Cara Kerja

1. **Pertama kali load app:**
   - Cek `localStorage` untuk preferensi user
   - Jika tidak ada, deteksi dari system preference (`prefers-color-scheme`)
   - Apply class `.dark` ke `<html>` jika dark mode

2. **User click toggle:**
   - Switch theme
   - Simpan preferensi ke `localStorage`
   - Apply/remove class `.dark` dari `<html>`

3. **User ganti theme OS:**
   - Jika user belum set preferensi manual → auto follow system
   - Jika user sudah set manual → tetap pakai preferensi user

#### Use Case

Ideal untuk:

- SPA (Single Page Application) dengan dark/light mode
- Dashboard atau admin panel
- Blog atau documentation site
- E-commerce platform
- Portfolio website

#### Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (semua versi modern)
- **localStorage**: Required (IE11+)
- **prefers-color-scheme**: Chrome 76+, Firefox 67+, Safari 12.1+

### useDevice 🆕

Composable untuk mendeteksi tipe device (mobile/tablet/desktop) berdasarkan window size dengan reactive state.

```javascript
import { useDevice } from "vue3-utils";

// Basic usage
const { isMobile, isTablet, isDesktop } = useDevice();

// Conditional rendering di template
// <div v-if="isMobile">Mobile Menu</div>
// <div v-else-if="isTablet">Tablet Menu</div>
// <div v-else>Desktop Menu</div>

// Conditional logic di script
const loadContent = () => {
  if (isMobile.value) {
    // Load mobile optimized content
    loadMobileImages();
  } else if (isTablet.value) {
    // Load tablet optimized content
    loadTabletImages();
  } else {
    // Load desktop content
    loadDesktopImages();
  }
};

// Custom breakpoints
const { isMobile, isTablet, isDesktop, width, height } = useDevice({
  mobileBreakpoint: 640,  // sm breakpoint
  tabletBreakpoint: 1280, // xl breakpoint
});

// Monitor window dimensions
watch(width, (newWidth) => {
  console.log(`Window width: ${newWidth}px`);
});

// Responsive layout component
const { isMobile, isDesktop } = useDevice();

const columns = computed(() => {
  return isMobile.value ? 1 : isDesktop.value ? 3 : 2;
});

// <div :class="`grid grid-cols-${columns}`">...</div>

// Conditional API calls
const fetchData = async () => {
  const { isMobile } = useDevice();
  const limit = isMobile.value ? 5 : 20; // Mobile: load less items

  const data = await fetch(`/api/items?limit=${limit}`);
  return data;
};
```

#### Parameter

- `options` (object, opsional):
  - `mobileBreakpoint` (number, default: 768): Breakpoint untuk mobile dalam pixels
  - `tabletBreakpoint` (number, default: 1024): Breakpoint untuk tablet dalam pixels

#### Return

- `isMobile` (ref): Reactive state indicating apakah device mobile (width < mobileBreakpoint)
- `isTablet` (ref): Reactive state indicating apakah device tablet (mobileBreakpoint ≤ width < tabletBreakpoint)
- `isDesktop` (ref): Reactive state indicating apakah device desktop (width ≥ tabletBreakpoint)
- `width` (ref): Reactive window width dalam pixels
- `height` (ref): Reactive window height dalam pixels

#### Breakpoint Logic

Default breakpoints:
- **Mobile**: width < 768px (isMobile: true)
- **Tablet**: 768px ≤ width < 1024px (isTablet: true)
- **Desktop**: width ≥ 1024px (isDesktop: true)

Hanya satu state yang akan `true` pada satu waktu.

#### Fitur

- **Reactive**: Otomatis update saat window di-resize
- **Throttled**: Resize event di-throttle 100ms untuk performa optimal
- **Custom Breakpoints**: Bisa custom breakpoint sesuai kebutuhan
- **Window Dimensions**: Access ke reactive width dan height
- **SSR Safe**: Aman digunakan di environment SSR (Server-Side Rendering)
- **Auto Cleanup**: Otomatis remove event listener saat component unmount
- **Performance**: Hanya satu resize listener meskipun dipanggil berkali-kali

#### Use Case

Ideal untuk:

- Responsive navigation menu (mobile hamburger vs desktop navbar)
- Conditional image loading (mobile: thumbnail, desktop: full size)
- Adaptive grid columns (1 col mobile, 2 col tablet, 3+ col desktop)
- Device-specific API pagination (mobile: 5 items, desktop: 20 items)
- Touch vs mouse interactions
- Responsive modal/dialog positioning
- Chart/visualization responsive sizing

#### Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (semua versi modern)
- **window.innerWidth/innerHeight**: IE9+
- **addEventListener**: IE9+

## 🔧 Wrapper

### useEventBus

Wrapper untuk mengakses event bus global yang memudahkan komunikasi antar komponen.

```javascript
import { useEventBus } from "vue3-utils";

// Kirim event
const bus = useEventBus();
bus.emit("user:login", { id: 123, name: "John" });

// Daftarkan listener
bus.on("user:login", (userData) => {
  console.log("User login:", userData);
});

// Listener sekali jalan
bus.once("notification", (message) => {
  console.log("Notifikasi pertama:", message);
});

// Hapus listener spesifik
const handler = (data) => {};
bus.on("event", handler);
bus.off("event", handler);
```

#### Metode

- `on(event, fn)`: Mendaftarkan listener untuk event tertentu
- `emit(event, ...args)`: Mengirim event dengan argumen opsional
- `off(event, fn)`: Menghapus listener spesifik
- `once(event, fn)`: Mendaftarkan listener yang hanya berjalan sekali

#### Fitur

- **Global event bus**: Akses instance event bus global
- **Multiple listeners**: Satu event bisa memiliki beberapa listener
- **Listener control**: Daftarkan, kirim, dan hapus listener dengan mudah
- **Listener sekali jalan**: Dukungan untuk listener yang hanya dijalankan sekali

### useFetch

Wrapper untuk HTTP fetch dengan fungsionalitas caching otomatis dan request cancellation.

```javascript
import { useFetch } from "vue3-utils";

// Basic - Fetch tanpa cache (auto fetch)
const { data, error, loading } = useFetch("https://api.example.com/users");

// Gunakan di template
// <div v-if="loading">Loading...</div>
// <div v-else-if="error">Error: {{ error.message }}</div>
// <div v-else>{{ data }}</div>

// Fetch dengan cache 5 menit
const {
  data: posts,
  error: postsError,
  loading: postsLoading,
  refetch,
  clearCache,
} = useFetch(
  "https://api.example.com/posts",
  {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  },
  { cacheTime: 5 * 60 * 1000 } // 5 menit
);

// Refetch manual (bypass cache)
await refetch();

// Clear cache untuk URL ini
clearCache();

// Fetch manual (tidak otomatis saat mount)
const {
  data: searchResult,
  loading: searching,
  refetch: search,
} = useFetch(
  "https://api.example.com/search",
  {
    method: "POST",
    body: { query: "vue3" },
  },
  { immediate: false } // tidak auto fetch
);

// Trigger fetch secara manual
await search();

// POST request tanpa cache
const {
  data: result,
  error: postError,
  loading: posting,
} = useFetch("https://api.example.com/posts", {
  method: "POST",
  body: { title: "Hello", content: "World" },
});
```

#### Parameter

- `url` (string): URL endpoint yang akan di-fetch
- `options` (object, opsional): Opsi ofetch (method, headers, body, dll)
- `config` (object, opsional):
  - `cacheTime` (number, default: 0): Waktu cache dalam milidetik (0 = tidak menggunakan cache)
  - `immediate` (boolean, default: true): Jalankan fetch otomatis saat composable dipanggil

#### Return

- `data` (ref): Data hasil fetch (null jika belum ada data atau error)
- `error` (ref): Error object jika terjadi error (null jika tidak ada error)
- `loading` (ref): Status loading (true saat sedang fetch)
- `refetch` (function): Method untuk melakukan fetch ulang dengan bypass cache
- `clearCache` (function): Method untuk menghapus cache entry untuk URL ini

#### Fitur

- **Auto-fetch**: Fetch otomatis saat composable dipanggil (configurable dengan `immediate`)
- **Reactive**: Semua state (data, error, loading) adalah reactive
- **Smart Caching**: Cache otomatis dengan TTL yang dapat dikonfigurasi
- **Cache Size Limit**: Maximum 100 entries dengan LRU (Least Recently Used)
- **Request Cancellation**: Otomatis cancel request sebelumnya dengan AbortController
- **Memory Safe**: Auto cleanup saat component unmount (no memory leaks)
- **Manual Control**: Refetch dan clear cache secara manual
- **Cache Key**: Cache berdasarkan URL + method (GET:url vs POST:url)

### useAuthGuard

Wrapper untuk memeriksa status expirasi token dengan callback yang dapat dikonfigurasi.

```javascript
import { useAuthGuard } from "vue3-utils";

const isTokenExpired = useAuthGuard();

// Cek apakah token sudah expired
const tokenExpTime = 1735689600; // Unix timestamp
const isExpired = isTokenExpired(tokenExpTime, () => {
  // Callback dipanggil jika token expired
  console.log("Token expired!");
  router.push("/login");
});

if (isExpired) {
  console.log("Token sudah kedaluwarsa");
}

// Contoh di navigation guard
router.beforeEach((to, from, next) => {
  const isTokenExpired = useAuthGuard();
  const tokenExpiration = localStorage.getItem("refreshTokenExpiration");

  if (to.meta.requiresAuth) {
    const expired = isTokenExpired(Number(tokenExpiration), () => {
      // Token expired, redirect ke login
      next("/login");
    });

    if (!expired) {
      next(); // Token valid, lanjut
    }
  } else {
    next();
  }
});

// Contoh dengan auto refresh
const checkAuth = () => {
  const isTokenExpired = useAuthGuard();
  const expTime = Number(localStorage.getItem("refreshTokenExpiration"));

  const expired = isTokenExpired(expTime, async () => {
    try {
      // Coba refresh token
      await refreshToken();
    } catch (error) {
      // Refresh gagal, logout
      logout();
    }
  });

  return !expired;
};
```

#### Parameter

- `refreshTokenExpiration` (number): Unix timestamp kapan token akan expired
- `onExpiredCallback` (function): Callback yang dipanggil saat token sudah expired

#### Return

- `isTokenExpired` (function): Fungsi untuk cek apakah token expired
  - Returns `true` jika token expired
  - Returns `false` jika token masih valid

#### Fitur

- **Simple check**: Fungsi sederhana untuk cek expiration token
- **Callback support**: Jalankan callback otomatis saat token expired
- **Unix timestamp**: Menggunakan format Unix timestamp (seconds)
- **Flexible**: Bisa digunakan di route guard, middleware, atau component

#### Use Case

Ideal untuk:

- Navigation guard untuk protected routes
- Auto refresh token check
- Periodic token validation
- Logout handler saat token expired

### useFetchServer

Wrapper untuk HTTP fetch dengan automatic token management dan refresh. Ideal untuk aplikasi dengan autentikasi JWT.

```javascript
import { useFetchServer } from "vue3-utils";

// Basic usage dengan default config (localStorage)
const { fetchWithAuth } = useFetchServer("https://api.example.com");

// GET request
const users = await fetchWithAuth("/users");

// POST request
const newUser = await fetchWithAuth("/users", {
  method: "POST",
  body: { name: "John Doe", email: "john@example.com" },
});

// Advanced - Custom token handlers
const { fetchWithAuth, isRefreshing, clearTokens } = useFetchServer(
  "https://api.example.com",
  {
    refreshTokenUrl: "/auth/refresh-token",
    getToken: () => sessionStorage.getItem("accessToken"),
    saveToken: (token) => sessionStorage.setItem("accessToken", token),
    skipRefreshUrls: ["/auth/login", "/auth/register"],
    onRefreshFailCallback: () => {
      // Dipanggil saat refresh token gagal
      clearTokens();
      router.push("/login");
    },
  }
);

// Login request - tidak akan trigger auto refresh jika 401
const loginResult = await fetchWithAuth("/auth/login", {
  method: "POST",
  body: { username: "user", password: "pass" },
}).catch((error) => {
  // Handle login error (wrong password, etc)
  console.error("Login failed:", error);
});

// Gunakan dalam composable/component
const fetchUsers = async () => {
  try {
    const data = await fetchWithAuth("/users");
    console.log(data);
  } catch (error) {
    console.error("Fetch error:", error);
  }
};

// Track refresh status
watch(isRefreshing, (value) => {
  if (value) {
    console.log("Token sedang di-refresh...");
  }
});

// Logout helper
const logout = () => {
  clearTokens();
  router.push("/login");
};
```

#### Parameter

- `baseUrl` (string, opsional): Base URL yang akan digunakan untuk semua request
- `options` (object, opsional):
  - `refreshTokenUrl` (string, default: "/api/refresh-token"): URL endpoint untuk refresh token
  - `getToken` (function): Custom function untuk mendapatkan access token (default: dari localStorage)
  - `saveToken` (function): Custom function untuk menyimpan access token (default: ke localStorage)
  - `skipRefreshUrls` (string[], default: ['/auth/login', '/auth/register', '/auth/forgot-password']): Array URL yang di-skip dari auto token refresh
  - `onRefreshFailCallback` (function): Callback yang dipanggil saat refresh token gagal

#### Return

- `fetchWithAuth` (function): Fungsi fetch dengan automatic token handling dan retry
- `isRefreshing` (ref): Reactive state untuk track status refresh token (true saat sedang refresh)
- `clearTokens` (function): Helper untuk menghapus semua tokens dari storage

#### Fitur

- **Automatic Token Injection**: Otomatis menambahkan `Authorization: Bearer <token>` header (hanya jika token ada)
- **Auto Token Refresh**: Otomatis refresh token saat dapat 401 response
- **Smart Retry**: Retry request dengan token baru setelah refresh sukses
- **Refresh Queue**: Prevent multiple refresh jika ada banyak request 401 bersamaan
- **Skip Refresh URLs**: Public endpoints (login, register) tidak akan trigger auto refresh
- **Smart 401 Handling**: Cek ketersediaan refresh token sebelum mencoba refresh
- **No Infinite Loop**: Menggunakan instance fetch terpisah untuk refresh token
- **Reactive Status**: Track refresh status dengan `isRefreshing` ref
- **Storage Flexible**: Bisa custom getToken/saveToken (localStorage, sessionStorage, cookie, dll)
- **Memory Safe**: Auto cleanup saat component unmount

#### Default Token Storage

Secara default, `useFetchServer` menggunakan localStorage untuk menyimpan tokens:

- `accessToken`: Token akses untuk autentikasi
- `refreshToken`: Token untuk refresh access token
- `refreshTokenExpiration`: Unix timestamp expiration refresh token

#### Use Case

Ideal untuk:

- Aplikasi dengan autentikasi JWT
- API yang memerlukan token refresh otomatis
- SPA (Single Page Application) dengan protected routes
- Admin dashboard atau aplikasi internal

### useDateTime

Wrapper untuk manipulasi dan formatting tanggal/waktu dengan dukungan Bahasa Indonesia.

```javascript
import { useDateTime } from "vue3-utils";

// Format tanggal basic
const date = useDateTime("2024-01-15 10:30:00");
console.log(date.format()); // "15 Januari 2024 10:30:00"
console.log(date.format("DD/MM/YYYY")); // "15/01/2024"
console.log(date.format("DD MMMM YYYY")); // "15 Januari 2024"

// Support format database "YYYY-MM-DD HH:mm:ss"
const dbDate = useDateTime("2024-12-31 23:59:59");
console.log(dbDate.format("DD MMMM YYYY HH:mm")); // "31 Desember 2024 23:59"

// Chaining operations
const tomorrow = useDateTime().add(1, "days").format("DD MMMM YYYY"); // "besok"

const nextWeek = useDateTime()
  .add(7, "days")
  .subtract(2, "hours")
  .format("DD/MM/YYYY HH:mm");

// Operasi aritmatika
const future = useDateTime("2024-01-01")
  .add(3, "months")
  .add(15, "days")
  .add(2, "hours");

console.log(future.format("DD MMMM YYYY HH:mm")); // "16 April 2024 02:00"

// Validasi tanggal
const invalid = useDateTime("invalid-date");
console.log(invalid.isValid()); // false
console.log(invalid.format()); // "Invalid Date"

// Convert ke native Date atau timestamp
const date = useDateTime("2024-01-15");
const nativeDate = date.toDate(); // Date object
const timestamp = date.valueOf(); // 1705276800000
```

#### Parameter

- `input` (Date | string, opsional, default: `new Date()`): Input date yang mendukung format database "YYYY-MM-DD HH:mm:ss"

#### Return (DateTimeAPI)

- `format(fmt?: string)`: Format tanggal sesuai pattern (default: "DD MMMM YYYY HH:mm:ss")
- `add(value: number, unit: TimeUnit)`: Menambah waktu, return instance baru untuk chaining
- `subtract(value: number, unit: TimeUnit)`: Mengurangi waktu, return instance baru untuk chaining
- `toDate()`: Mengambil native Date object
- `valueOf()`: Mengambil timestamp dalam milliseconds
- `isValid()`: Validasi apakah date valid

#### Time Units

- `'seconds'` - Detik
- `'minutes'` - Menit
- `'hours'` - Jam
- `'days'` - Hari
- `'months'` - Bulan
- `'years'` - Tahun

#### Format Tokens

- `DD` - Tanggal dengan leading zero (01-31)
- `D` - Tanggal tanpa leading zero (1-31)
- `MM` - Bulan dengan leading zero (01-12)
- `MMMM` - Nama bulan dalam Bahasa Indonesia
- `YY` - Tahun 2 digit (24)
- `YYYY` - Tahun 4 digit (2024)
- `HH` - Jam dengan leading zero (00-23)
- `mm` - Menit dengan leading zero (00-59)
- `ss` - Detik dengan leading zero (00-59)

#### Fitur

- **Bahasa Indonesia**: Nama bulan dalam Bahasa Indonesia (Januari, Februari, dst)
- **Database Format Support**: Support parsing format "YYYY-MM-DD HH:mm:ss" dari database
- **Chainable API**: Method chaining untuk operasi berurutan
- **Immutable**: Setiap operasi return instance baru (tidak modify original)
- **Validation**: Built-in validation untuk date yang valid/invalid
- **Flexible Format**: Custom format dengan token yang mudah

### useCurrency

Wrapper untuk formatting angka ke format currency Rupiah Indonesia (IDR).

```javascript
import { useCurrency } from "vue3-utils";

// Basic usage
const price = useCurrency(150000);
console.log(price.format()); // "Rp 150.000"

// Format dengan nilai dinamis
const currency = useCurrency(0);
console.log(currency.format(250000)); // "Rp 250.000"
console.log(currency.format(1500000)); // "Rp 1.500.000"
console.log(currency.format(50000000)); // "Rp 50.000.000"

// Gunakan dalam component
const product = {
  name: "Laptop",
  price: 15000000,
};

const { format } = useCurrency(product.price);
console.log(`${product.name}: ${format()}`); // "Laptop: Rp 15.000.000"

// Format dengan nilai berbeda
const formatter = useCurrency(0);
const prices = [10000, 50000, 100000];
prices.forEach((price) => {
  console.log(formatter.format(price));
});
// Output:
// Rp 10.000
// Rp 50.000
// Rp 100.000

// Validasi
const invalid = useCurrency(0);
console.log(invalid.format(NaN)); // "Invalid Number"
console.log(invalid.format("abc")); // "Invalid Number"
```

#### Parameter

- `value` (number): Nilai angka yang akan diformat

#### Return (CurrencyAPI)

- `format(val?: number)`: Format angka ke format currency IDR. Jika `val` tidak diberikan, akan menggunakan `value` awal

#### Fitur

- **Format IDR**: Menggunakan format Rupiah Indonesia dengan pemisah ribuan (.)
- **No Decimals**: Default tanpa desimal (`minimumFractionDigits: 0`)
- **Intl.NumberFormat**: Menggunakan native Intl API untuk formatting yang konsisten
- **Validation**: Built-in validation untuk input yang invalid
- **Flexible**: Bisa format dengan nilai awal atau nilai dinamis

#### Format Output

Contoh format output:

- `100` → "Rp 100"
- `1000` → "Rp 1.000"
- `50000` → "Rp 50.000"
- `1000000` → "Rp 1.000.000"
- `15000000` → "Rp 15.000.000"

## 📄 License

[MIT](LICENSE) © 2025
