<!-- Name card, on the master's light field.

     Markdown form:            # Name          then one line of meta under it.
                               `foot:` puts a line beside the lockup, bottom left.
                               `thinker: true` (or `click`) adds the cutout.
     Prop form (older decks):  name / meta / foot in the frontmatter.

     The pptx title slide is the light plate with the two arcs, everything
     centred, a short brick rule under the title, and a pair at the bottom:
     the meeting line beside the lockup. `field-light` supplies the field and
     the arcs; this supplies the type and moves that pair to the bottom left,
     because the cutout owns the bottom right on this slide and the master's
     own lockup is suppressed for it. -->
<script setup lang="ts">
defineProps<{ name?: string, meta?: string, foot?: string, thinker?: boolean | string }>()

function drop(e: Event) {
  (e.target as HTMLElement).remove()
}
</script>

<template>
  <div class="slidev-layout title field-light thinker-slide">
    <div v-if="name" class="title-wrap">
      <h1>{{ name }}</h1>
      <div class="title-rule" />
      <div class="title-meta">{{ meta }}</div>
    </div>
    <div v-else class="title-wrap title-md"><slot /></div>
    <div class="title-foot">
      <img
        class="brandmark" :src="'/brand/ua-mark-navy.png'"
        alt="The University of Arizona" @error="drop"
      >
      <span v-if="foot">{{ foot }}</span>
    </div>
    <slot v-if="name" />
    <Thinker v-if="thinker === 'click'" v-click />
    <Thinker v-else-if="thinker" />
  </div>
</template>
