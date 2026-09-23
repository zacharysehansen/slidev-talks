<!-- Two columns side by side.

       ## Optional heading
       ::left::
       ### 1986
       > a quoted line
       > another quoted line      (blank line between, so they are two quotes)
       **Observation**            (a closing bold line is the column's label)
       ::right::
       ### 2012
       > a quoted line
       **Mechanism**
       ::foot::
       One line under both columns.

     `vs: vs.` in the frontmatter puts that word between the columns and centres
     them, for a this-against-that slide. -->
<script setup lang="ts">
defineProps<{ vs?: string }>()
</script>

<template>
  <div class="slidev-layout compare-layout" :class="{ versus: vs }">
    <slot />
    <div class="cmp">
      <div class="cmp-col"><slot name="left" /></div>
      <div v-if="vs" class="cmp-vs">{{ vs }}</div>
      <div class="cmp-col"><slot name="right" /></div>
    </div>
    <div v-if="$slots.foot" class="lay-foot"><slot name="foot" /></div>
  </div>
</template>
