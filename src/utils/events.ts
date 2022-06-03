/**
 * Bind `el` event `type` to `fn`.
 * @api public
 */
export function bind(
  el: HTMLCollectionOf<Element> | Element[],
  type: any,
  fn: (this: Element, ev: any) => any,
  capture?: boolean
) {
  for (var i = 0, il = el.length; i < il; i++) {
    el[i].addEventListener(type, fn, capture || false)
  }
}

/**
 * Unbind `el` event `type`'s callback `fn`.
 * @api public
 */
export function unbind(
  el: HTMLCollectionOf<Element>,
  type: any,
  fn: (this: Element, ev: any) => any,
  capture?: boolean
) {
  for (var i = 0, il = el.length; i < il; i++) {
    el[i].removeEventListener(type, fn, capture || false)
  }
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * `wait` milliseconds. If `immediate` is true, trigger the function on the
 * leading edge, instead of the trailing.
 * @api public
 */
export function debounce<T>(fn: (args: T) => void, wait: number, immediate?: boolean) {
  var timeout: NodeJS.Timeout
  return wait
    ? function () {
        var context = this,
          args = arguments
        var later = function () {
          timeout = null
          if (!immediate) fn.apply(context, args)
        }
        var callNow = immediate && !timeout
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
        if (callNow) fn.apply(context, args)
      }
    : fn
}
