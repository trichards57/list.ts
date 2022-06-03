module.exports = class Item {
  // eslint-disable-next-line no-underscore-dangle
  _values = {};

  found = false; // Show if list.searched == true and this.found == true

  filtered = false; // Show if list.filtered == true and this.filtered == true

  constructor(initValues, element) {
    if (element === undefined) {
      this.values(initValues);
    } else {
      this.elm = element;
    }
  }

  values(newValues) {
    if (newValues !== undefined) {
      // eslint-disable-next-line no-underscore-dangle
      Object.assign(this._values, newValues);
    }
    // eslint-disable-next-line no-underscore-dangle
    return this._values;
  }
};
