const events = require("./utils/events");
const toString = require("./utils/to-string");
const fuzzy = require("./utils/fuzzy");

module.exports = (list, options) => {
  const opts = {
    location: 0,
    distance: 100,
    threshold: 0.4,
    multiSearch: true,
    searchClass: "fuzzy-search",
    ...options,
  };

  const fuzzySearch = {
    search(searchString, columns) {
      // Substract arguments from the searchString or put searchString as only argument
      const searchArguments = opts.multiSearch ? searchString.replace(/ +$/, "").split(/ +/) : [searchString];

      for (let k = 0; k < list.items.length; k += 1) {
        fuzzySearch.item(list.items[k], columns, searchArguments);
      }
    },
    item(item, columns, searchArguments) {
      let found = true;
      for (let i = 0; i < searchArguments.length; i += 1) {
        let foundArgument = false;
        for (let j = 0; j < columns.length; j += 1) {
          if (fuzzySearch.values(item.values(), columns[j], searchArguments[i])) {
            foundArgument = true;
          }
        }
        if (!foundArgument) {
          found = false;
        }
      }
      // eslint-disable-next-line no-param-reassign
      item.found = found;
    },
    values(values, value, searchArgument) {
      if (Object.prototype.hasOwnProperty.call(values, value)) {
        const text = toString(values[value]).toLowerCase();

        if (fuzzy(text, searchArgument, opts)) {
          return true;
        }
      }
      return false;
    },
  };

  events.bind(
    list.listContainer.getElementsByClassName(opts.searchClass),
    "keyup",
    events.debounce((e) => {
      list.search(e.target.value, fuzzySearch.search);
    }, list.searchDelay)
  );

  return (str, columns) => {
    list.search(str, columns, fuzzySearch.search);
  };
};
