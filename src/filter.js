/* eslint-disable no-param-reassign */

module.exports = (list) => {
  // Add handlers
  list.handlers.filterStart = list.handlers.filterStart || [];
  list.handlers.filterComplete = list.handlers.filterComplete || [];

  return (filterFunction) => {
    list.trigger("filterStart");
    list.i = 1; // Reset paging
    list.resetFilter();
    if (filterFunction === undefined) {
      list.filtered = false;
    } else {
      list.filtered = true;
      for (let i = 0; i < list.items.length; i += 1) {
        const item = list.items[i];
        if (filterFunction(item)) {
          item.filtered = true;
        } else {
          item.filtered = false;
        }
      }
    }
    list.update();
    list.trigger("filterComplete");
    return list.visibleItems;
  };
};
