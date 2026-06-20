const translations: Record<string, string> = {
  name: 'Nazwa',
  actions: 'Akcje',
}

export const tableColumnsTranslate = (columnName: string) =>
  translations[columnName] ?? columnName
