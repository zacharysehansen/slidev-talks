<!-- Edge to edge, no padding. With `video:` it is one video, full bleed,
     played on slide enter and paused on leave:

       ---
       layout: bleed
       video: /assets/clip.mp4
       fit: contain            (letterbox instead of crop; default cover)
       ---
       Optional caption, bottom left

     Without `video:` it is an empty full-bleed frame for whatever the slide
     puts in it. -->
<script setup lang="ts">
defineProps<{ video?: string, fit?: 'cover' | 'contain' }>()
</script>

<template>
  <div class="slidev-layout bleed">
    <PerformanceVideo v-if="video" :src="video" :fit="fit ?? 'cover'" />
    <slot />
  </div>
</template>
