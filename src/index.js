/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const Item = require("./item");
const getAddAsync = require("./add-async");

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
    this.handlers = { updated: [] };
    this.valueNames = [];
    this._values = values;
    this._options = options;

    Object.assign(this, options);

    this.listContainer = typeof id === "string" ? document.getElementById(id) : id;
    if (!this.listContainer) {
      return;
    }
    [this.list] = this.listContainer.getElementsByClassName(this.listClass);

    this.parse = require("./parse")(this);
    this.templater = require("./templater")(this);
    this.search = require("./search")(this);
    this.filter = require("./filter")(this);
    this.sort = require("./sort")(this);
    this.fuzzySearch = require("./fuzzy-search")(this, options.fuzzySearch);

    this._handlers();
    this._items();
    this._pagination();

    this.update();
  }

  _handlers() {
    const keys = Object.keys(this.handlers);

    for (let i = 0; i < keys.length; i += 1) {
      if (this[keys[i]] && Object.prototype.hasOwnProperty.call(this.handlers, keys[i])) {
        this.on(keys[i], this[keys[i]]);
      }
    }
  }

  _items() {
    this.parse(this.list);
    if (this._values !== undefined) {
      this.add(this._values);
    }
  }

  _pagination() {
    const initPagination = require("./pagination")(this);

    if (this._options.pagination !== undefined) {
      if (this._options.pagination === true) {
        this._options.pagination = [{}];
      }
      if (this._options.pagination[0] === undefined) {
        this._options.pagination = [this._options.pagination];
      }
      for (let i = 0; i < this._options.pagination.length; i += 1) {
        initPagination(this._options.pagination[i]);
      }
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
    this.parse(this.list);
  }

  toJSON() {
    const json = [];
    for (let i = 0; i < this.items.length; i += 1) {
      json.push(this.items[i].values());
    }
    return json;
  }

  /*
   * Add object to list
   */
  add(vals, callback) {
    const addAsync = getAddAsync(this);

    if (vals.length === 0) {
      return;
    }
    if (callback) {
      addAsync(vals.slice(0), callback);
      return;
    }
    const added = [];
    let notCreate = false;
    if (vals[0] === undefined) {
      vals = [vals];
    }
    for (let i = 0; i < vals.length; i += 1) {
      let item = null;
      notCreate = this.items.length > this.page;
      item = new Item(vals[i], undefined, notCreate);

      if (!notCreate) this.templater.set(item, item.values());

      this.items.push(item);
      added.push(item);
    }
    this.update();
    return added;
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
    this.handlers[event].push(callback);
    return this;
  }

  off(event, callback) {
    const e = this.handlers[event];
    const index = e.indexOf(callback);
    if (index > -1) {
      e.splice(index, 1);
    }
    return this;
  }

  trigger(event) {
    let i = this.handlers[event].length;
    while (i--) {
      this.handlers[event][i](this);
    }
    return this;
  }

  itemVisible = (item) => !!(item.elm && item.elm.parentNode === this.list);

  itemMatches = (item) =>
    (this.filtered && this.searched && item.found && item.filtered) ||
    (this.filtered && !this.searched && item.filtered) ||
    (!this.filtered && this.searched && item.found) ||
    (!this.filtered && !this.searched);

  resetFilter() {
    const is = this.items;
    let il = is.length;
    while (il--) {
      is[il].filtered = false;
    }
    return this;
  }
  
  resetSearch() {
    const is = this.items;
    let il = is.length;
    while (il--) {
      is[il].found = false;
    }
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
};
