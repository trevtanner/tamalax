Ecwid.OnAPILoaded.add(function () {
  console.log("JS API is loaded");
  console.log("Ecwid store ID: " + Ecwid.getOwnerId());

  Ecwid.OnPageLoaded.add(function (page) {
    console.log("Page DOM is loaded");
    console.log("Page type is: " + page.type);
    if (page.type == "PRODUCT") {
      console.log(
        `
       Page loaded!
       Ecwid store ID is: ${Ecwid.getOwnerId()}
       Product ID is: ${page.productId}
       Trying to add new field to product page...
        `
      );

      // --- Create Your Custom Field ---
      // This is just standard JavaScript DOM manipulation.
      // You can create any HTML elements you want.
      const customContainer = document.createElement("div");
      customContainer.className = "my-custom-field-container";

      const customLabel = document.createElement("label");
      customLabel.innerText = "Enter Your Custom Engraving Text:";
      customLabel.htmlFor = "my-custom-engraving-input";

      const customInput = document.createElement("input");
      customInput.type = "text";
      customInput.id = "my-custom-engraving-input";
      customInput.placeholder = "Max 20 characters";

      customContainer.appendChild(customLabel);
      customContainer.appendChild(customInput);

      // Find a place on the page to inject your new custom field
      // For example, right before the "Add to Bag" button.
      const addToBagButton = document.querySelector(
        ".details-product-purchase__add-to-bag"
      );
      if (addToBagButton) {
        // The exact selector may vary, use your browser's developer tools to find the right one.
        addToBagButton.parentElement.insertBefore(
          customContainer,
          addToBagButton
        );
      }

      // --- Find the REAL Ecwid Option and Sync It ---
      // This is the most important part.
      // Find the real Ecwid text input you created with the backend script.
      // Its container might have a class like '.product-details__product-options'.
      // You'll need to inspect your page to find the exact selector for the input field
      // belonging to the "Custom Data" option.
      // Let's assume it's an input inside a div that contains the label "Custom Data".
      const realEcwidOptionInput = document.querySelector(
        'input[name="option_Custom Data"]'
      ); // This selector is an example!

      if (realEcwidOptionInput) {
        // Optional: Hide the original, unstyled Ecwid option field
        // realEcwidOptionInput.closest('.product-details-option').style.display = 'none';

        // Add an event listener to your custom input
        customInput.addEventListener("input", function (e) {
          // When the user types in YOUR field, update the REAL Ecwid field's value.
          realEcwidOptionInput.value = e.target.value;

          // You must also trigger a 'change' event on the real input so Ecwid's internal
          // scripts recognize the update.
          const changeEvent = new Event("change", { bubbles: true });
          realEcwidOptionInput.dispatchEvent(changeEvent);
        });
      }
    }
  });
});
