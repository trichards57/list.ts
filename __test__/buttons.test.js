const $ = require("jquery");
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

// http://stackoverflow.com/questions/5658849/whats-the-equivalent-of-jquerys-trigger-method-without-jquery
function fireClick(el) {
  let evt;
  if (document.createEvent) {
    evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
  }
  evt ? el.dispatchEvent(evt) : el.click && el.click();
}

describe("Button", () => {
  let list;

  beforeEach(() => {
    $("body").append(
      $(
        // eslint-disable-next-line no-multi-str
        '<div id="parse-list">\
      <input class="search" />\
      <span class="sort" id="sort-name" data-sort="name">Sort name</span>\
      <span class="sort" id="sort-name-asc" data-sort="name" data-order="asc">Sort name asc</span>\
      <span class="sort" id="sort-name-desc" data-sort="name" data-order="desc">Sort name desc</span>\
      <div class="list">\
        <div><span class="name">Jonny</span><span class="born">1986</span></div>\
        <div><span class="name">Jocke</span><span class="born">1985</span></div>\
      </div>\
    </div>'
      )
    );

    list = new List("parse-list", {
      valueNames: ["name", "born"],
    });
  });

  afterEach(() => {
    $("#parse-list").remove();
  });

  describe("Sort", () => {
    it("should trigger sortStart", (done) => {
      list.on("sortComplete", () => {
        done();
      });
      fireClick($("#sort-name")[0]);
    });
    it("should trigger sortComplete", (done) => {
      list.on("sortComplete", () => {
        done();
      });
      fireClick($("#sort-name")[0]);
    });

    it("should switch sorting order when clicking multiple times", (done) => {
      let sortRun = 0;
      list.on("sortComplete", () => {
        sortRun += 1;
        if (sortRun === 1) {
          expect($("#sort-name").hasClass("asc")).toBe(true);
          expect($("#sort-name").hasClass("desc")).toBe(false);
          setTimeout(() => {
            fireClick($("#sort-name")[0]);
          }, 50);
        } else if (sortRun === 2) {
          expect($("#sort-name").hasClass("asc")).toBe(false);
          expect($("#sort-name").hasClass("desc")).toBe(true);
          setTimeout(() => {
            fireClick($("#sort-name")[0]);
          }, 50);
        } else if (sortRun === 3) {
          expect($("#sort-name").hasClass("asc")).toBe(true);
          expect($("#sort-name").hasClass("desc")).toBe(false);
          done();
        }
      });
      expect($("#sort-name").hasClass("asc")).toBe(false);
      expect($("#sort-name").hasClass("desc")).toBe(false);
      fireClick($("#sort-name")[0]);
    });

    it("should sort with predefined order", (done) => {
      let sortRun = 0;
      list.on("sortComplete", () => {
        sortRun += 1;
        if (sortRun === 1) {
          expect($("#sort-name").hasClass("asc")).toBe(true);
          expect($("#sort-name").hasClass("desc")).toBe(false);
          expect($("#sort-name-asc").hasClass("asc")).toBe(true);
          expect($("#sort-name-asc").hasClass("desc")).toBe(false);
          expect($("#sort-name-desc").hasClass("asc")).toBe(false);
          expect($("#sort-name-desc").hasClass("desc")).toBe(false);
          setTimeout(() => {
            fireClick($("#sort-name-asc")[0]);
          }, 50);
        } else if (sortRun === 2) {
          expect($("#sort-name").hasClass("asc")).toBe(true);
          expect($("#sort-name").hasClass("desc")).toBe(false);
          expect($("#sort-name-asc").hasClass("asc")).toBe(true);
          expect($("#sort-name-asc").hasClass("desc")).toBe(false);
          expect($("#sort-name-desc").hasClass("asc")).toBe(false);
          expect($("#sort-name-desc").hasClass("desc")).toBe(false);
          setTimeout(() => {
            fireClick($("#sort-name-asc")[0]);
          }, 50);
        } else if (sortRun === 3) {
          expect($("#sort-name").hasClass("asc")).toBe(true);
          expect($("#sort-name").hasClass("desc")).toBe(false);
          expect($("#sort-name-asc").hasClass("asc")).toBe(true);
          expect($("#sort-name-asc").hasClass("desc")).toBe(false);
          expect($("#sort-name-desc").hasClass("asc")).toBe(false);
          expect($("#sort-name-desc").hasClass("desc")).toBe(false);
          setTimeout(() => {
            fireClick($("#sort-name-desc")[0]);
          }, 50);
        } else if (sortRun === 4) {
          expect($("#sort-name").hasClass("asc")).toBe(false);
          expect($("#sort-name").hasClass("desc")).toBe(true);
          expect($("#sort-name-asc").hasClass("asc")).toBe(false);
          expect($("#sort-name-asc").hasClass("desc")).toBe(false);
          expect($("#sort-name-desc").hasClass("asc")).toBe(false);
          expect($("#sort-name-desc").hasClass("desc")).toBe(true);
          setTimeout(() => {
            fireClick($("#sort-name-desc")[0]);
          }, 50);
        } else if (sortRun === 5) {
          expect($("#sort-name").hasClass("asc")).toBe(false);
          expect($("#sort-name").hasClass("desc")).toBe(true);
          expect($("#sort-name-asc").hasClass("asc")).toBe(false);
          expect($("#sort-name-asc").hasClass("desc")).toBe(false);
          expect($("#sort-name-desc").hasClass("asc")).toBe(false);
          expect($("#sort-name-desc").hasClass("desc")).toBe(true);
          done();
        }
      });
      expect($("#sort-name").hasClass("asc")).toBe(false);
      expect($("#sort-name").hasClass("desc")).toBe(false);
      expect($("#sort-name-asc").hasClass("asc")).toBe(false);
      expect($("#sort-name-asc").hasClass("desc")).toBe(false);
      expect($("#sort-name-desc").hasClass("asc")).toBe(false);
      expect($("#sort-name-desc").hasClass("desc")).toBe(false);
      fireClick($("#sort-name-asc")[0]);
    });

    it("buttons should change class when sorting programmatically", (done) => {
      list.on("sortComplete", () => {
        expect($("#sort-name").hasClass("asc")).toBe(true);
        expect($("#sort-name").hasClass("desc")).toBe(false);
        expect($("#sort-name-asc").hasClass("asc")).toBe(true);
        expect($("#sort-name-asc").hasClass("desc")).toBe(false);
        expect($("#sort-name-desc").hasClass("asc")).toBe(false);
        expect($("#sort-name-desc").hasClass("desc")).toBe(false);
        done();
      });
      list.sort("name", { order: "asc" });
    });
  });

  describe("Search", () => {
    it("should trigger searchStart", (done) => {
      list.on("searchStart", () => {
        done();
      });
      $("#parse-list .search").val("jon");
      fireKeyup($("#parse-list .search")[0]);
    });
    it("should trigger searchComplete", (done) => {
      list.on("searchComplete", () => {
        done();
      });
      $("#parse-list .search").val("jon");
      fireKeyup($("#parse-list .search")[0]);
    });
  });
});
