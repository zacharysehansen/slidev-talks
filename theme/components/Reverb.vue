<!-- Conversation strips that fill turn by turn: one row per false statement,
     one cell per turn, reject or affirm. Motion-budget chart.

       <Reverb />                 reads data/reverb.json in the talk
       <Reverb data="other" />    reads data/other.json

     Each row is { claim, seq }, seq a list of 0 (rejected) and 1 (affirmed).
     R replays while the slide is on screen. Print mode renders it filled.
     Colours and type come from plot-tokens.css, i.e. plot_styles.py. -->
<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { onSlideEnter, onSlideLeave, useIsSlideActive, useNav } from '@slidev/client'

const props = withDefaults(defineProps<{ data?: string }>(), { data: 'reverb' })
const files = import.meta.glob<{ claim: string, seq: number[] }[]>('/data/*.json', { eager: true, import: 'default' })
const rows = computed(() => files[`/data/${props.data}.json`] ?? [])
const turns = computed(() => rows.value[0]?.seq.length ?? 0)

const filled = ref(0)
const isActive = useIsSlideActive()
const { isPrintMode } = useNav()
let timer: ReturnType<typeof setInterval> | undefined

function play() {
  stop()
  filled.value = 0
  timer = setInterval(() => {
    if (filled.value >= turns.value) return stop()
    filled.value++
  }, 62)
}
function stop() {
  if (timer) clearInterval(timer)
  timer = undefined
}
function onKey(e: KeyboardEvent) {
  if ((e.key === 'r' || e.key === 'R') && isActive.value && !isPrintMode.value) play()
}

onSlideEnter(() => (isPrintMode.value ? (filled.value = turns.value) : play()))
onSlideLeave(stop)
onMounted(() => {
  window.addEventListener('keydown', onKey)
  if (isPrintMode.value) filled.value = turns.value
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKey)
  stop()
})
</script>

<template>
  <div class="reverb">
    <div v-for="row in rows" :key="row.claim" class="reverb-row">
      <div class="reverb-label">{{ row.claim }}</div>
      <div class="reverb-strip" :style="{ gridTemplateColumns: `repeat(${turns}, 1fr)` }">
        <div
          v-for="(v, i) in row.seq" :key="i"
          class="cell"
          :class="i < filled ? (v ? 'aff' : 'rej') : ''"
        />
      </div>
    </div>
    <div class="reverb-axis"><span>turn 1</span><span>turn {{ turns }}</span></div>
    <div class="reverb-legend">
      <span><i class="rej" />rejects the false statement</span>
      <span><i class="aff" />affirms it as true</span>
    </div>
  </div>
</template>

<style>
.reverb{margin-top:30px;width:100%;font-family:var(--plot-font);font-weight:var(--plot-weight);color:var(--plot-text-dark)}
.reverb-row + .reverb-row{margin-top:18px}
.reverb-label{font-size:var(--plot-size-tick);margin-bottom:8px;line-height:1.2}
.reverb-strip{display:grid;gap:3px;height:50px}
.reverb .cell{background:var(--plot-empty-bg);border-radius:1px;transition:background .12s linear}
.reverb .rej{background:var(--plot-reject)}
.reverb .aff{background:var(--plot-affirm)}
.reverb-axis{display:flex;justify-content:space-between;font-size:var(--plot-size-tick);color:var(--plot-text-body);margin-top:8px}
.reverb-legend{display:flex;gap:30px;margin-top:18px;font-size:var(--plot-size-legend)}
.reverb-legend i{display:inline-block;width:16px;height:16px;border-radius:2px;margin-right:9px;vertical-align:-2px}
@media (prefers-reduced-motion:reduce){.reverb .cell{transition:none!important}}
</style>
