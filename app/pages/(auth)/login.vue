<script setup lang="ts">
import type * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import { loginSchema } from '~/schemas'

definePageMeta({ layout: 'auth' })

const { fetch: refreshSession } = useUserSession()
const { showError, showSuccess } = useToasts()

type Schema = z.output<typeof loginSchema>

const state = reactive<Schema>({
  login: '',
  password: '',
})

const loading = ref(false)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        login: event.data.login,
        password: event.data.password,
      },
    })

    await refreshSession()
    await navigateTo('/')

    showSuccess('Zalogowano pomyślnie.')
  } catch (error) {
    const statusCode = returnErrorStatus(error)

    if (statusCode === 401) {
      showError('Nieprawidłowy login lub hasło.')
    } else {
      showError('Wystąpił błąd podczas logowania.')
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UForm
    :schema="loginSchema"
    :state="state"
    class="space-y-4 w-full *:min-w-full"
    :disabled="loading"
    @submit="onSubmit"
  >
    <UiInput
      v-model="state.login"
      :max-length="VALIDATION.LOGIN_MAX_LENGTH"
      name="login"
      placeholder="Login..."
    />

    <UiInput
      v-model="state.password"
      name="password"
      type="password"
      placeholder="Hasło..."
    />

    <UButton type="submit" :loading="loading" block> Zaloguj się </UButton>
  </UForm>
</template>
