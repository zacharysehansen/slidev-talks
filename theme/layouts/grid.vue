<!-- Columns of like things. Each `###` starts a column; whatever follows it,
     up to the next `###`, sits under it (a short list, a line, or a number).

       ## Optional heading
       ### Nephrology
       Brenner and Rector
       ### Cardiology
       Braunwald
       ::foot::
       Optional line under the grid.

     The column count is the number of `###` headings. -->
<script setup lang="ts">
import { computed, useSlots } from 'vue'

const slots = useSlots()
const cols = computed(() => Math.max(1, (slots.default?.() ?? []).filter(v => v.type === 'h3').length))
</script>

<template>
  <div class="slidev-layout grid-layout">
    <div class="lay-grid" :style="{ '--cols': cols }"><slot /></div>
    <div v-if="$slots.foot" class="lay-foot"><slot name="foot" /></div>
  </div>
</template>
