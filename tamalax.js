Ecwid.OnAPILoaded.add(function () {
  console.log("JS API is loaded");
  console.log("Ecwid store ID: " + Ecwid.getOwnerId());

  Ecwid.OnPageLoaded.add(function (page) {
    console.log("Page DOM is loaded");
    console.log("Page type is: " + page.type);
  });

  Ecwid.OnPageLoaded.add(function (page) {
    if (page.type == "PRODUCT") {
      console.log(
        `
       Page loaded!
       Ecwid store ID is: ${Ecwid.getOwnerId()}
       Product ID is: ${page.productId}
        `
      );
    }
  });
});
