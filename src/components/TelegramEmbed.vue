<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Skeleton from 'primevue/skeleton'

const props = defineProps<{ post: string }>()

const root = ref<HTMLElement>()
const frame = ref<HTMLIFrameElement>()
const src = ref('')
const height = ref(0)
const loaded = ref(false)

let intersectionObs: IntersectionObserver | null = null
let fallbackTimer: ReturnType<typeof setTimeout> | null = null

// Telegram's embedded post page (?embed=1) reports its rendered height to the
// parent via postMessage. Match by the iframe's own contentWindow so multiple
// embeds (e.g. a card + the modal) never cross-talk.
function onMessage(e: MessageEvent) {
  if (!frame.value || e.source !== frame.value.contentWindow) return
  let data: { event?: string; height?: number } | null = null
  try {
    data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
  } catch {
    return
  }
  if (data?.event === 'resize' && data.height) {
    height.value = data.height
    loaded.value = true
  }
}

function onLoad() {
  // If Telegram never sends a resize message, reveal at a sensible height.
  fallbackTimer = setTimeout(() => {
    if (!height.value) {
      height.value = 480
      loaded.value = true
    }
  }, 2000)
}

onMounted(() => {
  if (!root.value) return
  window.addEventListener('message', onMessage)

  intersectionObs = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      intersectionObs?.disconnect()
      intersectionObs = null
      const sep = props.post.includes('?') ? '&' : '?'
      src.value = `https://t.me/${props.post}${sep}embed=1&userpic=false`
    },
    { rootMargin: '200px' },
  )
  intersectionObs.observe(root.value)
})

onBeforeUnmount(() => {
  intersectionObs?.disconnect()
  window.removeEventListener('message', onMessage)
  if (fallbackTimer) clearTimeout(fallbackTimer)
})
</script>

<template>
  <div ref="root" class="relative mt-1.5 rounded-md overflow-hidden min-h-[72px]">
    <iframe
      v-if="src"
      ref="frame"
      :src="src"
      scrolling="no"
      frameborder="0"
      class="block w-full border-0 transition-opacity duration-200"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      :style="{ height: `${height || 480}px` }"
      @load="onLoad"
    />
    <div v-if="!loaded" class="absolute inset-0 flex items-start gap-3 p-3.5">
      <Skeleton shape="circle" size="40px" />
      <div class="flex-1 flex flex-col gap-2 pt-1">
        <Skeleton width="55%" height="10px" border-radius="4px" />
        <Skeleton width="80%" height="10px" border-radius="4px" />
        <Skeleton width="65%" height="10px" border-radius="4px" />
      </div>
    </div>
  </div>
</template>
