/**
 * Source: https://github.com/timoxley/to-array
 *
 * Convert an array-like object into an `Array`.
 * If `collection` is already an `Array`, then will return a clone of `collection`.
 *
 * @param {Array | Mixed} collection An `Array` or array-like object to convert e.g. `arguments` or `NodeList`
 * @return {Array} Naive conversion of `collection` to a new `Array`.
 * @api public
 */

module.exports = function toArray(collection) {
  if (typeof collection === "undefined") return [];
  if (collection === null) return [null];
  if (collection === window) return [window];
  if (typeof collection === "string") return [collection];
  if (Array.isArray(collection)) return collection;
  if (typeof collection.length !== "number") return [collection];
  if (typeof collection === "function" && collection instanceof Function) return [collection];

  const arr = [];
  for (let i = 0; i < collection.length; i += 1) {
    if (Object.prototype.hasOwnProperty.call(collection, i) || i in collection) {
      arr.push(collection[i]);
    }
  }
  if (!arr.length) return [];
  return arr;
};
