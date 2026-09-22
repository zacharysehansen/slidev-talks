<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useNav } from '@slidev/client'

const { currentPage, total, next, isPrintMode, isPlaying } = useNav()

// A 2px line and no text. The only edge element in the deck.
const width = computed(() => `${((currentPage.value - 1) / (total.value - 1)) * 100}%`)

// Clicking anywhere advances, as a fallback if the clicker sends
// something the keymap does not recognise.
function onClick(e: MouseEvent) {
  const t = e.target as HTMLElement
  if (t.closest('a, button, input, .slidev-controls, .slidev-icon-btn')) return
  next()
}
onMounted(() => !isPrintMode.value && window.addEventListener('click', onClick))
onUnmounted(() => window.removeEventListener('click', onClick))
</script>

<template>
  <div v-if="isPlaying && !isPrintMode" id="rail" :style="{ width }" />
</template>
