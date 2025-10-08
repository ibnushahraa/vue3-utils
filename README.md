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

const { hours, minutes, seconds, remaining, onSuccess, onExpired } =
  useCountdown(expiredAt, {
    onExpired: () => {
      console.log("Waktu habis!");
    },
  });

// Hentikan timer manual
onSuccess();

// Trigger expired manual
onExpired();
```

## License

MIT
