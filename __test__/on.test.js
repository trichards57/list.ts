const fixture = require("./fixtures");

describe("On", () => {
  let list;

  beforeEach(() => {
    list = fixture.list(["name", "born"], fixture.all);
  });

  afterEach(() => {
    fixture.removeList();
  });

  describe("Updated", () => {
    it("should be triggered after search", (done) => {
      list.on("updated", () => {
        done();
      });
      list.search("jonny");
    });
    it("should be triggered after sort", (done) => {
      list.on("updated", () => {
        done();
      });
      list.sort("name");
    });
    it("should be triggered after filter", (done) => {
      list.on("updated", () => {
        done();
      });
      list.filter(() => true);
    });
    it("should be triggered after show", (done) => {
      list.on("updated", () => {
        done();
      });
      list.show(1, 10);
    });

    it("should be triggered after add", (done) => {
      list.on("updated", () => {
        done();
      });
      list.add({ name: "Hej" });
    });
    it("should be triggered after remove", (done) => {
      list.on("updated", () => {
        done();
      });
      list.remove("name", "Jonny");
    });
  });

  describe("Multiple handlers", () => {
    it("should be trigger both handlers", (done) => {
      let done1 = false;
      let done2 = false;
      function isDone() {
        if (done1 && done2) {
          done();
        }
      }

      list.on("updated", () => {
        done1 = true;
        isDone();
      });
      list.on("updated", () => {
        done2 = true;
        isDone();
      });
      list.search("jonny");
    });
  });

  describe("Search", () => {
    it("should be triggered before and after search", (done) => {
      let done1 = false;
      list.on("searchStart", () => {
        done1 = true;
      });
      list.on("searchComplete", () => {
        if (done1) {
          done();
        }
      });
      list.search("jonny");
    });
  });

  describe("Sort", () => {
    it("should be triggered before and after sort", (done) => {
      let done1 = false;
      list.on("sortStart", () => {
        done1 = true;
      });
      list.on("sortComplete", () => {
        if (done1) {
          done();
        }
      });
      list.sort("name");
    });
  });

  describe("Filter", () => {
    it("should be triggered before and after filter", (done) => {
      let done1 = false;
      list.on("filterStart", () => {
        done1 = true;
      });
      list.on("filterComplete", () => {
        if (done1) {
          done();
        }
      });
      list.filter(() => true);
    });
  });
});
