<template>
  <div :class="size === 'small' ? 'loading-small' : 'loading'">
    <span :style="{ backgroundColor: color }"></span>
    <span :style="{ backgroundColor: color }"></span>
    <span :style="{ backgroundColor: color }"></span>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: '#000'
  },
  size: {
    type: String,
    default: 'big'
  }
});
</script>

<style scoped>
.loading,
.loading-small {
  display: inline-flex;
  align-items: center;
}

.loading-small > span {
  width: 4px;
  height: 4px;
}

.loading > span {
  width: 5px;
  height: 5px;
}

.loading > span,
.loading-small > span {
  animation-name: blink;
  animation-duration: 1.4s;
  animation-iteration-count: infinite;
  animation-fill-mode: both;
  border-radius: 50%;
  display: inline-block;
  margin: 0 1px;
}

.loading > span:nth-of-type(2),
.loading-small > span:nth-of-type(2) {
  animation-delay: 0.2s;
}

.loading > span:nth-of-type(3),
.loading-small > span:nth-of-type(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
</style>    