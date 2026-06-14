<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useSavedPosts } from './composables/useSavedPosts'

const { count, fetchSaved } = useSavedPosts()

onMounted(() => fetchSaved())
</script>

<template>
  <div class="flex flex-col h-dvh">
    <header class="flex items-center gap-5 px-5 py-2 border-b border-surface bg-surface-900 shrink-0">
      <span class="text-base font-bold text-primary-400 whitespace-nowrap">Parser</span>
      <nav class="flex items-center gap-1">
        <RouterLink
          to="/"
          exact-active-class="!text-primary-400 !bg-surface-800"
          class="px-3 py-1.5 rounded text-sm text-muted-color hover:text-color transition-colors"
        >
          Parser
        </RouterLink>
        <RouterLink
          to="/saved"
          active-class="!text-primary-400 !bg-surface-800"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm text-muted-color hover:text-color transition-colors"
        >
          <i class="pi pi-bookmark text-xs" />
          Saved ({{ count }})
        </RouterLink>
      </nav>
    </header>

    <RouterView v-slot="{ Component }">
      <KeepAlive>
        <component :is="Component" class="flex-1 min-h-0" />
      </KeepAlive>
    </RouterView>
  </div>
</template>
