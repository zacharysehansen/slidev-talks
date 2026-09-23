<!-- One link, centred, clickable, nothing else. Opens in a new tab.

       <https://example.com/the-post> -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'

const root = ref<HTMLElement>()
onMounted(() => root.value?.querySelectorAll('a').forEach((a) => {
  a.target = '_blank'
  a.rel = 'noopener'
}))
</script>

<template>
  <div ref="root" class="slidev-layout link-layout"><slot /></div>
</template>
