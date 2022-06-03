const Item = require("./item");

function getChildren(parent) {
  const nodes = parent.childNodes;
  const items = [];

  for (let i = 0; i < nodes.length; i += 1) {
    // Only textnodes have a data attribute
    if (nodes[i].data === undefined) {
      items.push(nodes[i]);
    }
  }
  return items;
}

function parse(list, itemElements, valueNames) {
  for (let i = 0; i < itemElements.length; i += 1) {
    const item = new Item(valueNames, itemElements[i]);
    const values = list.templater.get(item, valueNames);
    item.values(values);
    list.items.push(item);
  }
}

function parseAsync(list, itemElements, valueNames) {
  const itemsToIndex = itemElements.splice(0, 50); // TODO: If < 100 items, what happens in IE etc?
  parse(list, itemsToIndex, valueNames);
  if (itemElements.length > 0) {
    setTimeout(() => {
      parseAsync(list, itemElements, valueNames);
    }, 1);
  } else {
    list.update();
    list.trigger("parseComplete");
  }
}

module.exports = (list) => {
  const itemsToIndex = getChildren(list.list);
  const { valueNames } = list;

  if (list.indexAsync) {
    parseAsync(list, itemsToIndex, valueNames);
  } else {
    parse(list, itemsToIndex, valueNames);
  }
};
