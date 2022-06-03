const fixture = require("./fixtures");

describe("Show", () => {
  let list;
  let a;
  let b;
  let c;
  let d;
  let e;
  let f;

  beforeAll(() => {
    list = fixture.list(
      ["id", "id2"],
      [
        { id: "1", id2: "a" },
        { id: "2", id2: "a" },
        { id: "3", id2: "b" },
        { id: "4", id2: "b" },
        { id: "5", id2: "bc" },
        { id: "6", id2: "bc" },
      ]
    );
    [a] = list.get("id", "1");
    [b] = list.get("id", "2");
    [c] = list.get("id", "3");
    [d] = list.get("id", "4");
    [e] = list.get("id", "5");
    [f] = list.get("id", "6");
  });

  afterAll(() => {
    fixture.removeList();
  });

  afterEach(() => {
    list.filter();
    list.show(1, 200);
  });

  describe("Basics", () => {
    it("should be 1, 2", () => {
      list.show(1, 2);
      expect(list.visibleItems.length).toEqual(2);
      expect(list.itemVisible(a)).toBe(true);
      expect(list.itemVisible(b)).toBe(true);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(false);
      expect(list.itemVisible(e)).toBe(false);
      expect(list.itemVisible(f)).toBe(false);
    });
    it("should show item 6", () => {
      list.show(6, 2);
      expect(list.visibleItems.length).toEqual(1);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(false);
      expect(list.itemVisible(e)).toBe(false);
      expect(list.itemVisible(f)).toBe(true);
    });
    it("should show item 1, 2, 3, 4, 5, 6", () => {
      list.show(1, 200);
      expect(list.visibleItems.length).toEqual(6);
      expect(list.itemVisible(a)).toBe(true);
      expect(list.itemVisible(b)).toBe(true);
      expect(list.itemVisible(c)).toBe(true);
      expect(list.itemVisible(d)).toBe(true);
      expect(list.itemVisible(e)).toBe(true);
      expect(list.itemVisible(f)).toBe(true);
    });
    it("should show item 3, 4, 5", () => {
      list.show(3, 3);
      expect(list.visibleItems.length).toEqual(3);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(true);
      expect(list.itemVisible(d)).toBe(true);
      expect(list.itemVisible(e)).toBe(true);
      expect(list.itemVisible(f)).toBe(false);
    });
    it("should show item 5, 6", () => {
      list.show(5, 3);
      expect(list.visibleItems.length).toEqual(2);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(false);
      expect(list.itemVisible(e)).toBe(true);
      expect(list.itemVisible(f)).toBe(true);
    });
  });

  describe("Search", () => {
    afterEach(() => {
      list.search();
    });
    it("should show 3, 4", () => {
      list.search("b");
      list.show(1, 2);
      expect(list.visibleItems.length).toEqual(2);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(true);
      expect(list.itemVisible(d)).toBe(true);
      expect(list.itemVisible(e)).toBe(false);
      expect(list.itemVisible(f)).toBe(false);
    });
    it("should show item 3,4,5,6", () => {
      list.search("b");
      list.show(1, 4);
      expect(list.visibleItems.length).toEqual(4);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(true);
      expect(list.itemVisible(d)).toBe(true);
      expect(list.itemVisible(e)).toBe(true);
      expect(list.itemVisible(f)).toBe(true);
    });
    it("should not show any items but match two", () => {
      list.search("a");
      list.show(3, 2);
      expect(list.visibleItems.length).toEqual(0);
      expect(list.matchingItems.length).toEqual(2);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(false);
      expect(list.itemVisible(e)).toBe(false);
      expect(list.itemVisible(f)).toBe(false);
    });
  });

  describe("Filter", () => {
    afterEach(() => {
      list.filter();
    });
    it("should show 3, 4", () => {
      list.filter((item) => item.values().id2 === "b");
      list.show(1, 2);
      expect(list.visibleItems.length).toEqual(2);
      expect(list.matchingItems.length).toEqual(2);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(true);
      expect(list.itemVisible(d)).toBe(true);
      expect(list.itemVisible(e)).toBe(false);
      expect(list.itemVisible(f)).toBe(false);
    });
    it("should show item 3,4,5,6", () => {
      list.filter((item) => item.values().id2 === "bc");
      list.show(1, 4);
      expect(list.visibleItems.length).toEqual(2);
      expect(list.matchingItems.length).toEqual(2);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(false);
      expect(list.itemVisible(e)).toBe(true);
      expect(list.itemVisible(f)).toBe(true);
    });
    it("should not show any items but match two", () => {
      list.filter((item) => item.values().id2 === "b");
      list.show(3, 2);
      expect(list.visibleItems.length).toEqual(0);
      expect(list.matchingItems.length).toEqual(2);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(false);
      expect(list.itemVisible(e)).toBe(false);
      expect(list.itemVisible(f)).toBe(false);
    });
  });

  describe("Filter and search", () => {
    afterEach(() => {
      list.filter();
    });
    it("should show 4, 5", () => {
      list.show(1, 2);
      list.filter((item) => item.values().id > "3");
      list.search("b");
      expect(list.visibleItems.length).toEqual(2);
      expect(list.matchingItems.length).toEqual(3);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(true);
      expect(list.itemVisible(e)).toBe(true);
      expect(list.itemVisible(f)).toBe(false);
    });
    it("should show 5, 6", () => {
      list.show(1, 2);
      list.filter((item) => item.values().id > "3");
      list.search("b");
      list.show(2, 2);
      expect(list.visibleItems.length).toEqual(2);
      expect(list.matchingItems.length).toEqual(3);
      expect(list.itemVisible(a)).toBe(false);
      expect(list.itemVisible(b)).toBe(false);
      expect(list.itemVisible(c)).toBe(false);
      expect(list.itemVisible(d)).toBe(false);
      expect(list.itemVisible(e)).toBe(true);
      expect(list.itemVisible(f)).toBe(true);
    });
  });
});
