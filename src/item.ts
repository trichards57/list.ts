export default class Item {
  private _values: { [x: string]: any }
  found: boolean
  filtered: boolean
  list: {
    templater: {
      get: (arg0: any, arg1: any) => any
      set: (arg0: any, arg1: any) => void
      show: (arg0: any) => void
      hide: (arg0: any) => void
    }
    filtered: any
    searched: any
    list: any
  }
  elm: any

  constructor(
    list: {
      templater: {
        get: (arg0: any, arg1: any) => any
        set: (arg0: any, arg1: any) => void
        show: (arg0: any) => void
        hide: (arg0: any) => void
      }
      filtered: any
      searched: any
      list: any
    },
    initValues: any,
    element: any,
    notCreate?: any
  ) {
    var item = this

    this._values = {}
    this.list = list

    this.found = false // Show if list.searched == true and this.found == true
    this.filtered = false // Show if list.filtered == true and this.filtered == true

    if (element === undefined) {
      if (notCreate) {
        this.values(initValues, notCreate)
      } else {
        this.values(initValues)
      }
    } else {
      this.elm = element
      var values = list.templater.get(item, initValues)
      this.values(values)
    }
  }

  values(newValues?: { [x: string]: any }, notCreate?: boolean) {
    if (newValues !== undefined) {
      for (var name in newValues) {
        this._values[name] = newValues[name]
      }
      if (notCreate !== true) {
        this.list.templater.set(this, this.values())
      }
    } else {
      return this._values
    }
  }

  show() {
    this.list.templater.show(this)
  }

  hide() {
    this.list.templater.hide(this)
  }

  matching() {
    return (
      (this.list.filtered && this.list.searched && this.found && this.filtered) ||
      (this.list.filtered && !this.list.searched && this.filtered) ||
      (!this.list.filtered && this.list.searched && this.found) ||
      (!this.list.filtered && !this.list.searched)
    )
  }

  visible() {
    return this.elm && this.elm.parentNode == this.list.list ? true : false
  }
}
