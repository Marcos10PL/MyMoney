<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <div class="flex flex-1 h-screen">
    <AppSidebar v-model:open="open" />

    <div
      class="flex-1 flex flex-col overflow-hidden lg:peer-data-[variant=floating]:my-4 peer-data-[variant=inset]:m-4 lg:peer-data-[variant=inset]:not-peer-data-[collapsible=offcanvas]:ms-0 peer-data-[variant=inset]:rounded-xl peer-data-[variant=inset]:shadow-sm peer-data-[variant=inset]:ring peer-data-[variant=inset]:ring-default bg-default"
    >
      <div
        class="h-(--ui-header-height) shrink-0 flex items-center justify-between px-4 border-b lg:border border-muted/50 lg:rounded-lg lg:mr-2"
      >
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Przełącz menu"
          @click="open = !open"
        />
        <div class="flex items-center gap-2">
          <UColorModeButton />
          <LogoutButton />
        </div>
      </div>

      <div
        class="flex-1 p-4 md:p-6 lg:border border-muted/50 rounded-lg mt-2 lg:mr-2 h-full overflow-y-auto layout-main"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
