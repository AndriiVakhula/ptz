<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import VirtualScroller from 'primevue/virtualscroller'
import type { MessageRow } from '../composables/useMessages'
import MessageCard from './MessageCard.vue'
import CardModal from './CardModal.vue'

const props = defineProps<{ rows: MessageRow[] }>()

// Collapsed card height (matches h-[600px] in MessageCard) plus the vertical
// gap between rows. VirtualScroller positions each row on this fixed pitch, so
// only the rows in view (plus a small buffer) are ever mounted — that is what
// keeps 1000+ Telegram iframe embeds from piling up and breaking the page.
const CARD_HEIGHT = 600
const GAP = 20
const ROW_SIZE = CARD_HEIGHT + GAP
const MIN_COL = 380
const H_PADDING = 32 // px-4 on each side

const containerRef = ref<HTMLElement>()
const columns = ref(1)
let resizeObs: ResizeObserver | null = null

function recomputeColumns() {
  const el = containerRef.value
  if (!el) return
  const available = el.clientWidth - H_PADDING
  // Mirrors the previous `repeat(auto-fill, minmax(380px, 1fr))` column count.
  columns.value = Math.max(1, Math.floor((available + GAP) / (MIN_COL + GAP)))
}

// Chunk the flat row list into grid rows of `columns` cards each so every
// VirtualScroller item is one full grid row of uniform (collapsed) height.
const rowChunks = computed<MessageRow[][]>(() => {
  const cols = columns.value
  const chunks: MessageRow[][] = []
  for (let i = 0; i < props.rows.length; i += cols) {
    chunks.push(props.rows.slice(i, i + cols))
  }
  return chunks
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${columns.value}, minmax(0, 1fr))`,
}))

// Expanded state lives here (keyed by messageUrl) so it survives VirtualScroller
// reusing the underlying MessageCard instances for different rows while scrolling.
const expanded = ref(new Set<string>())

function toggleExpand(url: string) {
  if (expanded.value.has(url)) expanded.value.delete(url)
  else expanded.value.add(url)
}

const modalRow = ref<MessageRow | null>(null)

function openModal(row: MessageRow) {
  modalRow.value = row
}

function closeModal() {
  modalRow.value = null
}

watch(
  () => props.rows,
  () => { expanded.value.clear() },
)

onMounted(() => {
  recomputeColumns()
  if (containerRef.value) {
    resizeObs = new ResizeObserver(recomputeColumns)
    resizeObs.observe(containerRef.value)
  }
})

onBeforeUnmount(() => {
  resizeObs?.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="h-full">
    <VirtualScroller
      :items="rowChunks"
      :item-size="ROW_SIZE"
      scroll-height="100%"
      class="h-full w-full"
    >
      <template #item="{ item: rowCards, options }">
        <div class="grid gap-x-5 px-4 pb-5 items-start" :style="gridStyle">
          <MessageCard
            v-for="(row, i) in rowCards"
            :key="row.messageUrl"
            :row="row"
            :index="Number(options.index) * columns + Number(i)"
            :expanded="expanded.has(row.messageUrl)"
            @expand="openModal(row)"
            @toggle-expand="toggleExpand(row.messageUrl)"
          />
        </div>
      </template>
    </VirtualScroller>
  </div>

  <CardModal v-if="modalRow" :row="modalRow" @close="closeModal" />
</template>
