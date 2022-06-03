import Item from './item'
import List from './index'

export default function (list: List) {
  var getChildren = function (parent: { childNodes: any }) {
    var nodes = parent.childNodes,
      items = []
    for (var i = 0, il = nodes.length; i < il; i++) {
      // Only textnodes have a data attribute
      if (nodes[i].data === undefined) {
        items.push(nodes[i])
      }
    }
    return items
  }

  var parse = function (itemElements: string | any[], valueNames: any) {
    for (var i = 0, il = itemElements.length; i < il; i++) {
      list.items.push(new Item(list, valueNames, itemElements[i]))
    }
  }
  var parseAsync = function (itemElements: any[], valueNames: any) {
    var itemsToIndex = itemElements.splice(0, 50) // TODO: If < 100 items, what happens in IE etc?
    parse(itemsToIndex, valueNames)
    if (itemElements.length > 0) {
      setTimeout(function () {
        parseAsync(itemElements, valueNames)
      }, 1)
    } else {
      list.update()
      list.trigger('parseComplete')
    }
  }

  list.handlers.parseComplete = list.handlers.parseComplete || []

  return function () {
    var itemsToIndex = getChildren(list.list),
      valueNames = list.valueNames

    if (list.indexAsync) {
      parseAsync(itemsToIndex, valueNames)
    } else {
      parse(itemsToIndex, valueNames)
    }
  }
}
