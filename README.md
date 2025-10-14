# vue3-utils

Kumpulan composable dan wrapper utility untuk Vue 3

## 📋 Daftar Isi

- [📦 Instalasi](#-instalasi)
- [🚀 Composables](#-composables)
  - [useCountdown](#usecountdown)
  - [useTimeAgo](#usetimeago)
  - [useCountUp](#usecountup)
  - [useTypewriter](#usetypewriter)
  - [useFetch](#usefetch)
- [🔧 Wrapper](#-wrapper)
  - [useEventBus](#useeventbus)
- [📄 License](#-license)

## 📦 Instalasi

```bash
npm install github:ibnushahraa/vue3-utils
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

### useFetch

Composable untuk HTTP fetch dengan fungsionalitas caching otomatis.

```javascript
import { useFetch } from "vue3-utils";

// Fetch tanpa cache
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
} = useFetch(
  "https://api.example.com/posts",
  {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  },
  { cacheTime: 5 * 60 * 1000 } // 5 menit
);

// Refetch manual (akan menggunakan cache jika masih berlaku)
refetch();

// POST request tanpa cache
const {
  data: result,
  error: postError,
  loading: posting,
} = useFetch("https://api.example.com/posts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title: "Hello", content: "World" }),
});
```

#### Parameter

- `url` (string): URL endpoint yang akan di-fetch
- `options` (object, opsional): Opsi fetch API standard (method, headers, body, dll)
- `config` (object, opsional):
  - `cacheTime` (number, default: 0): Waktu cache dalam milidetik (0 = tidak menggunakan cache)

#### Return

- `data` (ref): Data hasil fetch (null jika belum ada data atau error)
- `error` (ref): Error object jika terjadi error (null jika tidak ada error)
- `loading` (ref): Status loading (true saat sedang fetch)
- `refetch` (function): Method untuk melakukan fetch ulang secara manual

#### Fitur

- **Auto-fetch**: Fetch otomatis saat composable dipanggil
- **Reactive**: Semua state (data, error, loading) adalah reactive
- **Caching**: Cache otomatis dengan waktu expired yang dapat dikonfigurasi
- **Auto-cleanup**: Cache otomatis dihapus setelah waktu expired
- **Manual refetch**: Dapat melakukan fetch ulang secara manual

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

## 📄 License

[MIT](LICENSE) © 2025
