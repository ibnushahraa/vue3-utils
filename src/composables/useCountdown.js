// src/composables/useCountdown.js
import { ref, computed, onMounted, onUnmounted } from "vue";

export function useCountdown(expiredUnix, { onExpired } = {}) {
    const remaining = ref(0);
    let timer = null;

    const internalExpired = () => {
        clearInterval(timer);
        timer = null;
        if (typeof onExpired === "function") onExpired();
    };

    const update = () => {
        const now = Math.floor(Date.now() / 1000);
        remaining.value = Math.max(0, expiredUnix - now);

        if (remaining.value <= 0) internalExpired();
    };

    const startTimer = () => {
        update();
        if (timer) clearInterval(timer);
        timer = setInterval(update, 1000);
    };

    const onSuccess = () => {
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
    };

    // expose manual trigger
    const triggerExpired = () => internalExpired();

    const hours = computed(() =>
        String(Math.floor(remaining.value / 3600)).padStart(2, "0")
    );
    const minutes = computed(() =>
        String(Math.floor((remaining.value % 3600) / 60)).padStart(2, "0")
    );
    const seconds = computed(() =>
        String(remaining.value % 60).padStart(2, "0")
    );

    onMounted(startTimer);
    onUnmounted(() => clearInterval(timer));

    return { hours, minutes, seconds, remaining, onSuccess, onExpired: triggerExpired };
}
