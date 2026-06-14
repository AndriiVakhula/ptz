<script setup lang="ts">
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import type { MessageRow } from '../composables/useMessages'
import { useSavedPosts } from '../composables/useSavedPosts'
import TagInput from './TagInput.vue'
import TelegramEmbed from './TelegramEmbed.vue'

const props = defineProps<{ row: MessageRow }>()
defineEmits<{ close: [] }>()

const { isSaved, isPending, toggle } = useSavedPosts()

function postSlug(messageUrl: string): string {
  return messageUrl.replace('https://t.me/', '')
}
</script>

<template>
  <Dialog
    visible
    modal
    :header="row.channelName ?? String(row.channelId)"
    :style="{ width: '620px', maxWidth: '95vw' }"
    @update:visible="$emit('close')"
  >
    <div class="mb-3 flex items-center gap-2">
      <Button
        as="a"
        :href="row.messageUrl"
        target="_blank"
        rel="noopener"
        label="Open original"
        icon="pi pi-external-link"
        severity="secondary"
        size="small"
        variant="text"
      />
      <Button
        :label="isSaved(row.messageUrl) ? 'Saved' : 'Save'"
        :icon="isSaved(row.messageUrl) ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
        :severity="isSaved(row.messageUrl) ? 'primary' : 'secondary'"
        size="small"
        variant="text"
        :loading="isPending(row.messageUrl)"
        @click="toggle(props.row)"
      />
    </div>

    <div class="mb-3">
      <label class="block text-xs text-muted-color mb-1">Tags</label>
      <TagInput :row="row" />
      <p class="text-[0.7rem] text-muted-color mt-1">Type to search existing tags or create a new one (press Enter to add). Adding a tag saves the post.</p>
    </div>

    <TelegramEmbed :post="postSlug(row.messageUrl)" />
  </Dialog>
</template>
