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
      function createFormField(
        container,
        labelText,
        inputType,
        inputId,
        options = []
      ) {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "form-field";

        const label = document.createElement("label");
        label.innerText = labelText;
        label.htmlFor = inputId;

        let input;
        if (inputType === "select") {
          input = document.createElement("select");
          input.id = inputId;
          options.forEach((optionText) => {
            const option = document.createElement("option");
            option.value = optionText.toLowerCase().replace(/ /g, "-");
            option.innerText = optionText;
            input.appendChild(option);
          });
        } else {
          input = document.createElement("input");
          input.type = inputType;
          input.id = inputId;
          input.placeholder = "Enter value...";
        }

        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        container.appendChild(fieldDiv);
      }

      const customContainer = document.createElement("div");
      customContainer.className = "my-custom-field-container";

      createFormField(
        customContainer,
        "Select Mesh:",
        "text",
        "custom-mesh-input"
      );
      createFormField(
        customContainer,
        "Select Sidewall Color:",
        "text",
        "custom-sidewall-input"
      );
      createFormField(
        customContainer,
        "Select Shooter Color:",
        "text",
        "custom-shooters-input"
      );
      const shooterOptions = [
        "-- Please choose an option --",
        "2 Straights",
        "1 Straight, 1 U",
        "2 U's",
        "Triangle",
      ];
      createFormField(
        customContainer,
        "Select Shooter Setup:",
        "select",
        "custom-shooter-setup-select",
        shooterOptions
      );
      createFormField(
        customContainer,
        "Select Pocket Placement:",
        "text",
        "custom-pocket-placement-input"
      );

      // Find a place on the page to inject your new custom field
      // For example, right before the "Add to Bag" button.
      const productDetailsActionPanel = document.querySelector(
        ".product-details__action-panel"
      );
      if (productDetailsActionPanel) {
        // The exact selector may vary, use your browser's developer tools to find the right one.
        productDetailsActionPanel.parentElement.insertBefore(
          customContainer,
          productDetailsActionPanel
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
