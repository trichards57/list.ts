import { bind } from './utils/events'
import List from './index'

export default function (list: {
  page: number
  listContainer: HTMLElement
  matchingItems: string | any[]
  i: any
  show: (arg0: number, arg1: any) => void
  on: (arg0: string, arg1: () => void) => void
}) {
  var isHidden = false

  var refresh = function (
    pagingList: {
      clear: () => void
      add: (arg0: { page: string | number; dotted: boolean }) => any[]
      size: () => any
    },
    options: { innerWindow?: number; left?: number; outerWindow?: number; right?: number }
  ) {
    if (list.page < 1) {
      list.listContainer.style.display = 'none'
      isHidden = true
      return
    } else if (isHidden) {
      list.listContainer.style.display = 'block'
    }

    var item,
      l = list.matchingItems.length,
      index = list.i,
      page = list.page,
      pages = Math.ceil(l / page),
      currentPage = Math.ceil(index / page),
      innerWindow = options.innerWindow || 2,
      left = options.left || options.outerWindow || 0,
      right = options.right || options.outerWindow || 0

    right = pages - right
    pagingList.clear()
    for (var i = 1; i <= pages; i++) {
      var className = currentPage === i ? 'active' : ''

      //console.log(i, left, right, currentPage, (currentPage - innerWindow), (currentPage + innerWindow), className);

      if (is.number(i, left, right, currentPage, innerWindow)) {
        item = pagingList.add({
          page: i,
          dotted: false,
        })[0]
        if (className) {
          item.elm.classList.add(className)
        }
        item.elm.firstChild.setAttribute('data-i', i)
        item.elm.firstChild.setAttribute('data-page', page)
      } else if (is.dotted(pagingList, i, left, right, currentPage, innerWindow, pagingList.size())) {
        item = pagingList.add({
          page: '...',
          dotted: true,
        })[0]
        item.elm.classList.add('disabled')
      }
    }
  }

  var is = {
    number: function (i: any, left: any, right: any, currentPage: any, innerWindow: any) {
      return this.left(i, left) || this.right(i, right) || this.innerWindow(i, currentPage, innerWindow)
    },
    left: function (i: number, left: number) {
      return i <= left
    },
    right: function (i: number, right: number) {
      return i > right
    },
    innerWindow: function (i: number, currentPage: number, innerWindow: number) {
      return i >= currentPage - innerWindow && i <= currentPage + innerWindow
    },
    dotted: function (
      pagingList: any,
      i: any,
      left: any,
      right: any,
      currentPage: any,
      innerWindow: any,
      currentPageItem: any
    ) {
      return (
        this.dottedLeft(pagingList, i, left, right, currentPage, innerWindow) ||
        this.dottedRight(pagingList, i, left, right, currentPage, innerWindow, currentPageItem)
      )
    },
    dottedLeft: function (pagingList: any, i: any, left: number, right: any, currentPage: any, innerWindow: any) {
      return i == left + 1 && !this.innerWindow(i, currentPage, innerWindow) && !this.right(i, right)
    },
    dottedRight: function (
      pagingList: { items: { values: () => { (): any; new (): any; dotted: any } }[] },
      i: any,
      left: any,
      right: any,
      currentPage: any,
      innerWindow: any,
      currentPageItem: number
    ) {
      if (pagingList.items[currentPageItem - 1].values().dotted) {
        return false
      } else {
        return i == right && !this.innerWindow(i, currentPage, innerWindow) && !this.right(i, right)
      }
    },
  }

  return function (options: {
    paginationClass?: string
    item?: string
    innerWindow?: number
    left?: number
    outerWindow?: number
    right?: number
  }) {
    var pagingList = new List(list.listContainer.id, {
      listClass: options.paginationClass || 'pagination',
      item: options.item || "<li><a class='page' href='#'></a></li>",
      valueNames: ['page', 'dotted'],
      searchClass: 'pagination-search-that-is-not-supposed-to-exist',
      sortClass: 'pagination-sort-that-is-not-supposed-to-exist',
    })

    bind([pagingList.listContainer], 'click', function (e) {
      var target = e.target || e.srcElement,
        page = target.getAttribute('data-page'),
        i = target.getAttribute('data-i')
      if (i) {
        list.show((i - 1) * page + 1, page)
      }
    })

    list.on('updated', function () {
      refresh(pagingList, options)
    })
    refresh(pagingList, options)
  }
}
