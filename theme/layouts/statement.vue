<!-- One line, big. `# The line`, optionally followed by a smaller line.
     `thinker: true` (or `click`) adds the cutout bottom right. -->
<script setup lang="ts">
defineProps<{ thinker?: boolean | string }>()
</script>

<template>
  <div class="slidev-layout statement">
    <slot />
    <Thinker v-if="thinker === 'click'" v-click />
    <Thinker v-else-if="thinker" />
  </div>
</template>
