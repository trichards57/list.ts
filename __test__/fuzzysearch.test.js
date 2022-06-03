const $ = require("jquery");
const fixtureFuzzysearch = require("./fixtures-fuzzysearch");
const List = require("../src/index");

function fireKeyup(el) {
  if (document.createEvent) {
    let evObj;
    if (window.KeyEvent) {
      evObj = document.createEvent("KeyEvents");
      evObj.initKeyEvent("keyup", true, true, window, false, false, false, false, 13, 0);
    } else {
      evObj = document.createEvent("UIEvents");
      evObj.initUIEvent("keyup", true, true, window, 1);
    }
    el.dispatchEvent(evObj);
  } else if (document.createEventObject) {
    el.fireEvent("onkeyup");
  } else {
    // IE 5.0, seriously? :)
  }
}

describe("Fuzzy Search", () => {
  let list;
  let itemHTML;

  beforeEach(() => {
    itemHTML = fixtureFuzzysearch.list(["name", "born"]);
    list = new List(
      "list-fuzzy-search",
      {
        valueNames: ["name", "born"],
        item: itemHTML,
      },
      fixtureFuzzysearch.all
    );
  });

  afterEach(() => {
    fixtureFuzzysearch.removeList();
  });

  it("should have default attribute", () => {
    expect(list.fuzzySearch).toBeInstanceOf(Function);
  });

  it("should find result", () => {
    list.fuzzySearch("guybrush");
    expect(list.matchingItems.length).toBe(1);
  });

  it("should find result", () => {
    list.fuzzySearch("g thre");
    expect(list.matchingItems.length).toBe(1);
  });

  it("should find result", () => {
    list.fuzzySearch("thre");
    expect(list.matchingItems.length).toBe(4);
  });

  describe("Search field", () => {
    it("should trigger searchStart", (done) => {
      list.on("searchStart", () => {
        done();
      });
      $("#list-fuzzy-search .fuzzy-search").val("angelica");
      fireKeyup($("#list-fuzzy-search .fuzzy-search")[0]);
    });

    it("should trigger searchComplete", (done) => {
      list.on("searchComplete", () => {
        done();
      });
      $("#list-fuzzy-search .fuzzy-search").val("angelica");
      fireKeyup($("#list-fuzzy-search .fuzzy-search")[0]);
    });
  });
});
