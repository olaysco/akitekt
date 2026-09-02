<template>
  <div class="empty-architecture-canvas">
    <div class="empty-state-content">
      <h1>Describe your system.</h1>

      <p>
        Write it the way you would explain it to another engineer, the system will build the graph and you can run it.
      </p>

      <div class="empty-state-prompt">
        A core service that provisions domains through an external DNS API…
      </div>
    </div>
  </div>
</template>

<style scoped>
.empty-architecture-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;

  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: none;
}

.architecture-canvas
  :deep(.vue-flow__controls) {
  border: 1px solid oklch(0.875 0.008 258);
  border-radius: 8px;
  overflow: hidden;

  background: oklch(1 0 0);
  box-shadow: none;
}

.architecture-canvas
  :deep(.vue-flow__controls-button) {
  width: 30px;
  height: 30px;

  border: 0;
  border-bottom:
    1px solid oklch(0.875 0.008 258);

  background: oklch(1 0 0);
  color: oklch(0.35 0.015 258);
}

.architecture-canvas
  :deep(.vue-flow__controls-button:last-child) {
  border-bottom: 0;
}

.architecture-canvas
  :deep(.vue-flow__controls-button:hover) {
  background: oklch(0.97 0.004 258);
}

.empty-state-content {
  width: min(520px, calc(100% - 96px));

  text-align: center;

  font-family: 'IBM Plex Sans', sans-serif;
  color: oklch(0.25 0.015 258);
}

.empty-state-content h1 {
  margin: 0;

  font-size: 26px;
  line-height: 1.2;
  font-weight: 500;
  letter-spacing: -0.02em;
}

.empty-state-content p {
  max-width: 480px;
  margin: 12px auto 0;

  font-size: 13px;
  line-height: 1.6;

  color: oklch(0.48 0.015 258);
}

.empty-state-prompt {
  margin-top: 24px;
  padding: 13px 16px;

  text-align: left;

  background: oklch(1 0 0);
  border: 1px solid oklch(0.875 0.008 258);
  border-radius: 8px;

  font-size: 13px;
  color: oklch(0.58 0.012 258);
}
</style>
