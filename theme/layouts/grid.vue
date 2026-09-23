<!-- Columns of like things. Each `###` starts a column; everything after it,
     up to the next `###`, sits under it (a line, a short list, a number).

       ## Optional heading
       ### Nephrology
       **10**
       most prevalent diseases
       ### Cardiology
       Braunwald
       ::foot::
       Optional line under the grid.

     A paragraph that is only bold (`**10**`) prints as a large number. The
     column count is the number of `###` headings. -->
<script setup lang="ts">
import { Comment, useSlots } from 'vue'
import type { VNode } from 'vue'

const slots = useSlots()
const VNodes = (p: { nodes: VNode[] }) => p.nodes

function split() {
  const head: VNode[] = []
  const cols: VNode[][] = []
  for (const v of slots.default?.() ?? []) {
    if (v.type === Comment) continue
    if (v.type === 'h3') cols.push([v])
    else if (cols.length) cols[cols.length - 1].push(v)
    else head.push(v)
  }
  return { head, cols }
}
</script>

<template>
  <div class="slidev-layout grid-layout">
    <template v-for="parts in [split()]" :key="0">
      <VNodes :nodes="parts.head" />
      <div class="lay-grid" :style="{ '--cols': Math.max(1, parts.cols.length) }">
        <div v-for="(col, i) in parts.cols" :key="i" class="lay-col"><VNodes :nodes="col" /></div>
      </div>
    </template>
    <div v-if="$slots.foot" class="lay-foot"><slot name="foot" /></div>
  </div>
</template>
