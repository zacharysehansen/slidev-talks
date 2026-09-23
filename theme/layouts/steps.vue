<!-- A numbered list, one short item per line.

       ## Optional heading
       1. Do the eras differ?
       2. Can the corpus be built?
       ::foot::
       Optional line under the list.

     `hero: 4` draws item 4 in the accent. -->
<script setup lang="ts">
defineProps<{ hero?: number | string }>()
</script>

<template>
  <div class="slidev-layout steps" :class="hero ? `hero-${hero}` : ''">
    <slot />
    <div v-if="$slots.foot" class="lay-foot"><slot name="foot" /></div>
  </div>
</template>
