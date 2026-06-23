import type { H3Event } from 'h3'

export const getEventContext = (event: H3Event) => {
  return event.context.userSession
}

export const NONE_KEY = '__none__'

export const categoryStats = (
  map: Map<string, number>,
  categoriesMap: Record<string, string>,
  totalCount: number
) => {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, total]) => ({
      categoryId: key === NONE_KEY ? null : key,
      name:
        key === NONE_KEY ? 'Bez kategorii' : (categoriesMap[key] ?? 'Nieznana'),
      total,
      percent: totalCount > 0 ? Math.round((total / totalCount) * 100) : 0,
    }))
}
