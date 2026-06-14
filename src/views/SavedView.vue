<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Message from 'primevue/message'
import MessageTable from '../components/MessageTable.vue'
import { useSavedPosts } from '../composables/useSavedPosts'

const { savedRows, allTags, loading, error, fetchSaved } = useSavedPosts()

const selectedTags = ref<string[]>([])

function toggleTag(tag: string) {
  selectedTags.value = selectedTags.value.includes(tag)
    ? selectedTags.value.filter((t) => t !== tag)
    : [...selectedTags.value, tag]
}

// Keep only tags that still exist (a tag can disappear when its last post is untagged).
const activeSelection = computed(() => selectedTags.value.filter((t) => allTags.value.includes(t)))

const rows = computed(() => {
  if (activeSelection.value.length === 0) return savedRows.value
  return savedRows.value.filter((r) => r.tags.some((t) => activeSelection.value.includes(t)))
})

onMounted(() => fetchSaved())
</script>

<template>
  <main class="flex flex-col h-full min-h-0">
    <div v-if="allTags.length" class="flex flex-wrap items-center gap-1.5 px-4 py-2 border-b border-surface bg-surface-950 shrink-0">
      <span class="text-xs text-muted-color mr-1">Filter:</span>
      <button
        v-for="t in allTags"
        :key="t"
        type="button"
        class="px-2 py-0.5 rounded text-xs border transition-colors"
        :class="activeSelection.includes(t)
          ? 'border-primary-500 bg-primary-500/15 text-primary-300'
          : 'border-surface text-muted-color hover:text-color'"
        @click="toggleTag(t)"
      >
        {{ t }}
      </button>
      <button
        v-if="activeSelection.length"
        type="button"
        class="ml-1 px-2 py-0.5 rounded text-xs text-muted-color hover:text-color"
        @click="selectedTags = []"
      >
        Clear
      </button>
    </div>

    <div class="flex-1 overflow-y-auto">
      <div v-if="loading && savedRows.length === 0" class="p-10 text-center text-muted-color">Loading saved…</div>
      <div v-else-if="error" class="p-10 text-center text-muted-color">
        <Message severity="error" :text="error" />
      </div>
      <div
        v-else-if="savedRows.length === 0"
        class="flex flex-col items-center justify-center gap-3 h-full text-muted-color"
      >
        <i class="pi pi-bookmark text-4xl opacity-50" />
        <p class="text-sm">No saved posts yet. Bookmark posts from the Parser to see them here.</p>
      </div>
      <div v-else-if="rows.length === 0" class="p-10 text-center text-muted-color">No posts with the selected tags.</div>
      <MessageTable v-else :rows="rows" />
    </div>
  </main>
</template>
