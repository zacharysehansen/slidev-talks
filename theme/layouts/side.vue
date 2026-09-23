<!-- An image beside markdown text: a portrait next to a short path, a photo
     next to what it shows.

       ---
       layout: side
       image: /assets/portrait.jpg
       place: left              (default; or right)
       ---
       ### Flagstaff
       Grew up in northern Arizona
       ### 2021 – 2025
       BS Computer Science
       A smaller line of detail, if needed.

     Each `###` starts an entry: a small label, a line, then any detail. A
     missing image leaves a plain panel so the text still reads. -->
<script setup lang="ts">
defineProps<{ image: string, place?: 'left' | 'right' }>()

function drop(e: Event) {
  (e.target as HTMLElement).remove()
}
</script>

<template>
  <div class="slidev-layout side-layout" :class="place === 'right' ? 'img-right' : ''">
    <div class="side-img"><img :src="image" alt="" @error="drop"></div>
    <div class="side-text"><slot /></div>
  </div>
</template>
