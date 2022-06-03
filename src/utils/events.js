const toArray = require("./to-array");

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el, NodeList, HTMLCollection or Array
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */
exports.bind = (el, type, fn, capture) => {
  const els = toArray(el);
  for (let i = 0; i < els.length; i += 1) {
    els[i].addEventListener(type, fn, capture || false);
  }
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el, NodeList, HTMLCollection or Array
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */
exports.unbind = (el, type, fn, capture) => {
  const els = toArray(el);
  for (let i = 0; i < els.length; i += 1) {
    els[i].removeEventListener(type, fn, capture || false);
  }
};

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * `wait` milliseconds. If `immediate` is true, trigger the function on the
 * leading edge, instead of the trailing.
 *
 * @param {Function} fn
 * @param {Integer} wait
 * @param {Boolean} immediate
 * @api public
 */
exports.debounce = (fn, wait, immediate) => {
  let timeout;
  return wait
    ? (...args) => {
        const context = this;
        const later = () => {
          timeout = null;
          if (!immediate) fn.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) fn.apply(context, args);
      }
    : fn;
};
