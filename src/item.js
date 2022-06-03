module.exports = (list) =>
  function Item(initValues, element, notCreate) {
    const item = this;

    // eslint-disable-next-line no-underscore-dangle
    this._values = {};

    this.found = false; // Show if list.searched == true and this.found == true
    this.filtered = false; // Show if list.filtered == true and this.filtered == true

    this.values = (newValues, dontCreate) => {
      if (newValues !== undefined) {
        // eslint-disable-next-line no-underscore-dangle
        Object.assign(item._values, newValues);

        if (dontCreate !== true) {
          list.templater.set(item, item.values());
        }
      }
      // eslint-disable-next-line no-underscore-dangle
      return item._values;
    };

    this.show = () => {
      list.templater.show(item);
    };

    this.hide = () => {
      list.templater.hide(item);
    };

    this.matching = () =>
      (list.filtered && list.searched && item.found && item.filtered) ||
      (list.filtered && !list.searched && item.filtered) ||
      (!list.filtered && list.searched && item.found) ||
      (!list.filtered && !list.searched);

    this.visible = () => !!(item.elm && item.elm.parentNode === list.list);

    if (element === undefined) {
      if (notCreate) {
        item.values(initValues, notCreate);
      } else {
        item.values(initValues);
      }
    } else {
      item.elm = element;
      const values = list.templater.get(item, initValues);
      item.values(values);
    }
  };
