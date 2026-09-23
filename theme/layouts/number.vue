<!-- A number that matters gets the slide. One or two pairs, side by side:

       ## Optional heading
       # 0.1%
       of turns affirmed
       # *0 of 4*                 (emphasis draws the numeral in the accent)
       of its own errors corrected -->
<script setup lang="ts">
import { Comment, useSlots } from 'vue'
import type { VNode } from 'vue'

const slots = useSlots()
const VNodes = (p: { nodes: VNode[] }) => p.nodes

// anything before the first `#` is the heading, above the numbers
function split() {
  const nodes = (slots.default?.() ?? []).filter(v => v.type !== Comment)
  const at = nodes.findIndex(v => v.type === 'h1')
  return at < 0 ? { head: [], body: nodes } : { head: nodes.slice(0, at), body: nodes.slice(at) }
}
</script>

<template>
  <div class="slidev-layout number">
    <template v-for="parts in [split()]" :key="0">
      <VNodes :nodes="parts.head" />
      <div class="numbers"><VNodes :nodes="parts.body" /></div>
    </template>
  </div>
</template>
