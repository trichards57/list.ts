import index from './index-of'

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

export default function (el) {
  return new ClassList(el)
}

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

class ClassList {
  constructor(el) {
    if (!el || !el.nodeType) {
      throw new Error('A DOM element reference is required')
    }
    this.el = el
    this.list = el.classList
  }
  /**
   * Add class `name` if not already present.
   *
   * @param {String} name
   * @return {ClassList}
   * @api public
   */
  add(name) {
    // classList
    if (this.list) {
      this.list.add(name)
      return this
    }

    // fallback
    var arr = this.array()
    var i = index(arr, name)
    if (!~i) arr.push(name)
    this.el.className = arr.join(' ')
    return this
  }
  /**
   * Remove class `name` when present, or
   * pass a regular expression to remove
   * any which match.
   *
   * @param {String|RegExp} name
   * @return {ClassList}
   * @api public
   */
  remove(name) {
    // classList
    if (this.list) {
      this.list.remove(name)
      return this
    }

    // fallback
    var arr = this.array()
    var i = index(arr, name)
    if (~i) arr.splice(i, 1)
    this.el.className = arr.join(' ')
    return this
  }
  /**
   * Toggle class `name`, can force state via `force`.
   *
   * For browsers that support classList, but do not support `force` yet,
   * the mistake will be detected and corrected.
   *
   * @param {String} name
   * @param {Boolean} force
   * @return {ClassList}
   * @api public
   */
  toggle(name, force) {
    // classList
    if (this.list) {
      if ('undefined' !== typeof force) {
        if (force !== this.list.toggle(name, force)) {
          this.list.toggle(name) // toggle again to correct
        }
      } else {
        this.list.toggle(name)
      }
      return this
    }

    // fallback
    if ('undefined' !== typeof force) {
      if (!force) {
        this.remove(name)
      } else {
        this.add(name)
      }
    } else {
      if (this.has(name)) {
        this.remove(name)
      } else {
        this.add(name)
      }
    }

    return this
  }
  /**
   * Return an array of classes.
   *
   * @return {Array}
   * @api public
   */
  array() {
    var className = this.el.getAttribute('class') || ''
    var str = className.replace(/^\s+|\s+$/g, '')
    var arr = str.split(/\s+/)
    if ('' === arr[0]) arr.shift()
    return arr
  }

  contains(name) {
    return this.list ? this.list.contains(name) : !!~index(this.array(), name)
  }
}
