/* eslint-disable no-param-reassign */
const getItem = require("./item");
const getAddAsync = require("./add-async");

module.exports = function List(id, options, values) {
  const self = this;
  const Item = getItem(self);
  const addAsync = getAddAsync(self);
  const initPagination = require("./pagination")(self);

  const init = {
    start() {
      self.listClass = "list";
      self.searchClass = "search";
      self.sortClass = "sort";
      self.page = 10000;
      self.i = 1;
      self.items = [];
      self.visibleItems = [];
      self.matchingItems = [];
      self.searched = false;
      self.filtered = false;
      self.searchColumns = undefined;
      self.searchDelay = 0;
      self.handlers = { updated: [] };
      self.valueNames = [];

      Object.assign(self, options);

      self.listContainer = typeof id === "string" ? document.getElementById(id) : id;
      if (!self.listContainer) {
        return;
      }
      [self.list] = self.listContainer.getElementsByClassName(self.listClass);

      self.parse = require("./parse")(self);
      self.templater = require("./templater")(self);
      self.search = require("./search")(self);
      self.filter = require("./filter")(self);
      self.sort = require("./sort")(self);
      self.fuzzySearch = require("./fuzzy-search")(self, options.fuzzySearch);

      this.handlers();
      this.items();
      this.pagination();

      self.update();
    },
    handlers() {
      const keys = Object.keys(self.handlers);

      for (let i = 0; i < keys.length; i += 1) {
        if (self[keys[i]] && Object.prototype.hasOwnProperty.call(self.handlers, keys[i])) {
          self.on(keys[i], self[keys[i]]);
        }
      }
    },
    items() {
      self.parse(self.list);
      if (values !== undefined) {
        self.add(values);
      }
    },
    pagination() {
      if (options.pagination !== undefined) {
        if (options.pagination === true) {
          options.pagination = [{}];
        }
        if (options.pagination[0] === undefined) {
          options.pagination = [options.pagination];
        }
        for (let i = 0; i < options.pagination.length; i += 1) {
          initPagination(options.pagination[i]);
        }
      }
    },
  };

  /*
   * Re-parse the List, use if html have changed
   */
  this.reIndex = () => {
    self.items = [];
    self.visibleItems = [];
    self.matchingItems = [];
    self.searched = false;
    self.filtered = false;
    self.parse(self.list);
  };

  this.toJSON = () => {
    const json = [];
    for (let i = 0; i < self.items.length; i += 1) {
      json.push(self.items[i].values());
    }
    return json;
  };

  /*
   * Add object to list
   */
  this.add = (vals, callback) => {
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
      notCreate = self.items.length > self.page;
      item = new Item(vals[i], undefined, notCreate);
      self.items.push(item);
      added.push(item);
    }
    self.update();
    return added;
  };

  this.show = function (i, page) {
    this.i = i;
    this.page = page;
    self.update();
    return self;
  };

  /* Removes object from list.
   * Loops through the list and removes objects where
   * property "valuename" === value
   */
  this.remove = (valueName, value, opts) => {
    let found = 0;
    let il = self.items.length;
    for (let i = 0; i < il; i += 1) {
      if (self.items[i].values()[valueName] === value) {
        self.templater.remove(self.items[i], opts);
        self.items.splice(i, 1);
        il -= 1;
        i -= 1;
        found += 1;
      }
    }
    self.update();
    return found;
  };

  /* Gets the objects in the list which
   * property "valueName" === value
   */
  this.get = (valueName, value) => {
    const matchedItems = [];
    for (let i = 0; i < self.items.length; i += 1) {
      const item = self.items[i];
      if (item.values()[valueName] === value) {
        matchedItems.push(item);
      }
    }
    return matchedItems;
  };

  /*
   * Get size of the list
   */
  this.size = () => self.items.length;

  /*
   * Removes all items from the list
   */
  this.clear = () => {
    self.templater.clear();
    self.items = [];
    return self;
  };

  this.on = (event, callback) => {
    self.handlers[event].push(callback);
    return self;
  };

  this.off = (event, callback) => {
    const e = self.handlers[event];
    const index = e.indexOf(callback);
    if (index > -1) {
      e.splice(index, 1);
    }
    return self;
  };

  this.trigger = (event) => {
    let i = self.handlers[event].length;
    while (i--) {
      self.handlers[event][i](self);
    }
    return self;
  };

  this.reset = {
    filter() {
      const is = self.items;
      let il = is.length;
      while (il--) {
        is[il].filtered = false;
      }
      return self;
    },
    search() {
      const is = self.items;
      let il = is.length;
      while (il--) {
        is[il].found = false;
      }
      return self;
    },
  };

  this.update = function () {
    const is = self.items;
    const il = is.length;

    self.visibleItems = [];
    self.matchingItems = [];
    self.templater.clear();
    for (let i = 0; i < il; i += 1) {
      if (is[i].matching() && self.matchingItems.length + 1 >= self.i && self.visibleItems.length < self.page) {
        is[i].show();
        self.visibleItems.push(is[i]);
        self.matchingItems.push(is[i]);
      } else if (is[i].matching()) {
        self.matchingItems.push(is[i]);
        is[i].hide();
      } else {
        is[i].hide();
      }
    }
    self.trigger("updated");
    return self;
  };

  init.start();
};
