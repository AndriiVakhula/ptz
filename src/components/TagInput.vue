<script setup lang="ts">
import { computed, ref } from 'vue'
import AutoComplete, { type AutoCompleteCompleteEvent } from 'primevue/autocomplete'
import type { MessageRow } from '../composables/useMessages'
import { useSavedPosts } from '../composables/useSavedPosts'

const props = defineProps<{ row: MessageRow }>()

const { getSaved, setTags, allTags } = useSavedPosts()

const currentTags = computed(() => getSaved(props.row.messageUrl)?.tags ?? [])
const suggestions = ref<string[]>([])

function search(event: AutoCompleteCompleteEvent) {
  const q = event.query.trim()
  const lower = q.toLowerCase()
  const matches = allTags.value.filter((t) => t.toLowerCase().includes(lower))
  // Offer the typed text as the first "create new tag" option so Enter commits it.
  if (q && !allTags.value.some((t) => t.toLowerCase() === lower)) matches.unshift(q)
  suggestions.value = matches
}

function onChange(tags: unknown) {
  const next = (tags as string[]).map((t) => t.trim()).filter(Boolean)
  setTags(props.row, [...new Set(next)])
}
</script>

<template>
  <AutoComplete
    :model-value="currentTags"
    multiple
    :suggestions="suggestions"
    auto-option-focus
    complete-on-focus
    :delay="0"
    :pt="{ pcInputText: { class: 'text-xs' } }"
    placeholder="Add tag…"
    class="w-full"
    @complete="search"
    @update:model-value="onChange"
  />
</template>
