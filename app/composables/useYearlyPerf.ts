export const useYearlyPerf = (
  snapshots: Ref<{ date: string; value: number }[]>,
  transactions: Ref<{ date: string; type: string; amount: number }[]>
) => {
  return computed<AssetYearlyPerf[]>(() => {
    const snapshotsByYear = new Map<number, { date: string; value: number }[]>()
    for (const s of snapshots.value) {
      const year = parseInt(s.date.split('-')[0]!)
      const arr = snapshotsByYear.get(year) ?? []
      arr.push(s)
      snapshotsByYear.set(year, arr)
    }

    const txsByYear = new Map<
      number,
      { date: string; type: string; amount: number }[]
    >()
    for (const t of transactions.value) {
      const year = parseInt(t.date.split('-')[0]!)
      const arr = txsByYear.get(year) ?? []
      arr.push(t)
      txsByYear.set(year, arr)
    }

    const allYears = new Set([...snapshotsByYear.keys(), ...txsByYear.keys()])
    const result: AssetYearlyPerf[] = []
    let carry: number | null = null

    for (const year of [...allYears].sort()) {
      const ys = snapshotsByYear.get(year) ?? []
      const yearTxs = txsByYear.get(year) ?? []
      const endValue = ys.length > 0 ? ys.at(-1)!.value : null
      const startValue = carry ?? (ys.length > 0 ? ys[0]!.value : null)

      const cutoffDate = carry === null && ys.length > 0 ? ys[0]!.date : null
      const netInvested = yearTxs
        .filter((t) => !cutoffDate || t.date > cutoffDate)
        .reduce(
          (sum, t) =>
            sum +
            (t.type === TRANSACTION_TYPES.INVESTMENT_BUY
              ? t.amount
              : -t.amount),
          0
        )

      let gain: number | null = null
      let returnPercent: number | null = null

      if (startValue !== null && endValue !== null) {
        gain = endValue - startValue - netInvested
        const denom = startValue + netInvested * 0.5
        returnPercent = denom > 0 ? (gain / denom) * 100 : null
      }

      if (ys.length > 0 || netInvested !== 0) {
        result.push({
          year,
          startValue,
          endValue,
          netInvested,
          gain,
          returnPercent,
        })
      }

      if (endValue !== null) carry = endValue
    }

    return result
  })
}
