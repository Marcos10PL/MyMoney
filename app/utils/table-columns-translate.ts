const translations: Record<string, string> = {
  name: 'Nazwa',
  type: 'Typ',
  parent: 'Rodzic',
  actions: 'Akcje',
  description: 'Opis',
  percentage: 'Procent',
  bank: 'Bank',
  isFree: 'Czy darmowe?',
  conditions: 'Warunki',
  startDate: 'Data rozpoczęcia',
  duration: 'Czas trwania',
  durationEndDate: 'Data zakończenia',
  isActive: 'Czy aktywne?',
  date: 'Data',
  amount: 'Kwota',
  counterparty: 'Kontrahent',
  account: 'Konto',
  category: 'Kategoria',
  toAccount: 'Konto docelowe',
}

export const tableColumnsTranslate = (columnName: string) =>
  translations[columnName] ?? columnName
