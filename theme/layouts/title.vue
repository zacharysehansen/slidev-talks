<!-- Name card, on the master's light field.
     The pptx title slide is the light plate with the two arcs, everything
     centred, a short brick rule under the title, and a pair at the bottom:
     the meeting line beside the lockup. `field-light` supplies the field and
     the arcs; this supplies the type and moves that pair to the bottom left,
     because the cutout owns the bottom right on this slide and the master's
     own lockup is suppressed for it. -->
<script setup lang="ts">
defineProps<{ name?: string, meta?: string, foot?: string }>()

function drop(e: Event) {
  (e.target as HTMLElement).remove()
}
</script>

<template>
  <div class="slidev-layout title field-light thinker-slide">
    <div class="title-wrap">
      <h1>{{ name }}</h1>
      <div class="title-rule" />
      <div class="title-meta">{{ meta }}</div>
    </div>
    <div class="title-foot">
      <img
        class="brandmark" :src="'/brand/ua-mark-navy.png'"
        alt="The University of Arizona" @error="drop"
      >
      <span v-if="foot">{{ foot }}</span>
    </div>
    <slot />
  </div>
</template>
