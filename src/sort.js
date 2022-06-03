/* eslint-disable no-param-reassign */
const naturalSort = require("string-natural-compare");
const toString = require("./utils/to-string");

module.exports = (list) => {
  const buttons = {
    els: undefined,
    clear() {
      Array.from(buttons.els).forEach((b) => {
        b.classList.remove("asc");
        b.classList.remove("desc");
      });
    },
    getOrder(btn) {
      if (btn.dataset.order === "asc" || btn.dataset.order === "desc") {
        return btn.dataset.order;
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
      options.insensitive = !(btn.dataset.insensitive === "false");
    },
    setOrder(options) {
      Array.from(buttons.els)
        .filter((b) => b.dataset.sort === options.valueName)
        .forEach((b) => {
          if (b.dataset.order === "asc" || b.dataset.order === "desc") {
            if (b.dataset.order === options.order) {
              b.classList.add(options.order);
            }
          } else {
            b.classList.add(options.order);
          }
        });
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
          naturalSort(
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

  Array.from(buttons.els).forEach((el) => el.addEventListener("click", sort));

  list.on("searchStart", buttons.clear);
  list.on("filterStart", buttons.clear);

  return sort;
};
