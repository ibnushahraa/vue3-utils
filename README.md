# vue3-utils

Vue 3 utility composables

## Installation

```bash
npm install github:ibnushahraa/vue3-utils
```

## Usage

### useCountdown

A composable for countdown timer functionality.

```javascript
import { useCountdown } from "vue3-utils";

const expiredAt = Math.floor(Date.now() / 1000) + 3600; // 1 jam dari sekarang

const { hours, minutes, seconds, remaining, onSuccess, onExpired, triggerSuccess } =
  useCountdown(expiredAt, {
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

#### Parameters

- `expiredUnix` (number): Unix timestamp kapan countdown berakhir
- `options` (object, optional):
  - `onExpired` (function): Callback yang dipanggil saat countdown mencapai 0

#### Returns

- `hours` (computed): Jam tersisa (format: "00")
- `minutes` (computed): Menit tersisa (format: "00")
- `seconds` (computed): Detik tersisa (format: "00")
- `remaining` (ref): Total detik tersisa
- `onExpired` (function): Set handler untuk event expired
- `onSuccess` (function): Set handler untuk event success
- `triggerSuccess` (function): Trigger success secara manual dan hentikan timer

## License

MIT
