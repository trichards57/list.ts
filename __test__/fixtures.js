const $ = require("jquery");
const List = require("../src/index");

const fixture = {
  list(valueNames, items) {
    const listHtml = $('<div id="list"><ul class="list"></ul></div>');
    let item = "";

    item = "<li>";
    for (let i = 0; i < valueNames.length; i += 1) {
      item += `<span class="${valueNames[i]}"</span>`;
    }
    item += "</li>";

    $(document.body).append(listHtml);

    return new List(
      "list",
      {
        valueNames,
        item,
      },
      items || []
    );
  },
  removeList() {
    $("#list").remove();
  },
  jonny: {
    name: "Jonny Strömberg",
    born: "1986",
  },
  martina: {
    name: "Martina Elm",
    born: "1986",
  },
  angelica: {
    name: "Angelica Abraham",
    born: "1986",
  },
  sebastian: {
    name: "Sebastian Höglund",
    born: "1989",
  },
  imma: {
    name: "Imma Grafström",
    born: "1953",
  },
  hasse: {
    name: "Hasse Strömberg",
    born: "1955",
  },
};
fixture.all = [fixture.jonny, fixture.martina, fixture.angelica, fixture.sebastian, fixture.imma, fixture.hasse];

module.exports = fixture;
