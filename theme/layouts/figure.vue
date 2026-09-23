<!-- One plot on the light field. Markdown in, top to bottom:

       a line naming what is plotted        -> grey figure title
       ![](/figures/name.svg)               -> the plot
       ::takeaway::
       the claim, with *the phrase* in accent -> bold takeaway

     `takeaway: click` in the frontmatter holds the takeaway back one click so
     the plot gets a few silent seconds first. A `::legend::` slot sits to the
     right of the plot, for a legend too dense to read inside the image. -->
<script setup lang="ts">
defineProps<{ takeaway?: string }>()
</script>

<template>
  <div class="slidev-layout figure field-light">
    <div v-if="$slots.legend" class="fig-row">
      <div class="fig-body"><slot /></div>
      <div class="fig-legend"><slot name="legend" /></div>
    </div>
    <div v-else class="fig-body"><slot /></div>
    <div v-if="$slots.takeaway && takeaway === 'click'" v-click class="takeaway"><slot name="takeaway" /></div>
    <div v-else-if="$slots.takeaway" class="takeaway"><slot name="takeaway" /></div>
  </div>
</template>
