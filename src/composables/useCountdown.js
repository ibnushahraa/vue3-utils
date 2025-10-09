// src/composables/useCountdown.js
import { ref, computed, onUnmounted } from "vue";

export function useCountdown(expiredUnix, { onExpired } = {}) {
    const remaining = ref(0);
    let timer = null;

    // listener yang bisa diubah dari luar
    let _onExpired = onExpired || null;
    let _onSuccess = null;

    const update = () => {
        const now = Math.floor(Date.now() / 1000);
        remaining.value = Math.max(0, expiredUnix - now);
        if (remaining.value <= 0) handleExpired();
    };

    const handleExpired = () => {
        clearInterval(timer);
        timer = null;
        if (typeof _onExpired === "function") _onExpired();
    };

    // dipanggil manual dari luar (misal saat pembayaran sukses)
    const handleSuccess = () => {
        clearInterval(timer);
        timer = null;
        if (typeof _onSuccess === "function") _onSuccess();
    };

    const onExpiredHandler = (fn) => (_onExpired = fn);
    const onSuccessHandler = (fn) => (_onSuccess = fn);

    const start = () => {
        clearInterval(timer);
        update();
        timer = setInterval(update, 1000);
    };

    start();

    onUnmounted(() => clearInterval(timer));

    const hours = computed(() =>
        String(Math.floor(remaining.value / 3600)).padStart(2, "0")
    );
    const minutes = computed(() =>
        String(Math.floor((remaining.value % 3600) / 60)).padStart(2, "0")
    );
    const seconds = computed(() =>
        String(remaining.value % 60).padStart(2, "0")
    );

    return {
        hours,
        minutes,
        seconds,
        remaining,
        onExpired: onExpiredHandler,
        onSuccess: onSuccessHandler,
        triggerSuccess: handleSuccess, // ✅ ini dipakai manual
    };
}
// src/composables/useCountdown.js
import { ref, computed, onUnmounted } from "vue";

export function useCountdown(expiredUnix, { onExpired } = {}) {
    const remaining = ref(0);
    let timer = null;

    // listener yang bisa diubah dari luar
    let _onExpired = onExpired || null;
    let _onSuccess = null;

    const update = () => {
        const now = Math.floor(Date.now() / 1000);
        remaining.value = Math.max(0, expiredUnix - now);
        if (remaining.value <= 0) handleExpired();
    };

    const handleExpired = () => {
        clearInterval(timer);
        timer = null;
        if (typeof _onExpired === "function") _onExpired();
    };

    // dipanggil manual dari luar (misal saat pembayaran sukses)
    const handleSuccess = () => {
        clearInterval(timer);
        timer = null;
        if (typeof _onSuccess === "function") _onSuccess();
    };

    const onExpiredHandler = (fn) => (_onExpired = fn);
    const onSuccessHandler = (fn) => (_onSuccess = fn);

    const start = () => {
        clearInterval(timer);
        update();
        timer = setInterval(update, 1000);
    };

    start();

    onUnmounted(() => clearInterval(timer));

    const hours = computed(() =>
        String(Math.floor(remaining.value / 3600)).padStart(2, "0")
    );
    const minutes = computed(() =>
        String(Math.floor((remaining.value % 3600) / 60)).padStart(2, "0")
    );
    const seconds = computed(() =>
        String(remaining.value % 60).padStart(2, "0")
    );

    return {
        hours,
        minutes,
        seconds,
        remaining,
        onExpired: onExpiredHandler,
        onSuccess: onSuccessHandler,
        triggerSuccess: handleSuccess, // ✅ ini dipakai manual
    };
}
