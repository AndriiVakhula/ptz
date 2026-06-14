import { ref, computed } from 'vue'
import { supabase, type SavedPostRow } from '../lib/supabase'
import type { MessageRow } from './useMessages'

export interface SavedPost extends MessageRow {
  tags: string[]
}

// Module-level state: a single shared saved-posts store across all components.
const savedRows = ref<SavedPost[]>([])
const savedMap = computed(() => new Map(savedRows.value.map((r) => [r.messageUrl, r])))
const allTags = computed(() =>
  [...new Set(savedRows.value.flatMap((r) => r.tags))].sort((a, b) => a.localeCompare(b)),
)
const pending = ref<Set<string>>(new Set())
const loading = ref(false)
const error = ref<string | null>(null)
let fetched = false

function toSavedPost(r: SavedPostRow): SavedPost {
  return {
    mid: 0,
    channelName: r.channel_name,
    channelId: r.channel_id,
    date: r.date,
    messageUrl: r.message_url,
    tags: r.tags ?? [],
  }
}

function toRow(post: SavedPost, tags: string[]): SavedPostRow {
  return {
    message_url: post.messageUrl,
    channel_name: post.channelName,
    channel_id: post.channelId,
    date: post.date,
    tags,
  }
}

function setPending(url: string, on: boolean) {
  const next = new Set(pending.value)
  on ? next.add(url) : next.delete(url)
  pending.value = next
}

async function fetchSaved(force = false) {
  if (fetched && !force) return
  fetched = true
  loading.value = true
  error.value = null
  const { data, error: err } = await supabase
    .from('saved_posts')
    .select('message_url, channel_name, channel_id, date, tags')
    .order('created_at', { ascending: false })
  if (err) {
    error.value = err.message
    fetched = false
  } else {
    savedRows.value = (data ?? []).map(toSavedPost)
  }
  loading.value = false
}

async function toggle(row: MessageRow) {
  const url = row.messageUrl
  if (pending.value.has(url)) return
  setPending(url, true)
  error.value = null

  const wasSaved = savedMap.value.has(url)
  const prev = savedRows.value
  savedRows.value = wasSaved
    ? prev.filter((r) => r.messageUrl !== url)
    : [{ ...row, tags: [] }, ...prev]

  const op = wasSaved
    ? supabase.from('saved_posts').delete().eq('message_url', url)
    : supabase.from('saved_posts').insert(toRow({ ...row, tags: [] }, []))

  const { error: err } = await op
  if (err) {
    savedRows.value = prev // Roll back on failure.
    error.value = err.message
  }
  setPending(url, false)
}

/** Set the tag list for a post, saving it first if it isn't saved yet. */
async function setTags(row: MessageRow, tags: string[]) {
  const url = row.messageUrl
  const clean = [...new Set(tags.map((t) => t.trim()).filter(Boolean))]
  setPending(url, true)
  error.value = null

  const prev = savedRows.value
  const existing = savedMap.value.get(url)
  savedRows.value = existing
    ? prev.map((r) => (r.messageUrl === url ? { ...r, tags: clean } : r))
    : [{ ...row, tags: clean }, ...prev]

  const { error: err } = await supabase
    .from('saved_posts')
    .upsert(toRow({ ...row, tags: clean }, clean), { onConflict: 'message_url' })
  if (err) {
    savedRows.value = prev // Roll back on failure.
    error.value = err.message
  }
  setPending(url, false)
}

export function useSavedPosts() {
  return {
    savedRows,
    allTags,
    loading,
    error,
    count: computed(() => savedRows.value.length),
    isSaved: (url: string) => savedMap.value.has(url),
    isPending: (url: string) => pending.value.has(url),
    getSaved: (url: string) => savedMap.value.get(url),
    fetchSaved,
    toggle,
    setTags,
  }
}
