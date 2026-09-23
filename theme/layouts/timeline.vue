<!-- Points on a line, left to right.

       ## Optional heading
       - 1963 Early
         - Observational prose.    (a nested item is the detail under it)
       - 1983 Middle
       - 2012 Late

     Each item starts with its year. `mark: 1980 DSM-III` draws a dashed
     marker at that year, placed in proportion between its neighbours, and
     brings it in on one click. -->
<script setup lang="ts">
import { computed, useSlots } from 'vue'
import type { VNode } from 'vue'

const props = defineProps<{ mark?: string | number }>()
const slots = useSlots()

function text(n: unknown): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n)
  if (Array.isArray(n)) return n.map(text).join('')
  if (n && typeof n === 'object' && 'children' in n) return text((n as VNode).children)
  return ''
}
const kids = (n: VNode): VNode[] => (Array.isArray(n.children) ? n.children as VNode[] : [])

const points = computed(() => {
  const list = (slots.default?.() ?? []).find(v => v.type === 'ul' || v.type === 'ol')
  if (!list) return []
  return kids(list).filter(li => li.type === 'li').map((li) => {
    const inner = kids(li).length ? kids(li) : [li.children as unknown as VNode]
    const sub = inner.find(c => c && (c.type === 'ul' || c.type === 'ol'))
    const head = text(inner.filter(c => c !== sub)).trim()
    const m = head.match(/^(\S+?)[:\s]\s*(.*)$/)
    return { yr: m ? m[1] : head, nm: m ? m[2] : '', dt: sub ? text(sub).trim() : '' }
  })
})

const marker = computed(() => {
  if (props.mark === undefined) return null
  const m = String(props.mark).match(/^(\d{3,4})\s*(.*)$/)
  if (!m) return null
  const y = Number(m[1])
  const ys = points.value.map(p => Number.parseFloat(p.yr))
  const n = ys.length
  let at = 0
  for (let k = 0; k < n - 1; k++) {
    if (y >= ys[k] && y <= ys[k + 1]) at = k + (y - ys[k]) / (ys[k + 1] - ys[k])
  }
  if (n && y > ys[n - 1]) at = n - 1
  return { left: `${(at / n) * 100}%`, label: `${m[2] ? `${m[2]}, ` : ''}${m[1]}` }
})
</script>

<template>
  <div class="slidev-layout timeline-layout">
    <slot />
    <div class="tl">
      <div class="tl-line" />
      <div class="tl-marks">
        <div v-for="p in points" :key="p.yr" class="era">
          <div class="tick" />
          <div class="yr">{{ p.yr }}</div>
          <div class="nm">{{ p.nm }}</div>
          <div v-if="p.dt" class="dt">{{ p.dt }}</div>
        </div>
      </div>
      <div v-if="marker" v-click class="dsm" :style="{ left: marker.left }"><span>{{ marker.label }}</span></div>
    </div>
  </div>
</template>
