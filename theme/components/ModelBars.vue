<!-- Horizontal bars that grow on slide enter. Motion-budget chart.

       <ModelBars />               reads data/models.json in the talk
       <ModelBars data="other" />  reads data/other.json

     Each row is { name, v, peak? }. `peak` draws that bar in the highlight
     colour. Values are percentages. Print mode renders the bars grown.
     Colours and type come from plot-tokens.css, i.e. plot_styles.py. -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { onSlideEnter, onSlideLeave, useNav } from '@slidev/client'

const props = withDefaults(defineProps<{ data?: string }>(), { data: 'models' })
const files = import.meta.glob<{ name: string, v: number, peak?: boolean }[]>('/data/*.json', { eager: true, import: 'default' })
const rows = computed(() => {
  const list = files[`/data/${props.data}.json`] ?? []
  const max = Math.max(...list.map(m => m.v))
  // 0.9% floor so a 0.1 stays a visible sliver rather than nothing
  return list.map(m => ({ ...m, w: `${Math.max((m.v / max) * 100, 0.9)}%` }))
})

const grown = ref(false)
const { isPrintMode } = useNav()
onSlideEnter(() => (grown.value = true))
onSlideLeave(() => (grown.value = false))
onMounted(() => {
  if (isPrintMode.value) grown.value = true
})
</script>

<template>
  <div class="mbars">
    <div v-for="(m, n) in rows" :key="m.name" class="mbar-row" :class="{ peak: m.peak }">
      <div class="mbar-name">{{ m.name }}</div>
      <div class="mbar-track">
        <div
          class="mbar-fill"
          :style="{ width: grown ? m.w : '0', transitionDelay: `${0.06 + n * 0.055}s` }"
        />
      </div>
      <div class="mbar-val">{{ m.v.toFixed(1) }}%</div>
    </div>
  </div>
</template>

<style>
.mbars{margin-top:24px;width:100%;font-family:var(--plot-font);font-weight:var(--plot-weight);color:var(--plot-text-dark);font-size:var(--plot-size-tick)}
.mbar-row{display:flex;align-items:center;height:44px;gap:16px}
.mbar-name{width:230px;text-align:right;flex-shrink:0}
.mbar-track{flex:1;height:22px}
.mbar-fill{height:100%;background:var(--plot-bar-black);width:0;transition:width .5s cubic-bezier(.2,.7,.3,1)}
.mbar-row.peak .mbar-fill{background:var(--plot-bar-red)}
.mbar-val{width:80px;flex-shrink:0}
.mbar-row.peak .mbar-val{color:var(--plot-bar-red)}
@media (prefers-reduced-motion:reduce){.mbar-fill{transition:none!important}}
</style>
