const Templater = function Templater(list) {
  let createItem;
  const templater = this;

  function getItemSource(itemHTML) {
    if (typeof itemHTML !== "string") return undefined;
    if (/<tr[\s>]/g.exec(itemHTML)) {
      const tbody = document.createElement("tbody");
      tbody.innerHTML = itemHTML;
      return tbody.firstElementChild;
    }
    if (itemHTML.indexOf("<") !== -1) {
      const div = document.createElement("div");
      div.innerHTML = itemHTML;
      return div.firstElementChild;
    }
    return undefined;
  }

  function getFirstListItem() {
    const nodes = list.list.childNodes;

    for (let i = 0; i < nodes.length; i += 1) {
      // Only textnodes have a data attribute
      if (nodes[i].data === undefined) {
        return nodes[i].cloneNode(true);
      }
    }
    return undefined;
  }

  function createCleanTemplateItem(templateNode, valueNames) {
    const el = templateNode.cloneNode(true);
    el.removeAttribute("id");

    for (let i = 0; i < valueNames.length; i += 1) {
      let elm;
      const valueName = valueNames[i];
      if (valueName.data) {
        for (let j = 0; j < valueName.data.length; j += 1) {
          el.setAttribute(`data-${valueName.data[j]}`, "");
        }
      } else if (valueName.attr && valueName.name) {
        [elm] = el.getElementsByClassName(valueName.name);
        if (elm) {
          elm.setAttribute(valueName.attr, "");
        }
      } else {
        [elm] = el.getElementsByClassName(valueName);
        if (elm) {
          elm.innerHTML = "";
        }
      }
    }
    return el;
  }

  function init() {
    let itemSource;

    if (typeof list.item === "function") {
      createItem = (values) => {
        const item = list.item(values);
        return getItemSource(item);
      };
      return;
    }

    if (typeof list.item === "string") {
      if (list.item.indexOf("<") === -1) {
        itemSource = document.getElementById(list.item);
      } else {
        itemSource = getItemSource(list.item);
      }
    } else {
      /* If item source does not exists, use the first item in list as
      source for new items */
      itemSource = getFirstListItem();
    }

    if (!itemSource) {
      throw new Error("The list needs to have at least one item on init otherwise you'll have to add a template.");
    }

    itemSource = createCleanTemplateItem(itemSource, list.valueNames);

    createItem = () => itemSource.cloneNode(true);
  }

  function getValueName(name) {
    for (let i = 0; i < list.valueNames.length; i += 1) {
      const valueName = list.valueNames[i];
      if (valueName.data) {
        const { data } = valueName;
        for (let j = 0; j < data.length; j += 1) {
          if (data[j] === name) {
            return { data: name };
          }
        }
      } else if (valueName.attr && valueName.name && valueName.name === name) {
        return valueName;
      } else if (valueName === name) {
        return name;
      }
    }
    return undefined;
  }

  function setValue(item, name, value) {
    let elm;
    const valueName = getValueName(name);
    if (!valueName) return;
    if (valueName.data) {
      item.elm.setAttribute(`data-${valueName.data}`, value);
    } else if (valueName.attr && valueName.name) {
      [elm] = item.elm.getElementsByClassName(valueName.name);
      if (elm) {
        elm.setAttribute(valueName.attr, value);
      }
    } else {
      [elm] = item.elm.getElementsByClassName(valueName);
      if (elm) {
        elm.innerHTML = value;
      }
    }
  }

  this.get = (item, valueNames) => {
    templater.create(item);
    const values = {};
    for (let i = 0; i < valueNames.length; i += 1) {
      let elm;
      const valueName = valueNames[i];
      if (valueName.data) {
        for (let j = 0; j < valueName.data.length; j += 1) {
          values[valueName.data[j]] = item.elm.getAttribute(`data-${valueName.data[j]}`);
        }
      } else if (valueName.attr && valueName.name) {
        [elm] = item.elm.getElementsByClassName(valueName.name);
        values[valueName.name] = elm ? elm.getAttribute(valueName.attr) : "";
      } else {
        [elm] = item.elm.getElementsByClassName(valueName);
        values[valueName] = elm ? elm.innerHTML : "";
      }
    }
    return values;
  };

  this.set = (item, values) => {
    if (!templater.create(item)) {
      const keys = Object.keys(values);

      for (let i = 0; i < keys.length; i += 1) {
        setValue(item, keys[i], values[keys[i]]);
      }
    }
  };

  this.create = (item) => {
    if (item.elm !== undefined) {
      return false;
    }
    // eslint-disable-next-line no-param-reassign
    item.elm = createItem(item.values());
    templater.set(item, item.values());
    return true;
  };

  this.remove = (item) => {
    if (item.elm.parentNode === list.list) {
      list.list.removeChild(item.elm);
    }
  };

  this.show = (item) => {
    templater.create(item);
    list.list.appendChild(item.elm);
  };

  this.hide = (item) => {
    if (item.elm !== undefined && item.elm.parentNode === list.list) {
      list.list.removeChild(item.elm);
    }
  };

  this.clear = () => {
    if (list.list.hasChildNodes()) {
      while (list.list.childNodes.length >= 1) {
        list.list.removeChild(list.list.firstChild);
      }
    }
  };

  init();
};

module.exports = (list) => new Templater(list);
