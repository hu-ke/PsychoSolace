<template>
  <div class="container">
    <div class="bar" :style="{ animationDuration: '0.6s' }"></div>
    <div class="bar" :style="{ animationDuration: '0.8s' }"></div>
    <div class="bar" :style="{ animationDuration: '0.5s' }"></div>
  </div>
</template>

<script setup>
// 这里可以添加逻辑，当前示例无额外逻辑
</script>

<style scoped>
.container {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.bar {
  width: 4px;
  background: #666;
  animation: wave 1s infinite alternate;
}

@keyframes wave {
  from {
    height: 8px;
  }
  to {
    height: 24px;
  }
}
</style>  