export default function (list: { add: (arg0: any) => any; update: () => void }) {
  var addAsync = function (values: unknown[], callback: (a: unknown) => void, items?: string | any[]) {
    var valuesToAdd = values.splice(0, 50)
    items = items || []
    items = items.concat(list.add(valuesToAdd))
    if (values.length > 0) {
      setTimeout(function () {
        addAsync(values, callback, items)
      }, 1)
    } else {
      list.update()
      callback(items)
    }
  }
  return addAsync
}
