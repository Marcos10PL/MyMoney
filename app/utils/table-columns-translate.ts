const translations: Record<string, string> = {}

export const tableColumnsTranslate = (columnName: string) =>
  translations[columnName] ?? columnName
