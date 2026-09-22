<script setup lang="ts">
// deck.html degrades gracefully when an asset is missing; keep that.
function drop(e: Event) {
  (e.target as HTMLElement).remove()
}
</script>

<!-- The cutout that rises out of the bottom-right corner on section openers. -->
<template>
  <img class="thinker" :src="'/brand/thinker.png'" alt="" @error="drop">
</template>
