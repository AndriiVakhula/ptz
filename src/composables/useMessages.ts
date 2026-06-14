import { ref, computed, type Ref } from 'vue'
import type { TeleZipData } from '../types/message'

export interface MessageRow {
  mid: number
  channelName: string | null
  channelId: number
  date: string
  messageUrl: string
}

/** Private channels use `t.me/c/{id}/{msg}` links (no public username) and can't be embedded. */
const PRIVATE_URL = /^https:\/\/t\.me\/c\//

function isTeleZipData(value: unknown): value is TeleZipData {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as TeleZipData).messages)
  )
}

export function useMessages(search: Ref<string>) {
  const data = ref<TeleZipData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const source = ref<string>('')

  async function loadFromFile(file: File) {
    loading.value = true
    error.value = null
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      if (!isTeleZipData(parsed)) {
        throw new Error('Not a valid TeleZip export — missing a "messages" array.')
      }
      data.value = parsed
      source.value = file.name
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      loading.value = false
    }
  }

  const rows = computed<MessageRow[]>(() => {
    if (!data.value) return []
    return data.value.messages
      .filter((msg) => !PRIVATE_URL.test(msg.messageUrl))
      .map((msg) => ({
        mid: msg.mid,
        channelName: msg.channelName,
        channelId: msg.channelId,
        date: msg.date,
        messageUrl: msg.messageUrl,
      }))
  })

  const filtered = computed<MessageRow[]>(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return rows.value
    return rows.value.filter(
      (r) =>
        r.channelName?.toLowerCase().includes(q) ||
        r.messageUrl.toLowerCase().includes(q),
    )
  })

  return {
    filtered,
    loading,
    error,
    source,
    loaded: computed(() => data.value !== null),
    total: computed(() => data.value?.totalMessages ?? 0),
    loadFromFile,
  }
}
