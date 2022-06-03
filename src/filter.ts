export default function (list: {
  handlers: { filterStart: any[]; filterComplete: any[] }
  trigger: (arg0: string) => void
  i: number
  reset: { filter: () => void }
  filtered: boolean
  items: any
  update: () => void
  visibleItems: any
}) {
  // Add handlers
  list.handlers.filterStart = list.handlers.filterStart || []
  list.handlers.filterComplete = list.handlers.filterComplete || []

  return function (filterFunction: (arg0: any) => any) {
    list.trigger('filterStart')
    list.i = 1 // Reset paging
    list.reset.filter()
    if (filterFunction === undefined) {
      list.filtered = false
    } else {
      list.filtered = true
      var is = list.items
      for (var i = 0, il = is.length; i < il; i++) {
        var item = is[i]
        if (filterFunction(item)) {
          item.filtered = true
        } else {
          item.filtered = false
        }
      }
    }
    list.update()
    list.trigger('filterComplete')
    return list.visibleItems
  }
}
