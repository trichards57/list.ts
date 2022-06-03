const fixture = require("./fixtures");

describe("Filter", () => {
  let list;
  let jonny;
  let martina;
  let angelica;
  let sebastian;
  let imma;
  let hasse;

  beforeAll(() => {
    list = fixture.list(["name", "born"], fixture.all);
    [jonny] = list.get("name", "Jonny Strömberg");
    [martina] = list.get("name", "Martina Elm");
    [angelica] = list.get("name", "Angelica Abraham");
    [sebastian] = list.get("name", "Sebastian Höglund");
    [imma] = list.get("name", "Imma Grafström");
    [hasse] = list.get("name", "Hasse Strömberg");
  });

  afterAll(() => {
    fixture.removeList();
  });

  afterEach(() => {
    list.filter();
    list.show(1, 200);
  });

  describe("Basics", () => {
    it("should return everyone born after 1988", () => {
      const result = list.filter((item) => parseInt(item.values().born, 10) > 1988);
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(sebastian);
    });
    it("should return everyone born 1986", () => {
      const result = list.filter((item) => parseInt(item.values().born, 10) === 1986);
      expect(result.length).toEqual(3);
      for (let i = 0; i < result.length; i += 1) {
        expect(result[i].values().born).toEqual("1986");
      }
    });
  });

  describe("Show and pages", () => {
    it("should return the visible items", () => {
      list.show(1, 2);
      const result = list.filter((item) => item.values().born > 1985);
      expect(result).toEqual(list.visibleItems);
    });

    it("should return be 2 visible items and 3 matching", () => {
      list.show(1, 2);
      const result = list.filter((item) => item.values().born > 1985);
      expect(result.length).toEqual(2);
      expect(list.visibleItems.length).toEqual(2);
      expect(list.matchingItems.length).toEqual(4);
    });

    describe("Specific items", () => {
      beforeEach(() => {
        list.show(1, 2);
        list.filter((item) => item.values().born > 1985);
      });
      it("should match jonny", () => {
        expect(list.itemMatches(jonny)).toBe(true);
        expect(jonny.filtered).toBe(true);
        expect(list.itemVisible(jonny)).toBe(true);
      });
      it("should match martina", () => {
        expect(list.itemMatches(martina)).toBe(true);
        expect(martina.filtered).toBe(true);
        expect(list.itemVisible(martina)).toBe(true);
      });
      it("should match but not show angelica", () => {
        expect(list.itemMatches(angelica)).toBe(true);
        expect(angelica.filtered).toBe(true);
        expect(list.itemVisible(angelica)).toBe(false);
      });
      it("should match but not show sebastian", () => {
        expect(list.itemMatches(sebastian)).toBe(true);
        expect(sebastian.filtered).toBe(true);
        expect(list.itemVisible(sebastian)).toBe(false);
      });
      it("should not match imma", () => {
        expect(list.itemMatches(imma)).toBe(false);
        expect(imma.filtered).toBe(false);
        expect(list.itemVisible(imma)).toBe(false);
      });
      it("should not match hasse", () => {
        expect(list.itemMatches(hasse)).toBe(false);
        expect(hasse.filtered).toBe(false);
        expect(list.itemVisible(hasse)).toBe(false);
      });
    });
  });
});
