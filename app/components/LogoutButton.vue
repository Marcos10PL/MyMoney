<script setup lang="ts">
const { fetch: refreshSession, user } = useUserSession()
const toasts = useToasts()

const loading = ref(false)

const handleLogout = async () => {
  loading.value = true

  try {
    await $fetch('/api/auth/logout', {
      method: 'POST',
    })
    toasts.showSuccess('Wylogowano pomyślnie.')

    await refreshSession()
  } finally {
    loading.value = false
    navigateTo('/login')
  }
}
</script>

<template>
  <UTooltip v-if="user" text="Wyloguj się">
    <UButton
      icon="lucide:log-out"
      variant="subtle"
      color="neutral"
      :loading="loading"
      @click="handleLogout"
    />
  </UTooltip>
</template>
