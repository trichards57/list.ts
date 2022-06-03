const fixture = require("./fixtures");

describe("Add, get, remove", () => {
  let list;

  beforeAll(() => {
    list = fixture.list(["name"], [{ name: "Jonny" }]);
  });

  afterAll(() => {
    fixture.removeList();
  });

  afterEach(() => {
    list.clear();
    list.add({ name: "Jonny" });
  });

  describe("Add", () => {
    it("should add one item", () => {
      list.add({ name: "Jonas" });
      expect(list.items.length).toEqual(2);
    });
    it("should add two items", () => {
      list.add([{ name: "Martina" }, { name: "Angelica" }]);
      expect(list.items.length).toEqual(3);
    });
    it("should add async items", (done) => {
      const itemsToAdd = [
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
        { name: "Sven" },
      ];
      list.add(itemsToAdd, (items) => {
        expect(list.items.length).toEqual(91);
        expect(items.length).toEqual(90);
        expect(itemsToAdd.length).toEqual(90);
        done();
      });
    });
    it("should add async items to empty list", (done) => {
      list.clear();
      list.add([{ name: "Sven" }], () => {
        expect(list.items.length).toEqual(1);
        done();
      });
    });
  });

  describe("Get", () => {
    it("should return array with one item", () => {
      const items = list.get("name", "Jonny");
      expect(items[0].values().name).toEqual("Jonny");
    });
    it("should return empty array", () => {
      const items = list.get("name", "jonny");
      expect(items.length).toBe(0);
    });
    it("should return two items", () => {
      list.add({ name: "Jonny" });
      const items = list.get("name", "Jonny");
      expect(items.length).toEqual(2);
      expect(items[0].values().name).toEqual("Jonny");
      expect(items[1].values().name).toEqual("Jonny");
    });
  });

  describe("Remove", () => {
    it("should remove one item", () => {
      list.add({ name: "Jonas" });
      expect(list.items.length).toEqual(2);
      const count = list.remove("name", "Jonas");
      expect(count).toEqual(1);
      expect(list.items.length).toEqual(1);
    });
    it("should not remove anything due to case sensitivity", () => {
      const count = list.remove("name", "jonny");
      expect(count).toBe(0);
      expect(list.items.length).toEqual(1);
    });

    it("should avoid node not found error", () => {
      const item = list.get("name", "Jonny")[0];
      list.list.removeChild(item.elm);
      const count = list.remove("name", "Jonny");
      expect(count).toBe(1);
      expect(list.items.length).toEqual(0);
    });

    it("should remove eight items", () => {
      list.add({ name: "Jonny" });
      list.add({ name: "Jonny" });
      list.add({ name: "Sven" });
      list.add({ name: "Jonny" });
      list.add({ name: "Jonny" });
      list.add({ name: "Jonny" });
      list.add({ name: "Jonas" });
      list.add({ name: "Jonny" });
      list.add({ name: "Jonny" });
      expect(list.items.length).toEqual(10);
      const count = list.remove("name", "Jonny");
      expect(count).toEqual(8);
      expect(list.items.length).toEqual(2);
    });
  });
});
