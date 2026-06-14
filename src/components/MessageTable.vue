<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ProgressSpinner from 'primevue/progressspinner'
import type { MessageRow } from '../composables/useMessages'
import MessageCard from './MessageCard.vue'
import CardModal from './CardModal.vue'

const props = defineProps<{ rows: MessageRow[] }>()

const BATCH = 20
const visibleCount = ref(BATCH)
const sentinel = ref<HTMLElement>()
let sentinelObs: IntersectionObserver | null = null

const displayedRows = computed(() => props.rows.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < props.rows.length)

const modalRow = ref<MessageRow | null>(null)

function openModal(row: MessageRow) {
  modalRow.value = row
}

function closeModal() {
  modalRow.value = null
}

watch(
  () => props.rows,
  () => { visibleCount.value = BATCH },
)

onMounted(() => {
  if (!sentinel.value) return
  sentinelObs = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value) {
        visibleCount.value = Math.min(visibleCount.value + BATCH, props.rows.length)
      }
    },
    { rootMargin: '400px' },
  )
  sentinelObs.observe(sentinel.value)
})

onBeforeUnmount(() => {
  sentinelObs?.disconnect()
})
</script>

<template>
  <div class="grid [grid-template-columns:repeat(auto-fill,minmax(380px,1fr))] gap-2.5 px-4 pt-3 pb-8 items-start">
    <MessageCard
      v-for="(row, i) in displayedRows"
      :key="row.messageUrl"
      :row="row"
      :index="i"
      @expand="openModal(row)"
    />

    <div ref="sentinel" class="col-span-full flex items-center justify-center h-12">
      <ProgressSpinner v-if="hasMore" style="width:32px;height:32px" stroke-width="4" />
      <span v-else-if="rows.length > 0" class="text-xs text-muted-color">All {{ rows.length }} messages shown</span>
    </div>
  </div>

  <CardModal v-if="modalRow" :row="modalRow" @close="closeModal" />
</template>
