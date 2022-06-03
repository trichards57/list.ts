/* eslint-disable no-param-reassign */
const toString = require("./utils/to-string");

module.exports = (list) => {
  const buttons = {
    els: undefined,
    clear() {
      for (let i = 0; i < buttons.els.length; i += 1) {
        buttons.els[i].classList.remove("asc");
        buttons.els[i].classList.remove("desc");
      }
    },
    getOrder(btn) {
      const predefinedOrder = btn.getAttribute("data-order");
      if (predefinedOrder === "asc" || predefinedOrder === "desc") {
        return predefinedOrder;
      }
      if (btn.classList.contains("desc")) {
        return "asc";
      }
      if (btn.classList.contains("asc")) {
        return "desc";
      }
      return "asc";
    },
    getInSensitive(btn, options) {
      const insensitive = btn.getAttribute("data-insensitive");
      if (insensitive === "false") {
        options.insensitive = false;
      } else {
        options.insensitive = true;
      }
    },
    setOrder(options) {
      for (let i = 0; i < buttons.els.length; i += 1) {
        const btn = buttons.els[i];
        if (btn.getAttribute("data-sort") === options.valueName) {
          const predefinedOrder = btn.getAttribute("data-order");
          if (predefinedOrder === "asc" || predefinedOrder === "desc") {
            if (predefinedOrder === options.order) {
              btn.classList.add(options.order);
            }
          } else {
            btn.classList.add(options.order);
          }
        }
      }
    },
  };

  const sort = (...args) => {
    list.trigger("sortStart");
    let options = {};

    const target = args[0].currentTarget || args[0].srcElement || undefined;

    if (target) {
      options.valueName = target.getAttribute("data-sort");
      buttons.getInSensitive(target, options);
      options.order = buttons.getOrder(target);
    } else {
      options = args[1] || options;
      [options.valueName] = args;
      options.order = options.order || "asc";
      options.insensitive = typeof options.insensitive === "undefined" ? true : options.insensitive;
    }

    buttons.clear();
    buttons.setOrder(options);

    // caseInsensitive
    // alphabet
    const customSortFunction = options.sortFunction || list.sortFunction || null;
    const multi = options.order === "desc" ? -1 : 1;
    let sortFunction;

    if (customSortFunction) {
      sortFunction = (itemA, itemB) => customSortFunction(itemA, itemB, options) * multi;
    } else {
      sortFunction = (itemA, itemB) => {
        const sortOptions = {};
        sortOptions.alphabet = list.alphabet || options.alphabet || undefined;
        sortOptions.caseInsensitive = !sortOptions.alphabet && options.insensitive;

        return (
          list.utils.naturalSort(
            toString(itemA.values()[options.valueName]),
            toString(itemB.values()[options.valueName]),
            sortOptions
          ) * multi
        );
      };
    }

    list.items.sort(sortFunction);
    list.update();
    list.trigger("sortComplete");
  };

  // Add handlers
  list.handlers.sortStart = list.handlers.sortStart || [];
  list.handlers.sortComplete = list.handlers.sortComplete || [];

  buttons.els = list.listContainer.getElementsByClassName(list.sortClass);
  list.utils.events.bind(buttons.els, "click", sort);
  list.on("searchStart", buttons.clear);
  list.on("filterStart", buttons.clear);

  return sort;
};
