<script setup lang="ts">
import { ref } from 'vue'
import { onSlideEnter, onSlideLeave } from '@slidev/client'

/*
  Two slides use this. The defaults are the EarthScape clip, so the call site
  that was here first still reads `<PerformanceVideo />` and behaves exactly as
  it did.

  `fit` matters. EarthScape is 16:9 and fills the frame, so it covers. The motion
  comparison is 1898x890, wider than the canvas, and cropping it would cut one of
  its two panels off, so it contains and letterboxes instead.
*/
withDefaults(defineProps<{ src?: string; fit?: 'cover' | 'contain'; missing?: string }>(), {
  src: '/assets/earthscape.mp4',
  fit: 'cover',
  missing: 'Drop the trimmed clip at public/assets/earthscape.mp4 and reload.',
})

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
    <div v-if="broken" class="video-miss">{{ missing }}</div>
  </div>
</template>
