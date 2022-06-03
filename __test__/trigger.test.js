const fixture = require("./fixtures");

describe("Trigger", () => {
  let list;

  beforeAll(() => {
    list = fixture.list(["name", "born"], fixture.all);
  });

  afterAll(() => {
    fixture.removeList();
  });

  describe("General", () => {
    it("should be triggered by searchComplete", (done) => {
      list.on("searchComplete", () => {
        done();
      });
      list.trigger("searchComplete");
    });
  });
});
