import naturalSort from 'string-natural-compare'
import { bind } from './utils/events'

export interface ISortOptions {
  valueName: string
  insensitive: boolean
  order: 'asc' | 'desc'
}

export type SortFunction = (itemA: unknown, itemB: unknown, options: ISortOptions) => number

export default function (list: {
  trigger: (arg0: string) => void
  sortFunction?: SortFunction
  alphabet: any
  items: any[]
  update: () => void
  handlers: { sortStart: any[]; sortComplete: any[] }
  listContainer: Element
  sortClass: any
  on: (arg0: string, arg1: { (): void; (): void }) => void
}) {
  var buttons = {
    els: undefined as HTMLElement[] | undefined,
    clear: function () {
      for (var i = 0, il = buttons.els.length; i < il; i++) {
        buttons.els[i].classList.remove('asc')
        buttons.els[i].classList.remove('desc')
      }
    },
    getOrder: function (btn: Element) {
      var predefinedOrder = btn.getAttribute('data-order')
      if (predefinedOrder == 'asc' || predefinedOrder == 'desc') {
        return predefinedOrder
      } else if (btn.classList.contains('desc')) {
        return 'asc'
      } else if (btn.classList.contains('asc')) {
        return 'desc'
      } else {
        return 'asc'
      }
    },
    getInSensitive: function (btn: any, options: { insensitive: boolean }) {
      var insensitive = btn.getAttribute('data-insensitive')
      if (insensitive === 'false') {
        options.insensitive = false
      } else {
        options.insensitive = true
      }
    },
    setOrder: function (options: { valueName: string; order: 'asc' | 'desc' }) {
      for (var i = 0, il = buttons.els.length; i < il; i++) {
        var btn = buttons.els[i]
        if (btn.getAttribute('data-sort') !== options.valueName) {
          continue
        }
        var predefinedOrder = btn.getAttribute('data-order')
        if (predefinedOrder == 'asc' || predefinedOrder == 'desc') {
          if (predefinedOrder == options.order) {
            btn.classList.add(options.order)
          }
        } else {
          btn.classList.add(options.order)
        }
      }
    },
  }

  var sort = function (
    eventArgs: UIEvent | string,
    options?: { order?: 'asc' | 'desc'; insensitive?: boolean; sortFunction?: SortFunction; alphabet?: boolean }
  ) {
    list.trigger('sortStart')

    let opts: ISortOptions

    if (typeof eventArgs !== 'string') {
      opts = {
        ...options,
        valueName: (eventArgs.currentTarget as Element).getAttribute('data-sort'),
        insensitive: (eventArgs.currentTarget as Element).getAttribute('data-insensitive') !== 'false',
        order: buttons.getOrder(eventArgs.currentTarget as Element),
      }
    } else {
      opts = {
        order: 'asc',
        insensitive: true,
        ...options,
        valueName: eventArgs,
      }
    }

    buttons.clear()
    buttons.setOrder(opts)

    // caseInsensitive
    // alphabet
    let customSortFunction = options.sortFunction || list.sortFunction || null
    let multi = options.order === 'desc' ? -1 : 1
    let sortFunction

    if (customSortFunction) {
      sortFunction = (itemA: unknown, itemB: unknown) => customSortFunction(itemA, itemB, opts) * multi
    } else {
      sortFunction = function (itemA: any, itemB: any) {
        var sortOptions = {
          alphabet: list.alphabet || options.alphabet || undefined,
          caseInsensitive: undefined as boolean | undefined,
        }
        sortOptions.caseInsensitive = !sortOptions.alphabet && options.insensitive
        return naturalSort(itemA.values()[opts.valueName], itemB.values()[opts.valueName], sortOptions) * multi
      }
    }

    list.items.sort(sortFunction)
    list.update()
    list.trigger('sortComplete')
  }

  // Add handlers
  list.handlers.sortStart = list.handlers.sortStart || []
  list.handlers.sortComplete = list.handlers.sortComplete || []

  bind(list.listContainer.getElementsByClassName(list.sortClass), 'click', sort)
  list.on('searchStart', buttons.clear)
  list.on('filterStart', buttons.clear)

  return sort
}
