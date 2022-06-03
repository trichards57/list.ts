/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const Item = require("./item");
const Templater = require("./templater");
const parser = require("./parse");

module.exports = class List {
  constructor(id, options, values) {
    this.listClass = "list";
    this.searchClass = "search";
    this.sortClass = "sort";
    this.page = 10000;
    this.i = 1;
    this.items = [];
    this.visibleItems = [];
    this.matchingItems = [];
    this.searched = false;
    this.filtered = false;
    this.searchColumns = undefined;
    this.searchDelay = 0;
    this.handlers = { updated: [], filterStart: [], filterComplete: [], parseComplete: [] };
    this.valueNames = [];
    this._values = values;
    this._options = options;

    Object.assign(this, options);

    this.listContainer = typeof id === "string" ? document.getElementById(id) : id;
    if (!this.listContainer) {
      return;
    }
    [this.list] = this.listContainer.getElementsByClassName(this.listClass);

    this.parse = parser;
    this.templater = new Templater(this);
    this.search = require("./search")(this);
    this.sort = require("./sort")(this);
    this.fuzzySearch = require("./fuzzy-search")(this, options.fuzzySearch);

    this._handlers();
    this._items();
    this._pagination();

    this.update();
  }

  _handlers() {
    Object.keys(this.handlers)
      .filter((key) => this[key] && Object.prototype.hasOwnProperty.call(this.handlers, key))
      .forEach((key) => {
        this.on(key, this[key]);
      });
  }

  _items() {
    this.parse(this);
    if (this._values !== undefined) {
      this.add(this._values);
    }
  }

  _pagination() {
    const initPagination = require("./pagination")(this);

    if (this._options.pagination !== undefined) {
      if (this._options.pagination === true) {
        this._options.pagination = [{}];
      } else if (!Array.isArray(this._options.pagination)) {
        this._options.pagination = [this._options.pagination];
      }

      this._options.pagination.forEach(initPagination);
    }
  }

  /*
   * Re-parse the List, use if html have changed
   */
  reIndex() {
    this.items = [];
    this.visibleItems = [];
    this.matchingItems = [];
    this.searched = false;
    this.filtered = false;
    this.parse(this);
  }

  toJSON() {
    return this.items.flatMap((i) => i.values());
  }

  /*
   * Add object to list
   */
  add(vals, callback) {
    if (vals.length === 0) {
      return [];
    }
    if (callback) {
      this.addAsync(vals.slice(0), callback);
      return null;
    }

    if (!Array.isArray(vals)) {
      vals = [vals];
    }

    const added = vals.map((v) => {
      const item = new Item(v);

      if (!(this.items.length > this.page)) this.templater.set(item, item.values());

      return item;
    });

    this.items = this.items.concat(added);

    this.update();
    return added;
  }

  addAsync(values, callback, items) {
    const valuesToAdd = values.splice(0, 50);
    let itms = items || [];
    itms = itms.concat(this.add(valuesToAdd));
    if (values.length > 0) {
      setTimeout(() => {
        this.addAsync(values, callback, itms);
      }, 1);
    } else {
      this.update();
      callback(itms);
    }
  }

  show(i, page) {
    this.i = i;
    this.page = page;
    this.update();
    return this;
  }

  /* Removes object from list.
   * Loops through the list and removes objects where
   * property "valuename" === value
   */
  remove(valueName, value, opts) {
    let found = 0;
    let il = this.items.length;

    for (let i = 0; i < il; i += 1) {
      if (this.items[i].values()[valueName] === value) {
        this.templater.remove(this.items[i], opts);
        this.items.splice(i, 1);
        il -= 1;
        i -= 1;
        found += 1;
      }
    }
    this.update();
    return found;
  }

  /* Gets the objects in the list which
   * property "valueName" === value
   */
  get(valueName, value) {
    const matchedItems = [];
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item.values()[valueName] === value) {
        matchedItems.push(item);
      }
    }
    return matchedItems;
  }

  /*
   * Get size of the list
   */
  size = () => this.items.length;

  /*
   * Removes all items from the list
   */
  clear() {
    this.templater.clear();
    this.items = [];
    return this;
  }

  on(event, callback) {
    this.handlers[event] = [...this.handlers[event], callback];
    return this;
  }

  off(event, callback) {
    this.handlers[event] = this.handlers[event].filter((e) => e !== callback);
    return this;
  }

  trigger(event) {
    this.handlers[event].forEach((h) => h(this));
    return this;
  }

  itemVisible = (item) => !!(item.elm && item.elm.parentNode === this.list);

  itemMatches = (item) =>
    (this.filtered && this.searched && item.found && item.filtered) ||
    (this.filtered && !this.searched && item.filtered) ||
    (!this.filtered && this.searched && item.found) ||
    (!this.filtered && !this.searched);

  resetFilter() {
    this.items.forEach((e) => {
      e.filtered = false;
    });

    return this;
  }

  resetSearch() {
    this.items.forEach((e) => {
      e.found = false;
    });

    return this;
  }

  update() {
    const is = this.items;
    const il = is.length;

    this.visibleItems = [];
    this.matchingItems = [];
    this.templater.clear();
    for (let i = 0; i < il; i += 1) {
      if (this.itemMatches(is[i]) && this.matchingItems.length + 1 >= this.i && this.visibleItems.length < this.page) {
        this.templater.show(is[i]);
        this.visibleItems.push(is[i]);
        this.matchingItems.push(is[i]);
      } else if (this.itemMatches(is[i])) {
        this.matchingItems.push(is[i]);
        this.templater.hide(is[i]);
      } else {
        this.templater.hide(is[i]);
      }
    }
    this.trigger("updated");
    return this;
  }

  filter(filterFunction) {
    this.trigger("filterStart");
    this.i = 1; // Reset paging
    this.resetFilter();
    if (filterFunction === undefined) {
      this.filtered = false;
    } else {
      this.filtered = true;
      this.items.forEach((i) => {
        i.filtered = !!filterFunction(i);
      });
    }
    this.update();
    this.trigger("filterComplete");
    return this.visibleItems;
  }
};
