const fixture = require("./fixtures");

describe("Off", () => {
  let list;

  beforeAll(() => {
    list = fixture.list(["name", "born"], fixture.all);
  });

  afterAll(() => {
    fixture.removeList();
  });

  describe("General", () => {
    it("should be remove added handler", (done) => {
      function updated(l) {
        expect(l.handlers.updated.length).toEqual(1);
        l.off("updated", updated);
        expect(l.handlers.updated.length).toEqual(0);
        done();
      }
      list.on("updated", updated);
      list.search("jonny");
    });

    it("should not remove unnamed handlers", (done) => {
      function searchComplete(l) {
        expect(l.handlers.searchComplete.length).toEqual(3);
        l.off("searchComplete", () => {});
        l.off("searchComplete", searchComplete);
        expect(l.handlers.searchComplete.length).toEqual(2);
        done();
      }
      list.on("searchComplete", () => {});
      list.on("searchComplete", searchComplete);
      list.on("searchComplete", () => {});
      list.search("jonny");
    });
  });
});
