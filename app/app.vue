<script setup>
const appName = 'MyMoney'
const description = 'Aplikacja do zarządzania finansami osobistymi.'

useHead({
  htmlAttrs: { lang: 'pl' },
  titleTemplate: (title) => (title ? `${title} - ${appName}` : appName),
  description,
  ogTitle: appName,
  ogDescription: description,
})
</script>

<template>
  <UApp>
    <NuxtLayout>
      <NuxtLoadingIndicator />
      <NuxtAnnouncer />
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
