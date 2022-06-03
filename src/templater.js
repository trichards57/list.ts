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

function createCleanTemplateItem(templateNode, valueNames) {
  const el = templateNode.cloneNode(true);
  el.removeAttribute("id");

  for (let i = 0; i < valueNames.length; i += 1) {
    let elm;
    const valueName = valueNames[i];
    if (valueName.data) {
      for (let j = 0; j < valueName.data.length; j += 1) {
        el.dataset[valueName.data[j]] = "";
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

function getFirstListItem(nodes) {
  for (let i = 0; i < nodes.length; i += 1) {
    // Only textnodes have a data attribute
    if (nodes[i].data === undefined) {
      return nodes[i].cloneNode(true);
    }
  }
  return undefined;
}

module.exports = class Templater {
  constructor(list) {
    this.list = list;

    let itemSource;

    if (typeof list.item === "function") {
      this.createItem = (values) => {
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
      itemSource = getFirstListItem(list.list.childNodes);
    }

    if (!itemSource) {
      throw new Error("The list needs to have at least one item on init otherwise you'll have to add a template.");
    }

    itemSource = createCleanTemplateItem(itemSource, list.valueNames);

    this.createItem = () => itemSource.cloneNode(true);
  }

  set(item, values) {
    if (!this.create(item)) {
      Object.keys(values).forEach((key) => this.setValue(item, key, values[key]));
    }
  }

  setValue(item, name, value) {
    let elm;
    const valueName = this.getValueName(name);
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

  getValueName(name) {
    for (let i = 0; i < this.list.valueNames.length; i += 1) {
      const valueName = this.list.valueNames[i];
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

  get(item, valueNames) {
    this.create(item);
    const values = {};
    for (let i = 0; i < valueNames.length; i += 1) {
      let elm;
      const valueName = valueNames[i];
      if (valueName.data) {
        for (let j = 0; j < valueName.data.length; j += 1) {
          values[valueName.data[j]] = item.elm.dataset[valueName.data[j]];
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
  }

  clear() {
    if (this.list.list.hasChildNodes()) {
      while (this.list.list.childNodes.length >= 1) {
        this.list.list.removeChild(this.list.list.firstChild);
      }
    }
  }

  hide(item) {
    if (item.elm !== undefined && item.elm.parentNode === this.list.list) {
      this.list.list.removeChild(item.elm);
    }
  }

  show(item) {
    this.create(item);
    this.list.list.appendChild(item.elm);
  }

  remove(item) {
    if (item.elm.parentNode === this.list.list) {
      this.list.list.removeChild(item.elm);
    }
  }

  create(item) {
    if (item.elm !== undefined) {
      return false;
    }
    // eslint-disable-next-line no-param-reassign
    item.elm = this.createItem(item.values());
    this.set(item, item.values());
    return true;
  }
};
