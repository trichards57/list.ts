const fixture = require("./fixtures");

describe("Search and filter", () => {
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
    list.search();
    list.filter();
  });

  describe("Search with filter", () => {
    it("should find everyone born 1986", () => {
      list.filter((item) => item.values().born === "1986");
      expect(list.matchingItems.length).toEqual(3);
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(true);
      expect(list.itemMatches(angelica)).toBe(true);
      expect(list.itemMatches(sebastian)).toBe(false);
      expect(list.itemMatches(imma)).toBe(false);
      expect(list.itemMatches(hasse)).toBe(false);
    });
    it('should find everyone born 1986 and containes "ö"', () => {
      list.filter((item) => item.values().born === "1986");
      list.search("ö");
      expect(list.matchingItems.length).toEqual(1);
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(false);
      expect(list.itemMatches(angelica)).toBe(false);
      expect(list.itemMatches(sebastian)).toBe(false);
      expect(list.itemMatches(imma)).toBe(false);
      expect(list.itemMatches(hasse)).toBe(false);
    });
    it('should find everyone with a "ö"', () => {
      list.filter((item) => item.values().born === "1986");
      list.search("ö");
      list.filter();
      expect(list.matchingItems.length).toEqual(4);
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(false);
      expect(list.itemMatches(angelica)).toBe(false);
      expect(list.itemMatches(sebastian)).toBe(true);
      expect(list.itemMatches(imma)).toBe(true);
      expect(list.itemMatches(hasse)).toBe(true);
    });
  });
});
