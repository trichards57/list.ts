const getItem = require("./item");

module.exports = (list) => {
  const Item = getItem(list);

  const getChildren = (parent) => {
    const nodes = parent.childNodes;
    const items = [];

    for (let i = 0; i < nodes.length; i += 1) {
      // Only textnodes have a data attribute
      if (nodes[i].data === undefined) {
        items.push(nodes[i]);
      }
    }
    return items;
  };

  const parse = (itemElements, valueNames) => {
    for (let i = 0; i < itemElements.length; i += 1) {
      list.items.push(new Item(valueNames, itemElements[i]));
    }
  };

  const parseAsync = (itemElements, valueNames) => {
    const itemsToIndex = itemElements.splice(0, 50); // TODO: If < 100 items, what happens in IE etc?
    parse(itemsToIndex, valueNames);
    if (itemElements.length > 0) {
      setTimeout(() => {
        parseAsync(itemElements, valueNames);
      }, 1);
    } else {
      list.update();
      list.trigger("parseComplete");
    }
  };

  // eslint-disable-next-line no-param-reassign
  list.handlers.parseComplete = list.handlers.parseComplete || [];

  return () => {
    const itemsToIndex = getChildren(list.list);
    const { valueNames } = list;

    if (list.indexAsync) {
      parseAsync(itemsToIndex, valueNames);
    } else {
      parse(itemsToIndex, valueNames);
    }
  };
};
