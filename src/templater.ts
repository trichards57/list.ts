import List from '.'

export class Templater {
  private list: List

  createItem(values: any[]) {
    if (typeof this.list.item === 'function') {
      var item = this.list.item(values)
      return this.getItemSource(item)
    }
    var itemSource: Element
    if (typeof this.list.item === 'string') {
      if (this.list.item.indexOf('<') === -1) {
        itemSource = document.getElementById(this.list.item)
      } else {
        itemSource = this.getItemSource(this.list.item)
      }
    } else {
      /* If item source does not exists, use the first item in list as
        source for new items */
      itemSource = this.getFirstListItem()
    }

    if (!itemSource) {
      throw new Error("The list needs to have at least one item on init otherwise you'll have to add a template.")
    }

    itemSource = this.createCleanTemplateItem(itemSource, this.list.valueNames)

    return itemSource.cloneNode(true)
  }

  private createCleanTemplateItem(templateNode: Element, valueNames: string | any[]) {
    var el = templateNode.cloneNode(true) as Element
    el.removeAttribute('id')

    for (var i = 0, il = valueNames.length; i < il; i++) {
      var elm = undefined,
        valueName = valueNames[i]
      if (valueName.data) {
        for (var j = 0, jl = valueName.data.length; j < jl; j++) {
          el.setAttribute('data-' + valueName.data[j], '')
        }
      } else if (valueName.attr && valueName.name) {
        elm = el.getElementsByClassName(valueName.name)[0]
        if (elm) {
          elm.setAttribute(valueName.attr, '')
        }
      } else {
        elm = el.getElementsByClassName(valueName)[0]
        if (elm) {
          elm.innerHTML = ''
        }
      }
    }
    return el
  }

  constructor(list: List) {
    this.list = list
  }

  private getFirstListItem() {
    var nodes = this.list.list.childNodes

    for (var i = 0, il = nodes.length; i < il; i++) {
      const n = nodes[i] as HTMLElement

      // Only textnodes have a data attribute
      if (n.dataset === undefined) {
        return n.cloneNode(true) as Element
      }
    }
    return undefined
  }
  private getItemSource(itemHTML: string) {
    if (/<tr[\s>]/g.exec(itemHTML)) {
      var tbody = document.createElement('tbody')
      tbody.innerHTML = itemHTML
      return tbody.firstElementChild
    } else if (itemHTML.indexOf('<') !== -1) {
      var div = document.createElement('div')
      div.innerHTML = itemHTML
      return div.firstElementChild
    }
    return undefined
  }
  private getValueName(name: any) {
    for (var i = 0, il = this.list.valueNames.length; i < il; i++) {
      var valueName = this.list.valueNames[i]
      if (valueName.dataset) {
        var data = valueName.dataset
        for (var j = 0, jl = data.length; j < jl; j++) {
          if (data[j] === name) {
            return { data: name }
          }
        }
      } else if (valueName.attributes && valueName.nodeName && valueName.nodeName == name) {
        return valueName
      } else if (valueName === name) {
        return name
      }
    }
  }
  private setValue(elm: Element, name: string, value: any) {
    var valueName = this.getValueName(name)
    if (!valueName) return
    if (valueName.data) {
      elm.setAttribute('data-' + valueName.data, value)
    } else if (valueName.attr && valueName.name) {
      elm = elm.getElementsByClassName(valueName.name)[0]
      if (elm) {
        elm.setAttribute(valueName.attr, value)
      }
    } else {
      elm = elm.getElementsByClassName(valueName.name)[0]
      if (elm) {
        elm.innerHTML = value
      }
    }
  }

  get(item: { elm: any }, valueNames: string | any[]) {
    this.create(item)
    var values: any = {}
    for (var i = 0, il = valueNames.length; i < il; i++) {
      var elm = undefined,
        valueName = valueNames[i]
      if (valueName.data) {
        for (var j = 0, jl = valueName.data.length; j < jl; j++) {
          values[valueName.data[j]] = item.elm.getAttribute('data-' + valueName.data[j])
        }
      } else if (valueName.attr && valueName.name) {
        elm = item.elm.getElementsByClassName(valueName.name)[0]
        values[valueName.name] = elm ? item.elm.getAttribute(valueName.attr) : ''
      } else {
        elm = item.elm.getElementsByClassName(valueName)[0]
        values[valueName] = elm ? elm.innerHTML : ''
      }
    }
    return values
  }

  set(item: Element, values: { [x: string]: any; hasOwnProperty: (arg0: string) => any }) {
    if (!this.create(item)) {
      for (var v in values) {
        if (values.hasOwnProperty(v)) {
          this.setValue(item, v, values[v])
        }
      }
    }
  }

  create(item: any) {
    if (item.elm !== undefined) {
      return false
    }
    item.elm = this.createItem(item.values())
    this.set(item, item.values())
    return true
  }
  remove(item: any) {
    if (item.elm.parentNode === this.list.list) {
      this.list.list.removeChild(item.elm)
    }
  }
  show(item: any) {
    this.create(item)
    this.list.list.appendChild(item.elm)
  }
  hide(item: any) {
    if (item.elm !== undefined && item.elm.parentNode === this.list.list) {
      this.list.list.removeChild(item.elm)
    }
  }
  clear() {
    /* .innerHTML = ''; fucks up IE */
    if (this.list.list.hasChildNodes()) {
      while (this.list.list.childNodes.length >= 1) {
        this.list.list.removeChild(this.list.list.firstChild)
      }
    }
  }
}

export default function (list: List): Templater {
  return new Templater(list)
}
