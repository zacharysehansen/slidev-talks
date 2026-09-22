<!-- Full-bleed photograph with the caption anchored into the clear band.
     On the ACABI slides, 19 faces sit above y=515 in the rendered frame and
     nothing here covers one. `bottom` on .photo-cap is a fixed 44px for exactly
     that reason.

     `logo` is an optional lockup, top right, on a light plate so a dark mark
     reads over a dark photograph. `thinker` opts the cutout back in; the layout
     has to draw it rather than the slide, because .photo-cap is positioned and
     would capture the cutout's absolute placement. -->
<script setup lang="ts">
defineProps<{ image: string; logo?: string; thinker?: boolean }>()

// losing the photo should leave the caption readable on the navy, not crash
function dropFrame(e: Event) {
  (e.target as HTMLElement).parentElement?.remove()
}
function dropSelf(e: Event) {
  (e.target as HTMLElement).remove()
}
</script>

<template>
  <div class="slidev-layout photo">
    <div class="photo-bleed">
      <img :src="image" alt="" @error="dropFrame">
    </div>
    <img v-if="logo" class="photo-logo" :src="logo" alt="" @error="dropSelf">
    <div class="photo-cap">
      <slot />
    </div>
    <Thinker v-if="thinker" />
  </div>
</template>
