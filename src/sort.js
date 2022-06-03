const toString = require('./utils/to-string')

module.exports = function (list) {
  var buttons = {
    els: undefined,
    clear: function () {
      for (var i = 0, il = buttons.els.length; i < il; i++) {
        buttons.els[i].classList.remove('asc')
        buttons.els[i].classList.remove('desc')
      }
    },
    getOrder: function (btn) {
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
    getInSensitive: function (btn, options) {
      var insensitive = btn.getAttribute('data-insensitive')
      if (insensitive === 'false') {
        options.insensitive = false
      } else {
        options.insensitive = true
      }
    },
    setOrder: function (options) {
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

  var sort = function () {
    list.trigger('sortStart')
    var options = {}

    var target = arguments[0].currentTarget || arguments[0].srcElement || undefined

    if (target) {
      options.valueName = target.getAttribute('data-sort')
      buttons.getInSensitive(target, options)
      options.order = buttons.getOrder(target)
    } else {
      options = arguments[1] || options
      options.valueName = arguments[0]
      options.order = options.order || 'asc'
      options.insensitive = typeof options.insensitive == 'undefined' ? true : options.insensitive
    }

    buttons.clear()
    buttons.setOrder(options)

    // caseInsensitive
    // alphabet
    var customSortFunction = options.sortFunction || list.sortFunction || null,
      multi = options.order === 'desc' ? -1 : 1,
      sortFunction

    if (customSortFunction) {
      sortFunction = function (itemA, itemB) {
        return customSortFunction(itemA, itemB, options) * multi
      }
    } else {
      sortFunction = function (itemA, itemB) {
        const sortOptions = {}
        sortOptions.alphabet = list.alphabet || options.alphabet || undefined
        sortOptions.caseInsensitive = !sortOptions.alphabet && options.insensitive

        return (
          list.utils.naturalSort(
            toString(itemA.values()[options.valueName]),
            toString(itemB.values()[options.valueName]),
            sortOptions
          ) * multi
        )
      }
    }

    list.items.sort(sortFunction)
    list.update()
    list.trigger('sortComplete')
  }

  // Add handlers
  list.handlers.sortStart = list.handlers.sortStart || []
  list.handlers.sortComplete = list.handlers.sortComplete || []

  buttons.els = list.listContainer.getElementsByClassName(list.sortClass)
  list.utils.events.bind(buttons.els, 'click', sort)
  list.on('searchStart', buttons.clear)
  list.on('filterStart', buttons.clear)

  return sort
}
