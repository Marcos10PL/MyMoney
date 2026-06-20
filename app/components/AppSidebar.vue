<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = defineModel<boolean>({ default: false })

const items = ref<NavigationMenuItem[]>([
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-house',
      href: LINKS.DASHBOARD,
    },
    {
      label: 'Transakcje',
      icon: 'i-lucide-credit-card',
      href: LINKS.TRANSACTIONS,
    },
  ],
  [
    {
      label: 'Konta',
      icon: 'i-lucide-wallet',
      href: LINKS.ACCOUNTS,
    },
    {
      label: 'Kategorie',
      icon: 'i-lucide-list-check',
      href: LINKS.CATEGORIES,
    },
    {
      label: 'Banki',
      icon: 'i-lucide-dollar-sign',
      href: LINKS.BANKS,
    },
  ],
])
</script>

<template>
  <USidebar
    v-model:open="open"
    variant="floating"
    collapsible="icon"
    :ui="{
      container: 'h-full',
    }"
  >
    <UNavigationMenu
      :items="items"
      orientation="vertical"
      :ui="{
        link: 'py-2 px-1.5 overflow-hidden',
        list: 'flex flex-col gap-2',
      }"
    />
  </USidebar>
</template>
