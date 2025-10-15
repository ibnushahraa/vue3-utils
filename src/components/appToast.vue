<template>
  <teleport to="body">
    <div
      v-for="pos in positions"
      :key="pos"
      class="toast-container"
      :class="pos"
    >
      <transition-group name="fade" tag="div">
        <div
          v-for="t in toast.toasts.filter(i => i.position === pos)"
          :key="t.id"
          class="toast"
          :class="t.type"
        >
          <div class="toast-message">{{ t.message }}</div>
          <div
            class="toast-progress"
            :style="{ animationDuration: t.duration + 'ms' }"
          ></div>
        </div>
      </transition-group>
    </div>
  </teleport>
</template>

<script setup>
import toastPlugin from '../core/Toast'
const toast = toastPlugin.toast

const positions = [
  'top-left', 'top-right', 'bottom-left',
  'bottom-right', 'top-center', 'bottom-center'
]
</script>

<style scoped>
.toast-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}

.toast {
  pointer-events: auto;
  width: 240px;
  padding: 8px 12px 10px;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  animation: fadeIn 0.3s ease;
  position: relative;
}

.toast-message {
  margin-bottom: 4px;
}

.toast-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background: rgba(255, 255, 255, 0.6);
  animation: countdown linear forwards;
}

@keyframes countdown {
  from { width: 100%; }
  to { width: 0%; }
}

/* warna */
.toast.success { background-color: #22c55e; }
.toast.error   { background-color: #ef4444; }
.toast.info    { background-color: #3b82f6; }
.toast.warning { background-color: #f59e0b; }

/* posisi */
.top-left { top: 1rem; left: 1rem; align-items: flex-start; }
.top-right { top: 1rem; right: 1rem; align-items: flex-end; }
.bottom-left { bottom: 1rem; left: 1rem; align-items: flex-start; }
.bottom-right { bottom: 1rem; right: 1rem; align-items: flex-end; }
.top-center { top: 1rem; left: 50%; transform: translateX(-50%); align-items: center; }
.bottom-center { bottom: 1rem; left: 50%; transform: translateX(-50%); align-items: center; }

.fade-enter-active,
.fade-leave-active { transition: all 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; transform: translateY(-10px); }

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
