const fixture = require("./fixtures");

describe("Search and filter", function () {
  var list, jonny, martina, angelica, sebastian, imma, hasse;

  beforeAll(function () {
    list = fixture.list(["name", "born"], fixture.all);

    jonny = list.get("name", "Jonny Strömberg")[0];
    martina = list.get("name", "Martina Elm")[0];
    angelica = list.get("name", "Angelica Abraham")[0];
    sebastian = list.get("name", "Sebastian Höglund")[0];
    imma = list.get("name", "Imma Grafström")[0];
    hasse = list.get("name", "Hasse Strömberg")[0];
  });

  afterAll(function () {
    fixture.removeList();
  });

  afterEach(function () {
    list.search();
    list.filter();
  });

  describe("Search with filter", function () {
    it("should find everyone born 1986", function () {
      list.filter(function (item) {
        return item.values().born == "1986";
      });
      expect(list.matchingItems.length).toEqual(3);
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(true);
      expect(list.itemMatches(angelica)).toBe(true);
      expect(list.itemMatches(sebastian)).toBe(false);
      expect(list.itemMatches(imma)).toBe(false);
      expect(list.itemMatches(hasse)).toBe(false);
    });
    it('should find everyone born 1986 and containes "ö"', function () {
      list.filter(function (item) {
        return item.values().born == "1986";
      });
      list.search("ö");
      expect(list.matchingItems.length).toEqual(1);
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(false);
      expect(list.itemMatches(angelica)).toBe(false);
      expect(list.itemMatches(sebastian)).toBe(false);
      expect(list.itemMatches(imma)).toBe(false);
      expect(list.itemMatches(hasse)).toBe(false);
    });
    it('should find everyone with a "ö"', function () {
      list.filter(function (item) {
        return item.values().born == "1986";
      });
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
