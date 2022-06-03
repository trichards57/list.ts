/* eslint-disable no-param-reassign */
const toString = require("./utils/to-string");
const events = require("./utils/events");

module.exports = (list) => {
  let columns;
  let searchString;
  let customSearch;

  const prepare = {
    resetList() {
      list.i = 1;
      list.templater.clear();
      customSearch = undefined;
    },
    setOptions(args) {
      if (args.length === 2 && args[1] instanceof Array) {
        [, columns] = args;
      } else if (args.length === 2 && typeof args[1] === "function") {
        columns = undefined;
        [, customSearch] = args;
      } else if (args.length === 3) {
        [, columns, customSearch] = args;
      } else {
        columns = undefined;
      }
    },
    setColumns() {
      if (list.items.length === 0) return;
      if (columns === undefined) {
        columns = list.searchColumns === undefined ? Object.keys(list.items[0].values()) : list.searchColumns;
      }
    },
    setSearchString(s) {
      s = toString(s).toLowerCase();
      s = s.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&"); // Escape regular expression characters
      searchString = s;
    },
  };
  const search = {
    list() {
      // Extract quoted phrases "word1 word2" from original searchString
      // searchString is converted to lowercase by List.js
      let words = [];
      let phrase;
      let ss = searchString;
      while ((phrase = ss.match(/"([^"]+)"/)) !== null) {
        words.push(phrase[1]);
        ss = ss.substring(0, phrase.index) + ss.substring(phrase.index + phrase[0].length);
      }
      // Get remaining space-separated words (if any)
      ss = ss.trim();
      if (ss.length) words = words.concat(ss.split(/\s+/));
      let wordFound = false;
      for (let k = 0; k < list.items.length; k += 1) {
        const item = list.items[k];
        item.found = false;
        if (!words.length) continue;
        for (let i = 0; i < words.length; i += 1) {
          wordFound = false;
          for (let j = 0; j < columns.length; j += 1) {
            const values = item.values();
            const column = columns[j];
            if (
              Object.prototype.hasOwnProperty.call(values, column) &&
              values[column] !== undefined &&
              values[column] !== null
            ) {
              const text = typeof values[column] !== "string" ? values[column].toString() : values[column];
              if (text.toLowerCase().indexOf(words[i]) !== -1) {
                // word found, so no need to check it against any other columns
                wordFound = true;
                break;
              }
            }
          }
          // this word not found? no need to check any other words, the item cannot match
          if (!wordFound) break;
        }
        item.found = wordFound;
      }
    },
    // Removed search.item() and search.values()
    reset() {
      list.resetSearch();
      list.searched = false;
    },
  };

  const searchMethod = (str, ...rest) => {
    list.trigger("searchStart");

    prepare.resetList();
    prepare.setSearchString(str);
    prepare.setOptions([str, ...rest]);
    prepare.setColumns();

    if (searchString === "") {
      search.reset();
    } else {
      list.searched = true;
      if (customSearch) {
        customSearch(searchString, columns);
      } else {
        search.list();
      }
    }

    list.update();
    list.trigger("searchComplete");
    return list.visibleItems;
  };

  list.handlers.searchStart = list.handlers.searchStart || [];
  list.handlers.searchComplete = list.handlers.searchComplete || [];

  events.bind(
    list.listContainer.getElementsByClassName(list.searchClass),
    "keyup",
    events.debounce((e) => {
      const alreadyCleared = e.target.value === "" && !list.searched;
      if (!alreadyCleared) {
        // If oninput already have resetted the list, do nothing
        searchMethod(e.target.value);
      }
    }, list.searchDelay)
  );

  // Used to detect click on HTML5 clear button
  events.bind(list.listContainer.getElementsByClassName(list.searchClass), "input", (e) => {
    if (e.target.value === "") {
      searchMethod("");
    }
  });

  return searchMethod;
};
