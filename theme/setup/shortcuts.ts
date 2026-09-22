import type { NavOperations, ShortcutOptions } from '@slidev/types'
import { useMagicKeys } from '@vueuse/core'
import { defineShortcutsSetup } from '@slidev/types'

export default defineShortcutsSetup((nav: NavOperations, base: ShortcutOptions[]) => {
  const keys = useMagicKeys()

  return [
    // Slidev binds `d` to light mode. The display is mirrored to the projector
    // with no presenter view, so a stray `d` would flip the deck to a white
    // background mid-talk and he would not see why. Dropped.
    ...base.filter(s => s.name !== 'toggle_dark'),

    // the rest of deck.html's keymap, which Slidev does not bind by default
    { name: 'next_enter', key: keys.enter, fn: nav.next, autoRepeat: true },
    { name: 'prev_backspace', key: keys.backspace, fn: nav.prev, autoRepeat: true },
    { name: 'first', key: keys.home, fn: nav.goFirst },
    { name: 'last', key: keys.end, fn: nav.goLast },
    {
      name: 'fullscreen',
      key: keys.f,
      fn: () => document.fullscreenElement
        ? document.exitFullscreen()
        : document.documentElement.requestFullscreen(),
    },
  ]
})
