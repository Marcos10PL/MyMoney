export type Layout = {
  table?: ComputedRef<unknown>
  columnVisibility?: WritableComputedRef<Record<string, boolean>>
  openCreate: () => void
  createLabel: string
  loading: ComputedRef<boolean>
  onRefresh: () => void
}

export const investmentsLayoutKey: InjectionKey<Layout> =
  Symbol('investmentsLayout')

export const assetDetailLayoutKey: InjectionKey<Layout> =
  Symbol('assetDetailLayout')
