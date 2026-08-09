<script setup lang="ts">
const route = useRoute()
const id = route.params.id as string

const { data: portfoliosData, pending: portfoliosPending } = useLazyFetch<
  APIResponse<Portfolio[]>
>('/api/investments/portfolios')

const portfolio = computed(
  () => portfoliosData.value?.data?.find((p) => p.id === id) ?? null
)

const { data: perfData, pending: perfPending } = useLazyFetch<
  APIResponse<AssetPerformanceData>
>(`/api/investments/portfolios/${id}/performance`)

const snapshots = computed(() => perfData.value?.data?.snapshots ?? [])
const txs = computed(() => perfData.value?.data?.transactions ?? [])
const yearlyPerf = useYearlyPerf(snapshots, txs)

const pending = computed(() => portfoliosPending.value || perfPending.value)
</script>

<template>
  <div>
    <SubHeader
      :title="portfolio?.name ?? '…'"
      back-button
      :refresh-loading="pending"
    />

    <div class="mt-4 space-y-6">
      <div class="rounded-lg border border-default p-4">
        <InvestmentsAssetChart
          :snapshots="snapshots"
          :transactions="txs"
          :loading="perfPending"
        />
      </div>

      <div>
        <p class="text-sm font-semibold uppercase tracking-wide mb-3 px-3">
          Wyniki roczne
        </p>
        <InvestmentsYearlyPerfTable :data="yearlyPerf" :loading="perfPending" />
      </div>
    </div>
  </div>
</template>
