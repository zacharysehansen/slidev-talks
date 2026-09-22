<!-- Project divider. The deck's only numbering, and asked for directly:
     the professor's objection was to corner chrome, not to named openers. -->
<script setup lang="ts">
defineProps<{ eyebrow?: string }>()
</script>

<template>
  <div class="slidev-layout divider">
    <div class="proj">
      <div class="pn">{{ eyebrow }}</div>
      <slot />
    </div>
    <Thinker />
  </div>
</template>
