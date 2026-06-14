<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import type { MessageRow } from '../composables/useMessages'
import { useSavedPosts } from '../composables/useSavedPosts'
import TagInput from './TagInput.vue'
import TelegramEmbed from './TelegramEmbed.vue'

const props = defineProps<{ row: MessageRow; index: number }>()
defineEmits<{ expand: [] }>()

const { isSaved, isPending, toggle } = useSavedPosts()

// Collapsed: the card is clipped to a fixed height (overflow hidden, no inner
// scrollbar). The expand button flips it to its natural height with overflow
// visible so the full post shows in place.
const expanded = ref(false)

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function postSlug(messageUrl: string): string {
  return messageUrl.replace('https://t.me/', '')
}
</script>

<template>
  <Card
    class="animate-card-in"
    :class="expanded ? 'h-auto overflow-visible' : 'h-[600px] overflow-hidden'"
  >
    <template #header>
      <div class="flex items-center gap-2 pl-3 pr-1.5 py-1 border-b border-surface">
        <span class="text-[0.65rem] text-muted-color min-w-[18px] tabular-nums">{{ index + 1 }}</span>
        <span class="text-sm font-semibold text-primary-400 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">{{ row.channelName ?? String(row.channelId) }}</span>
        <span class="text-xs text-muted-color whitespace-nowrap">{{ formatDate(row.date) }}</span>
        <Button
          :icon="isSaved(row.messageUrl) ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
          :severity="isSaved(row.messageUrl) ? 'primary' : 'secondary'"
          variant="text"
          size="small"
          rounded
          :loading="isPending(row.messageUrl)"
          :title="isSaved(row.messageUrl) ? 'Remove from saved' : 'Save post'"
          @click.stop="toggle(props.row)"
        />
        <Button
          :icon="expanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          severity="secondary"
          variant="text"
          size="small"
          rounded
          :title="expanded ? 'Collapse' : 'Expand'"
          @click.stop="expanded = !expanded"
        />
        <Button
          icon="pi pi-external-link"
          severity="secondary"
          variant="text"
          size="small"
          rounded
          title="Open in modal"
          @click.stop="$emit('expand')"
        />
      </div>
    </template>

    <template #content>
      <a
        :href="row.messageUrl"
        target="_blank"
        rel="noopener"
        class="flex items-center gap-1.5 text-xs text-primary-300 no-underline break-all transition-colors mb-1 hover:text-primary-200 hover:underline"
      >
        <i class="pi pi-send text-[0.7rem] opacity-60 shrink-0" />
        {{ row.messageUrl }}
      </a>
      <TagInput v-if="isSaved(row.messageUrl)" :row="row" class="mb-1.5" />
      <TelegramEmbed :post="postSlug(row.messageUrl)" />
    </template>
  </Card>
</template>
