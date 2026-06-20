<template>
  <UContainer class="max-w-sm mx-auto">
    <header class="flex justify-between items-center mb-4 gap-2 pt-14">
      <AppLogo />
      <UColorModeButton />
    </header>

    <main>
      <USeparator class="mb-6" />
      <slot />
    </main>

    <footer class="w-full text-center text-sm text-muted mt-6">
      {{ new Date().getFullYear() }} &copy; Wszelkie prawa zastrzeżone.
    </footer>
  </UContainer>
</template>
