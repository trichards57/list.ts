const fixture = require("./fixtures");

describe("Search", () => {
  let list;
  let jonny;
  let martina;
  let angelica;
  let sebastian;
  let imma;
  let hasse;

  beforeEach(() => {
    list = fixture.list(["name", "born"], fixture.all);

    [jonny] = list.get("name", "Jonny Strömberg");
    [martina] = list.get("name", "Martina Elm");
    [angelica] = list.get("name", "Angelica Abraham");
    [sebastian] = list.get("name", "Sebastian Höglund");
    [imma] = list.get("name", "Imma Grafström");
    [hasse] = list.get("name", "Hasse Strömberg");
  });

  afterEach(() => {
    fixture.removeList();
  });

  describe("Case-sensitive", () => {
    it("should not be case-sensitive", () => {
      const result = list.search("jonny");
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(jonny);
    });
  });

  describe("Number of results", () => {
    it("should find jonny, martina, angelice", () => {
      const result = list.search("1986");
      expect(result.length).toEqual(3); // 3!!
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(true);
      expect(list.itemMatches(angelica)).toBe(true);
      expect(list.itemMatches(sebastian)).toBe(false);
      expect(list.itemMatches(imma)).toBe(false);
      expect(list.itemMatches(hasse)).toBe(false);
    });
    it("should find all with utf-8 char ö", () => {
      const result = list.search("ö");
      expect(result.length).toEqual(4); // 4!!
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(false);
      expect(list.itemMatches(angelica)).toBe(false);
      expect(list.itemMatches(sebastian)).toBe(true);
      expect(list.itemMatches(imma)).toBe(true);
      expect(list.itemMatches(hasse)).toBe(true);
    });
    it("should not break with weird searches", () => {
      expect(() => {
        list.search(undefined);
      }).not.toThrow();
      expect(() => {
        list.search(null);
      }).not.toThrow();
      expect(() => {
        list.search(0);
      }).not.toThrow();
      expect(() => {
        list.search(() => {});
      }).not.toThrow();
      expect(() => {
        list.search({ foo: "bar" });
      }).not.toThrow();
    });
    it("should not break with weird values", () => {
      jonny.values({ name: undefined });
      martina.values({ name: null });
      angelica.values({ name: 0 });
      sebastian.values({ name() {} });
      imma.values({ name: { foo: "bar" } });

      expect(() => {
        list.search("jonny");
      }).not.toThrow();
      expect(() => {
        list.search(undefined);
      }).not.toThrow();
      expect(() => {
        list.search(null);
      }).not.toThrow();
      expect(() => {
        list.search(0);
      }).not.toThrow();
      expect(() => {
        list.search(() => {});
      }).not.toThrow();
      expect(() => {
        list.search({ foo: "bar" });
      }).not.toThrow();
    });
  });

  describe("Default search columns", () => {
    it("should find in the default match column", () => {
      list.searchColumns = ["name"];
      const result = list.search("jonny");
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(jonny);
    });
    it("should not find in the default match column", () => {
      list.searchColumns = ["born"];
      const result = list.search("jonny");
      expect(result.length).toEqual(0);
    });
  });

  describe("Specific columns", () => {
    it("should find match in column", () => {
      const result = list.search("jonny", ["name"]);
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(jonny);
    });
    it("should not find match in column", () => {
      const result = list.search("jonny", ["born"]);
      expect(result.length).toEqual(0);
    });
    it("should find match in column", () => {
      const result = list.search("jonny", ["name"]);
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(jonny);
    });
    it("should not find match in column", () => {
      const result = list.search("jonny", ["born"]);
      expect(result.length).toEqual(0);
    });
    it("should work with columns that do not exist", () => {
      const result = list.search("jonny", ["pet"]);
      expect(result.length).toEqual(0);
    });
    it("should remove column option", () => {
      let result = list.search("jonny", ["born"]);
      expect(result.length).toEqual(0);
      result = list.search("jonny");
      expect(result.length).toEqual(1);
    });
  });

  describe("Custom search function", () => {
    const customSearchFunction = () => {
      for (let k = 0, kl = list.items.length; k < kl; k += 1) {
        if (list.items[k].values().born > 1985) {
          list.items[k].found = true;
        }
      }
    };
    it("should use custom function in third argument", () => {
      const result = list.search("jonny", ["name"], customSearchFunction);
      expect(result.length).toEqual(4);
    });
    it("should use custom function in second argument", () => {
      const result = list.search("jonny", customSearchFunction);
      expect(result.length).toEqual(4);
    });
  });

  describe("Multiple word search", () => {
    it("should find jonny, hasse", () => {
      const result = list.search("berg str");
      expect(result.length).toEqual(2);
      expect(list.itemMatches(jonny)).toBe(true);
      expect(list.itemMatches(martina)).toBe(false);
      expect(list.itemMatches(angelica)).toBe(false);
      expect(list.itemMatches(sebastian)).toBe(false);
      expect(list.itemMatches(imma)).toBe(false);
      expect(list.itemMatches(hasse)).toBe(true);
    });
    it("should find martina, angelica, sebastian, hasse", () => {
      const result = list.search("a e");
      expect(result.length).toEqual(4);
      expect(list.itemMatches(jonny)).toBe(false);
      expect(list.itemMatches(martina)).toBe(true);
      expect(list.itemMatches(angelica)).toBe(true);
      expect(list.itemMatches(sebastian)).toBe(true);
      expect(list.itemMatches(imma)).toBe(false);
      expect(list.itemMatches(hasse)).toBe(true);
    });
    it("stripping whitespace should find martina", () => {
      const result = list.search("martina  elm ");
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(martina);
    });
  });

  describe("Quoted phrase searches", () => {
    it("should find martina", () => {
      const result = list.search('"a e"');
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(martina);
    });
    it("quoted phrase and multiple words should find jonny", () => {
      const result = list.search('" str" 1986');
      expect(result.length).toEqual(1);
      expect(result[0]).toEqual(jonny);
    });
  });

  //
  // describe('Special characters', function() {
  //   it('should escape and handle special characters', function() {
  //     list.add([
  //       { name: 'Jonny&Jabba' },
  //       { name: '<Leia' },
  //       { name: '>Luke' },
  //       { name: '"Chewie"' },
  //       { name: "'Ewok'" }
  //     ]);
  //     var result = list.search('Leia');
  //     console.log(result);
  //     expect(result.length).toEqual(1);
  //     var result = list.search('<');
  //     console.log(result);
  //     expect(result.length).toEqual(1);
  //   });
  // });
});
