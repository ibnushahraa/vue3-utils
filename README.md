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

// In your component
const expiredTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
const { hours, minutes, seconds, remaining } = useCountdown(expiredTime);
```

## License

MIT
