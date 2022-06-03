import pagination from './pagination'
import addAsync from './add-async'
import parseInit from './parse'
import templaterInit, { Templater } from './templater'
import searchInit from './search'
import filterInit from './filter'
import sortInit, { ISortOptions } from './sort'
import fuzzySearchInit from './fuzzy-search'
import Item from './item'

export default class List {
  public alphabet: boolean
  public listClass: string
  public searchClass: string
  public sortClass: string
  public page: number
  public i: number
  public item: string | ((a: any[]) => string)
  public items: Item[]
  public visibleItems: Item[]
  public matchingItems: Item[]
  public searched: boolean
  public filtered: boolean
  public searchColumns: string[]
  public searchDelay: number
  public valueNames: any[]
  public values: any[]
  public handlers: {
    parseComplete: ((list: List) => void)[]
    updated: ((list: List) => void)[]
    filterStart: ((list: List) => void)[]
    filterComplete: ((list: List) => void)[]
    sortStart: ((list: List) => void)[]
    sortComplete: ((list: List) => void)[]
    searchStart: ((list: List) => void)[]
    searchComplete: ((list: List) => void)[]
  } = {
    parseComplete: [],
    updated: [],
    filterStart: [],
    filterComplete: [],
    sortStart: [],
    sortComplete: [],
    searchStart: [],
    searchComplete: [],
  }
  public listContainer: HTMLElement
  public list: Element
  parse: (l: Element) => void
  templater: Templater
  search: (str: string) => any
  filter: (filterFunction: (arg0: any) => any) => any
  sort: (
    eventArgs: string | UIEvent,
    options?: {
      order?: 'asc' | 'desc'
      insensitive?: boolean
      sortFunction?: (itemA: unknown, itemB: unknown, options: ISortOptions) => number
      alphabet?: boolean
    }
  ) => void
  fuzzySearch: (str: any, columns: (searchString: any, columns: any) => void) => void
  reset: { filter: () => Window & typeof globalThis; search: () => Window & typeof globalThis }

  constructor(
    id: string | Element,
    options: {
      pagination?: boolean | [{}]
      fuzzySearch?: {}
      listClass?: string
      item?: string | ((a: any[]) => string)
      valueNames: string[]
      searchClass?: string
      sortClass?: string
    },
    values?: any[]
  ) {
    this.listClass = 'list'
    this.searchClass = 'search'
    this.sortClass = 'sort'
    this.page = 10000
    this.i = 1
    this.items = []
    this.visibleItems = []
    this.matchingItems = []
    this.searched = false
    this.filtered = false
    this.searchColumns = undefined
    this.searchDelay = 0
    this.valueNames = []
    this.values = values

    this.listContainer = (typeof id === 'string' ? document.getElementById(id) : id) as HTMLElement
    if (!this.listContainer) {
      throw new Error('List container needs to be a valid element.')
    }
    this.list = (this.listContainer as HTMLElement).getElementsByClassName(this.listClass)[0]

    this.reset = {
      filter: function () {
        var is = this.items,
          il = is.length
        while (il--) {
          is[il].filtered = false
        }
        return this
      },
      search: function () {
        var is = this.items,
          il = is.length
        while (il--) {
          is[il].found = false
        }
        return this
      },
    }

    this.parse = parseInit(this)
    this.templater = templaterInit(this)
    this.search = searchInit(this)
    this.filter = filterInit(this)
    this.sort = sortInit(this)
    this.fuzzySearch = fuzzySearchInit(this, options.fuzzySearch)

    this._items()
    this._pagination(options)

    this.update()
  }

  private _items() {
    this.parse(this.list)
    if (this.values !== undefined) {
      this.add(this.values)
    }
  }

  private _pagination(options: { pagination?: any }) {
    if (options.pagination !== undefined && options.pagination !== false) {
      if (options.pagination === true) {
        options.pagination = [{}]
      } else if (options.pagination[0] === undefined) {
        options.pagination = [options.pagination]
      }
      const initPagination = pagination(this)

      for (var i = 0, il = options.pagination.length; i < il; i++) {
        initPagination(options.pagination[i])
      }
    }
  }

  indexAsync() {}

  /*
   * Re-parse the List, use if html have changed
   */
  reIndex() {
    this.items = []
    this.visibleItems = []
    this.matchingItems = []
    this.searched = false
    this.filtered = false
    this.parse(this.list)
  }

  toJSON() {
    var json = []
    for (var i = 0, il = this.items.length; i < il; i++) {
      json.push(this.items[i].values())
    }
    return json
  }

  /*
   * Add object to list
   */
  add(values: {} | {}[], callback?: () => void) {
    const vals = Array.isArray(values) ? values : [values]

    if (vals.length === 0) {
      return
    }
    if (callback) {
      addAsync(this)(vals.slice(0), callback)
      return
    }
    var added = [],
      notCreate = false

    for (var i = 0, il = vals.length; i < il; i++) {
      var item = null
      notCreate = this.items.length > this.page ? true : false
      item = new Item(this, vals[i], undefined, notCreate)
      this.items.push(item)
      added.push(item)
    }
    this.update()
    return added
  }

  /* Removes object from list.
   * Loops through the list and removes objects where
   * property "valuename" === value
   */
  remove(valueName: string, value: {}) {
    var found = 0
    for (var i = 0, il = this.items.length; i < il; i++) {
      if (this.items[i].values()[valueName] == value) {
        this.templater.remove(this.items[i])
        this.items.splice(i, 1)
        il--
        i--
        found++
      }
    }
    this.update()
    return found
  }

  /* Gets the objects in the list which
   * property "valueName" === value
   */
  get(valueName: string, value: {}) {
    var matchedItems = []
    for (var i = 0, il = this.items.length; i < il; i++) {
      var item = this.items[i]
      if (item.values()[valueName] == value) {
        matchedItems.push(item)
      }
    }
    return matchedItems
  }

  /*
   * Get size of the list
   */
  size() {
    return this.items.length
  }

  show(i: number, page: number) {
    this.i = i
    this.page = page
    this.update()
    return this
  }

  /*
   * Removes all items from the list
   */
  clear() {
    this.templater.clear()
    this.items = []
    return this
  }

  on(event: keyof typeof this.handlers, callback: () => void) {
    this.handlers[event].push(callback)
    return this
  }

  off(event: keyof typeof this.handlers, callback: () => void) {
    var e = this.handlers[event]
    var index = e.indexOf(callback)
    if (index > -1) {
      e.splice(index, 1)
    }
    return this
  }

  trigger(event: keyof typeof this.handlers) {
    var i = this.handlers[event].length
    while (i--) {
      this.handlers[event][i](this)
    }
    return this
  }

  update() {
    var is = this.items,
      il = is.length

    this.visibleItems = []
    this.matchingItems = []
    this.templater.clear()
    for (var i = 0; i < il; i++) {
      if (is[i].matching() && this.matchingItems.length + 1 >= this.i && this.visibleItems.length < this.page) {
        is[i].show()
        this.visibleItems.push(is[i])
        this.matchingItems.push(is[i])
      } else if (is[i].matching()) {
        this.matchingItems.push(is[i])
        is[i].hide()
      } else {
        is[i].hide()
      }
    }
    this.trigger('updated')
    return this
  }
}
