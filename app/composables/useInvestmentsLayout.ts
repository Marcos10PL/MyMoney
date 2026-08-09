import type { InjectionKey, ComputedRef, WritableComputedRef } from 'vue'

export type InvestmentsLayout = {
  table: ComputedRef<unknown>
  columnVisibility: WritableComputedRef<Record<string, boolean>>
  openCreate: () => void
  createLabel: string
  loading: ComputedRef<boolean>
  onRefresh: () => void
}

export const investmentsLayoutKey: InjectionKey<InvestmentsLayout> =
  Symbol('investmentsLayout')
