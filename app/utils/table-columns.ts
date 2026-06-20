import { h } from 'vue'
import type { TableColumn, ButtonProps } from '@nuxt/ui'
import type { Column } from '@tanstack/vue-table'
import type { VNode } from 'vue'
import { UButton, UIcon, UTooltip, UiNotesCell } from '#components'
import { tableColumnsTranslate } from './table-columns-translate'

// ---- EXPAND COLUMN ----

export const createExpandColumn = <T>(
  header = '',
  cellLabel?: (row: T) => string
): TableColumn<T> => ({
  id: 'expand',
  header,
  cell: ({ row }) =>
    h(
      UButton,
      {
        variant: 'ghost',
        color: 'neutral',
        class: [
          'text-muted-foreground dark:hover:text-white hover:text-black',
          { 'dark:text-white text-black bg-muted': row.getIsExpanded() },
        ],
        size: 'xs',
        label: cellLabel
          ? cellLabel(row.original as T)
          : 'Kliknij, aby rozwinąć',
        onClick: () => row.toggleExpanded(),
      },
      {
        leading: () =>
          h(UIcon, {
            name: 'i-lucide-chevron-right',
            class: [
              'transition-transform duration-200 dark:text-white text-black',
              { 'rotate-90': row.getIsExpanded() },
            ],
          }),
      }
    ),
})

// ---- ACTION COLUMN ----

const iconsMap = {
  edit: { icon: 'lucide:pen', tooltip: 'Edytuj', color: 'info' },
  delete: { icon: 'lucide:trash-2', tooltip: 'Usuń', color: 'error' },
} as const

export const createActionColumn = <T>(
  header: string,
  buttons: ActionButton<T>[]
): TableColumn<T> => ({
  id: ACTIONS_ID_COLUMN,
  accessorKey: ACTIONS_ID_COLUMN,
  header,
  meta: { class: { th: 'actions' } },
  cell: ({ row }) =>
    h(
      'div',
      { class: 'flex gap-2 actions' },
      buttons.map((button) => {
        for (const key of ['edit', 'delete'] as const) {
          if (button[key]) {
            button.icon = iconsMap[key].icon
            button.tooltip = button.tooltip ?? iconsMap[key].tooltip
            button.color = button.color ?? iconsMap[key].color
            break
          }
        }

        const isLoading =
          typeof button.loading === 'function'
            ? button.loading(row.original)
            : button.loading

        const isDisabled =
          isLoading ||
          (typeof button.disabled === 'function'
            ? button.disabled(row.original)
            : button.disabled)

        const btn = h(
          UButton,
          {
            color: button.color ?? 'primary',
            variant: button.variant ?? 'outline',
            class: [
              'cursor-pointer',
              typeof button.className === 'function'
                ? button.className(row.original)
                : button.className,
            ],
            onClick: () => button.onClick(row.original),
            disabled: isDisabled,
          },
          {
            leading: () =>
              button.icon
                ? h(UIcon, {
                    name: isLoading ? 'lucide:loader-circle' : button.icon,
                    class: isLoading ? 'w-4 h-4 animate-spin' : 'w-4 h-4',
                  })
                : null,
            trailing: () =>
              button.trailingIcon
                ? h(UIcon, { name: button.trailingIcon, class: 'w-4 h-4' })
                : null,
            default: () => button.label,
          }
        )

        if (button.tooltip) {
          return h(UTooltip, { text: button.tooltip }, { default: () => btn })
        }

        return btn
      })
    ),
})

// ---- COLUMNS ----

export const createColumns = <T extends Record<string, unknown>>(
  fields: string[],
  options: Partial<Record<keyof T & string, ColumnOptions<T>>> = {}
): TableColumn<T>[] =>
  fields
    .filter((key) => key !== 'id')
    .map((key) => {
      const opts: ColumnOptions<T> = options[key] ?? {}
      const header = tableColumnsTranslate(key)

      const headerCell = opts.isSortable
        ? ({ column }: { column: Column<T> }) =>
            h(UButton, {
              variant: 'ghost',
              color: 'neutral',
              label: header,
              trailingIcon:
                column.getIsSorted() === 'asc'
                  ? 'i-lucide-arrow-up'
                  : column.getIsSorted() === 'desc'
                    ? 'i-lucide-arrow-down'
                    : 'i-lucide-arrow-up-down',
              class: '-mx-2.5',
              onClick: () => {
                if (!column.getIsSorted()) column.toggleSorting(false)
                else if (column.getIsSorted() === 'asc')
                  column.toggleSorting(true)
                else column.clearSorting()
              },
            })
        : header

      return {
        accessorKey: key,
        header: headerCell,
        cell: ({ row }) => {
          const raw = row.getValue(key)

          if (opts.mapValue) return opts.mapValue(raw, row.original)

          if (opts.isPopover)
            return raw
              ? h(UiNotesCell, { text: String(raw) })
              : h('span', {}, '--')

          const value: VNode | string | null = opts.isDate
            ? formatDate(raw as string | null, { withTime: opts.withTime })
            : opts.isCurrency
              ? formatCurrency(raw != null ? Number(raw) : null)
              : opts.isBoolean
                ? raw
                  ? 'Tak'
                  : 'Nie'
                : (raw ?? '--').toString()

          return h('span', {}, value || '--')
        },
      }
    })

// ---- TYPES ---

type AllKeys<T> = T extends unknown ? keyof T : never
type OneOf<Variants extends object[]> = {
  [I in keyof Variants]: Variants[I] &
    Partial<
      Record<Exclude<AllKeys<Variants[number]>, keyof Variants[I]>, never>
    >
}[number]

type ColumnOptions<T> = {
  isSortable?: boolean
  mapValue?: (value: unknown, row: T) => VNode | string | null
} & OneOf<
  [
    { isDate: true; withTime?: boolean },
    { isCurrency: true },
    { isBoolean: true },
    { isPopover: true },
    object,
  ]
>

type ActionButton<T> = {
  label?: string
  color?: BtnColor
  variant?: BtnVariant
  className?: string | ((row: T) => string)
  disabled?: boolean | ((row: T) => boolean)
  loading?: boolean | ((row: T) => boolean)
  onClick: (row: T) => void
  icon?: string
  trailingIcon?: string
  tooltip?: string
} & OneOf<[{ edit: true }, { delete: true }, object]>

type BtnColor = ButtonProps['color']
type BtnVariant = ButtonProps['variant']
