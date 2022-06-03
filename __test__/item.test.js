const $ = require("jquery");
const fixture = require("./fixtures");

describe("Item", () => {
  let list;
  let item;

  beforeAll(() => {
    list = fixture.list(
      ["name", "born", "doin"],
      [
        {
          name: "Jonny",
          born: "1986",
          doin: "Living the dream",
        },
      ]
    );
    [item] = list.get("name", "Jonny");
  });

  beforeEach(() => {
    list.search();
    list.filter();
    list.show(1, 200);
  });

  afterAll(() => {
    fixture.removeList();
  });

  describe("Defaults", () => {
    it("should have all default attributes", () => {
      expect(item.found).toBe(false);
      expect(item.filtered).toBe(false);
    });

    it("should have the right elements", () => {
      expect(item.elm).toEqual($("#list li")[0]);
    });

    it("should have all default methods", () => {
      expect(item.values).toBeInstanceOf(Function);
    });
  });

  describe("Values()", () => {
    it("should have the right values", () => {
      expect(item.values()).toEqual({
        name: "Jonny",
        born: "1986",
        doin: "Living the dream",
      });
    });
    it("should be able to change one value", () => {
      expect(item.values().name).toBe("Jonny");
      item.values({ name: "Egon" });
      expect(item.values().name).toBe("Egon");
    });
    it("should be able to change many value", () => {
      expect(item.values()).toEqual({
        name: "Egon",
        born: "1986",
        doin: "Living the dream",
      });
      item.values({
        name: "Sven",
        born: "1801",
        doin: "Is dead",
      });
      expect(item.values()).toEqual({
        name: "Sven",
        born: "1801",
        doin: "Is dead",
      });
    });
  });

  describe("Matching, found, filtered", () => {
    describe("Searching", () => {
      it("should not be visible, match, found or filtered", () => {
        list.search("Fredrik");
        expect(item.found).toBe(false);
        expect(item.filtered).toBe(false);
      });
      it("should be visble, match and found but not filterd", () => {
        list.search("Sven");
        expect(item.found).toBe(true);
        expect(item.filtered).toBe(false);
      });
      it("reset: should be visible and matching but not found or filtered", () => {
        list.search();
        expect(item.found).toBe(false);
        expect(item.filtered).toBe(false);
      });
    });
    describe("Filtering", () => {
      it("should not be visble, match, found or filtered", () => {
        list.filter((i) => i.values().name === "Fredrik");
        expect(item.found).toBe(false);
        expect(item.filtered).toBe(false);
      });
      it("should be visble, match and filtered but not found", () => {
        list.filter((i) => i.values().name === "Sven");
        expect(item.found).toBe(false);
        expect(item.filtered).toBe(true);
      });
      it("reset: should be visble and match but not filtered or found", () => {
        list.filter();
        expect(item.found).toBe(false);
        expect(item.filtered).toBe(false);
      });
    });
  });

  fixture.removeList();
});
