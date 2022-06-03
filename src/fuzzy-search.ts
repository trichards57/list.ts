import { bind, debounce } from './utils/events'
import toString from './utils/to-string'
import fuzzy from './utils/fuzzy'

export default function (
  list: {
    items: string | any[]
    listContainer: Element
    search: (
      arg0: any,
      arg1: (searchString: any, columns: any) => void,
      arg2?: (searchString: any, columns: any) => void
    ) => void
    searchDelay: any
  },
  options: { multiSearch?: boolean; searchClass?: string; location?: number; distance?: number; threshold?: number }
) {
  options = options || {}

  options = {
    location: 0,
    distance: 100,
    threshold: 0.4,
    multiSearch: true,
    searchClass: 'fuzzy-search',
    ...options,
  }

  var fuzzySearch = {
    search: function (searchString: string, columns: any) {
      // Substract arguments from the searchString or put searchString as only argument
      var searchArguments = options.multiSearch ? searchString.replace(/ +$/, '').split(/ +/) : [searchString]

      for (var k = 0, kl = list.items.length; k < kl; k++) {
        fuzzySearch.item(list.items[k], columns, searchArguments)
      }
    },
    item: function (
      item: { values: () => any; found: boolean },
      columns: string | any[],
      searchArguments: string | any[]
    ) {
      var found = true
      for (var i = 0; i < searchArguments.length; i++) {
        var foundArgument = false
        for (var j = 0, jl = columns.length; j < jl; j++) {
          if (fuzzySearch.values(item.values(), columns[j], searchArguments[i])) {
            foundArgument = true
          }
        }
        if (!foundArgument) {
          found = false
        }
      }
      item.found = found
    },
    values: function (
      values: { [x: string]: { toString(): string }; hasOwnProperty: (arg0: any) => any },
      value: string | number,
      searchArgument: string
    ) {
      if (values.hasOwnProperty(value)) {
        var text = toString(values[value]).toLowerCase()

        if (fuzzy(text, searchArgument, options)) {
          return true
        }
      }
      return false
    },
  }

  bind(
    list.listContainer.getElementsByClassName(options.searchClass),
    'keyup',
    debounce(function (e) {
      var target = e.target
      list.search(target.value, fuzzySearch.search)
    }, list.searchDelay)
  )

  return function (str: any, columns: (searchString: any, columns: any) => void) {
    list.search(str, columns, fuzzySearch.search)
  }
}
