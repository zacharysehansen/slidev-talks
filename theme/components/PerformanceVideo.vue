<script setup lang="ts">
import { computed, ref } from 'vue'
import { onSlideEnter, onSlideLeave } from '@slidev/client'

/*
  A full-bleed video that plays on slide enter and pauses on leave. The bleed
  layout draws it from `video:`; slides can also use it directly.

  `fit` matters. A 16:9 clip fills the frame, so it covers. Anything wider than
  the canvas (two panels side by side, say) should contain and letterbox, or
  cropping cuts a panel off. A missing file shows its path instead of a black
  frame, so the deck still opens.
*/
const props = withDefaults(defineProps<{ src: string; fit?: 'cover' | 'contain'; missing?: string }>(), {
  fit: 'cover',
})
const message = computed(() => props.missing ?? `Missing video: public${props.src}`)

const el = ref<HTMLVideoElement>()
const broken = ref(false)

onSlideEnter(() => {
  if (!el.value) return
  el.value.currentTime = 0
  el.value.play().catch(() => {})
})
onSlideLeave(() => el.value?.pause())
</script>

<template>
  <div class="video-holder">
    <video
      v-show="!broken" ref="el" muted playsinline preload="auto"
      :class="fit" :src="src" @error="broken = true"
    />
    <div v-if="broken" class="video-miss">{{ message }}</div>
  </div>
</template>
