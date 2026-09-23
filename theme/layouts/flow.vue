<!-- Steps joined by arrows. A markdown list, one item per step.

       ## Optional heading
       - Pretraining
         - General text          (a nested item is the step's detail line)
       - Fine-tuning
       - **Learned content**     (a bold-only item is the outcome, in accent)
       ::foot::
       Optional line under it.

     `direction: across` runs left to right; the default runs down.
     A numbered list (1. 2. 3.) prints the number in each box. -->
<script setup lang="ts">
defineProps<{ direction?: 'down' | 'across' }>()
</script>

<template>
  <div class="slidev-layout flow-layout" :class="direction === 'across' ? 'across' : 'down'">
    <slot />
    <div v-if="$slots.foot" class="lay-foot"><slot name="foot" /></div>
  </div>
</template>
