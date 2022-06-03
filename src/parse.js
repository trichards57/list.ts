const Item = require("./item");

function parse(list, itemElements, valueNames) {
  list.items = list.items.concat(
    itemElements.map((i) => {
      const item = new Item(valueNames, i);
      const values = list.templater.get(item, valueNames);
      item.values(values);
      return item;
    })
  );
}

function parseAsync(list, itemElements, valueNames) {
  const itemsToIndex = itemElements.splice(0, 50);
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
  const itemsToIndex = Array.from(list.list.childNodes).filter((n) => n.data === undefined);
  const { valueNames } = list;

  if (list.indexAsync) {
    parseAsync(list, itemsToIndex, valueNames);
  } else {
    parse(list, itemsToIndex, valueNames);
  }
};
