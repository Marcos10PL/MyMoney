<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = defineModel<boolean>({ default: false })

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
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
    {
      label: 'Inwestycje',
      icon: 'i-lucide-trending-up',
      href: LINKS.PORTFOLIOS,
      active: route.path.startsWith(LINKS.INVESTMENTS),
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
      label: 'Instytucje',
      icon: 'i-lucide-building-2',
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
