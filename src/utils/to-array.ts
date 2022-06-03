export default function toArray(collection: undefined | null | Window | string | unknown[] | Function) {
  if (collection === undefined) return []
  if (collection === null) return [null]
  if (collection === window) return [window]
  if (typeof collection === 'string') return [collection]
  if (Array.isArray(collection)) return collection
  if (typeof collection.length != 'number') return [collection]
  if (typeof collection === 'function' && collection instanceof Function) return [collection]

  var arr = []
  for (var i = 0, il = collection.length; i < il; i++) {
    if (Object.prototype.hasOwnProperty.call(collection, i) || i in collection) {
      arr.push(collection[i])
    }
  }
  if (!arr.length) return []
  return arr
}

function isArray(arr: Function | Window | unknown[]) {
  return Object.prototype.toString.call(arr) === '[object Array]'
}
