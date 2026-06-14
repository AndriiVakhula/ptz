<script setup lang="ts">
import { ref } from 'vue'
import InputText from 'primevue/inputtext'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import FileUpload, { type FileUploadUploaderEvent } from 'primevue/fileupload'
import MessageTable from '../components/MessageTable.vue'
import { useMessages } from '../composables/useMessages'

const search = ref('')
const { filtered, loading, error, source, loaded, total, loadFromFile } = useMessages(search)

function onUpload(event: FileUploadUploaderEvent) {
  const file = Array.isArray(event.files) ? event.files[0] : event.files
  if (file) loadFromFile(file)
}
</script>

<template>
  <div class="flex flex-col h-full min-h-0">
    <div class="flex items-center gap-4 px-5 py-2.5 border-b border-surface bg-surface-950 shrink-0">
      <Tag v-if="loaded" :value="`${filtered.length} / ${total} messages`" severity="secondary" />
      <span
        v-if="source"
        class="text-xs text-muted-color whitespace-nowrap max-w-[180px] overflow-hidden text-ellipsis"
        :title="source"
      >{{ source }}</span>
      <InputText
        v-if="loaded"
        v-model="search"
        type="search"
        placeholder="Search by channel or URL…"
        spellcheck="false"
        class="flex-1 max-w-[400px]"
      />
      <div v-else class="flex-1" />
      <FileUpload
        mode="basic"
        accept="application/json,.json"
        custom-upload
        auto
        :choose-label="loading ? 'Parsing…' : 'Upload'"
        choose-icon="pi pi-upload"
        severity="secondary"
        class="shrink-0"
        @uploader="onUpload"
      />
    </div>

    <main class="flex-1 overflow-y-auto">
      <div v-if="loading" class="p-10 text-center text-muted-color">Parsing…</div>
      <div v-else-if="error" class="p-10 text-center text-muted-color">
        <Message severity="error" :text="error" />
      </div>
      <div v-else-if="!loaded" class="flex flex-col items-center justify-center gap-3 h-full text-muted-color">
        <i class="pi pi-upload text-4xl opacity-50" />
        <p class="text-sm">Upload a JSON export to get started.</p>
      </div>
      <div v-else-if="filtered.length === 0" class="p-10 text-center text-muted-color">No results.</div>
      <MessageTable v-else :rows="filtered" />
    </main>
  </div>
</template>
