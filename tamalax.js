Ecwid.OnAPILoaded.add(function () {
  console.log("JS API is loaded");
  console.log("Ecwid store ID: " + Ecwid.getOwnerId());

  Ecwid.OnPageLoaded.add(function (page) {
    const unstrungCategoryId = 175358054;

    console.log("Page DOM is loaded");
    console.log("Page type is: " + page.type);
    console.log("Page category is: " + page.categoryId);
    console.log("Page Main category is: " + page.mainCategoryId);

    //Custom Stringing Form
    if (
      page.type == "PRODUCT" &&
      (page.categoryId == unstrungCategoryId ||
        page.mainCategoryId == unstrungCategoryId) &&
      !page.name.includes("STX")
    ) {
      console.log(
        `
       Page loaded!
       Ecwid store ID is: ${Ecwid.getOwnerId()}
       Product ID is: ${page.productId}
       Page is: ${JSON.stringify(page)}
       Trying to add new field to product page...
        `
      );
      console.log("page:");
      // console.log(JSON.stringify(page.filterParams.attributes));

      const productPriceElement = document.querySelector('[itemprop="price"]');
      const priceSpan = document.querySelector(
        ".details-product-price__value.ec-price-item"
      );
      const currentPriceString = productPriceElement.getAttribute("content");
      const currentPriceNumber = parseFloat(currentPriceString);

      const stringingServiceId = 714272866;
      const customStringing = {
        stringing: 0,
        mesh: "",
        meshProductId: null,
        sidewallColor: "",
        shooterColor: "",
        shooterSetup: "",
        pocketPlacement: "",
        totalPrice: currentPriceNumber + 29.99,
      };

      // --- NEW: Function to create a custom dropdown ---
      function createCustomDropdown(
        container,
        labelText,
        inputId,
        options,
        stringingKey
      ) {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "form-field custom-dropdown-container";

        const label = document.createElement("label");
        label.innerText = labelText;
        label.htmlFor = inputId;

        // This hidden select will store the actual value for form submission purposes
        const hiddenSelect = document.createElement("select");
        hiddenSelect.id = inputId;
        hiddenSelect.style.display = "none"; // Hide it from the user

        // The visible part of our dropdown
        const dropdownDisplay = document.createElement("div");
        dropdownDisplay.className = "custom-dropdown-display";
        dropdownDisplay.tabIndex = 0; // Make it focusable

        const displayValue = document.createElement("span");
        displayValue.className = "custom-dropdown-value";
        displayValue.innerText = options[0].text; // "Select Sidewall Color"
        dropdownDisplay.appendChild(displayValue);

        // The list of options
        const optionsList = document.createElement("ul");
        optionsList.className = "custom-dropdown-options";

        options.forEach((optionData, index) => {
          // Create the hidden native option
          const nativeOption = document.createElement("option");
          nativeOption.value = optionData.text;
          nativeOption.id = optionData.id;
          if (index === 0) {
            nativeOption.disabled = true;
            nativeOption.selected = true;
          }
          hiddenSelect.appendChild(nativeOption);

          // Create the visible list item
          const listItem = document.createElement("li");
          listItem.className = "custom-dropdown-option";
          listItem.dataset.value = optionData.text;
          listItem.dataset.id = optionData.id;

          if (optionData.color) {
            const colorBox = document.createElement("span");
            colorBox.className = "color-box";
            colorBox.style.backgroundColor = optionData.color;
            if (optionData.color === "white") {
              colorBox.style.border = "1px solid #ccc";
            }
            listItem.appendChild(colorBox);
          }

          const optionText = document.createElement("span");
          optionText.innerText = optionData.text;
          listItem.appendChild(optionText);

          // When an option is clicked
          listItem.addEventListener("click", () => {
            displayValue.innerText = optionData.text;
            hiddenSelect.value = optionData.text;

            // Manually trigger a 'change' event on the hidden select for our existing listeners
            hiddenSelect.dispatchEvent(new Event("change"));

            optionsList.classList.remove("open");
            dropdownDisplay.classList.remove("open");
          });

          optionsList.appendChild(listItem);
        });

        // Toggle dropdown on click
        dropdownDisplay.addEventListener("click", () => {
          optionsList.classList.toggle("open");
          dropdownDisplay.classList.toggle("open");
        });

        fieldDiv.appendChild(label);
        fieldDiv.appendChild(dropdownDisplay);
        fieldDiv.appendChild(optionsList);
        fieldDiv.appendChild(hiddenSelect); // Add the hidden select to the DOM
        container.appendChild(fieldDiv);

        // Close dropdown if clicking outside
        document.addEventListener("click", (e) => {
          if (!fieldDiv.contains(e.target)) {
            optionsList.classList.remove("open");
            dropdownDisplay.classList.remove("open");
          }
        });

        return hiddenSelect; // Return the hidden select so event listeners can be attached
      }

      function createFormField(
        container,
        labelText,
        inputType,
        inputId,
        options = [],
        stringingKey
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

          if (stringingKey) {
            input.dataset.key = stringingKey;
          }
          // --- KEY CHANGE IS HERE ---
          options.forEach((optionData) => {
            // Looping through objects now
            const option = document.createElement("option");
            // Set the option's value to the ID from our object
            option.value = optionData.text;
            option.id = optionData.id;
            option.innerText = optionData.text;

            input.appendChild(option);
          });
          // --- END OF KEY CHANGE ---
          input.firstChild.setAttribute("disabled", true);
        } else {
          input = document.createElement("input");
          input.type = inputType;
          input.id = inputId;
          input.placeholder = "Enter value...";
        }

        fieldDiv.appendChild(label);
        fieldDiv.appendChild(input);
        container.appendChild(fieldDiv);
        return input; // Return the created input/select
      }

      // --- Function to create and inject the option buttons ---
      function createOptionButtons(container) {
        const optionsContainer = document.createElement("div");
        optionsContainer.className = "stringing-options";

        // Create "Unstrung" button
        const unstrungBtn = document.createElement("button");
        unstrungBtn.className = "option-button active"; // Active by default
        unstrungBtn.id = "unstrung-btn";
        unstrungBtn.textContent = "Unstrung";

        // Create "Custom Stringing" button
        const customBtn = document.createElement("button");
        customBtn.className = "option-button";
        customBtn.id = "custom-btn";
        customBtn.textContent = "Custom Stringing (+29.99)";
        customBtn.dataset.tooltip = "+$29.99";

        optionsContainer.appendChild(unstrungBtn);
        optionsContainer.appendChild(customBtn);
        container.appendChild(optionsContainer);
      }

      // --- Function to update variables on form changes ---
      function setupFormListeners() {
        // Get references to each select element
        const meshSelect = document.getElementById("custom-mesh-input");
        const sidewallSelect = document.getElementById("custom-sidewall-input");
        const shooterColorSelect = document.getElementById(
          "custom-shooters-input"
        );
        const shooterSetupSelect = document.getElementById(
          "custom-shooter-setup-select"
        );
        const pocketPlacementSelect = document.getElementById(
          "custom-pocket-placement-input"
        );

        const newBuyButton = document.getElementById("new-buy-btn");

        // New function to check if all selections are made
        function checkFormValidity() {
          return (
            customStringing.mesh !== "" &&
            customStringing.sidewallColor !== "" &&
            customStringing.shooterColor !== "" &&
            customStringing.shooterSetup !== "" &&
            customStringing.pocketPlacement !== ""
          );
        }
        function updateButtonState() {
          if (checkFormValidity()) {
            newBuyButton.disabled = false;
            newBuyButton.className = "new-buy-button active";
            newBuyButton.textContent = "Add to Bag";
          } else {
            newBuyButton.disabled = true;
            newBuyButton.textContent = "Please make all selections";
          }
        }

        // Add a 'change' event listener to each select element
        meshSelect.addEventListener("change", (event) => {
          customStringing.mesh = event.target.value;
          const selectedOption = event.target.selectedOptions[0];
          customStringing.meshProductId = selectedOption.id;
          // Get the price from the data-price attribute, converted to a number
          const meshPrice = parseFloat(selectedOption.dataset.price);
          customStringing.totalPrice = currentPriceNumber + 29.99 + meshPrice;
          // Update the content attribute on the div
          productPriceElement.setAttribute(
            "content",
            customStringing.totalPrice.toFixed(2)
          );

          // Update the text content of the span
          priceSpan.textContent = `$${customStringing.totalPrice.toFixed(2)}`;
          updateButtonState();
          console.log(customStringing); // For testing
        });

        sidewallSelect.addEventListener("change", (event) => {
          customStringing.sidewallColor = event.target.value;
          updateButtonState();
          console.log(customStringing); // For testing
        });

        shooterColorSelect.addEventListener("change", (event) => {
          customStringing.shooterColor = event.target.value;
          updateButtonState();
          console.log(customStringing); // For testing
        });

        shooterSetupSelect.addEventListener("change", (event) => {
          customStringing.shooterSetup = event.target.value;
          updateButtonState();
          console.log(customStringing); // For testing
        });

        pocketPlacementSelect.addEventListener("change", (event) => {
          customStringing.pocketPlacement = event.target.value;
          updateButtonState();
          console.log(customStringing); // For testing
        });
      }

      // --- Create the custom form container and its fields ---

      const buttonContainer = document.createElement("div");
      buttonContainer.className = "my-custom-button-container";
      const customContainer = document.createElement("div");
      customContainer.className = "my-custom-field-container";

      createOptionButtons(buttonContainer);
      const meshOptions = [
        { text: "Select Mesh", id: "" },
        { text: "StringKing White 5x (+29.99)", id: 1, price: 29.99 },
        { text: "StringKing White 5s (+29.99)", id: 2, price: 29.99 },
        { text: "StringKing Black 5x (+29.99)", id: 3, price: 29.99 },
        { text: "StringKing Black 5s (+29.99)", id: 4, price: 29.99 },
        { text: "ECD HERO 4.0 White (+24.99)", id: 5, price: 24.99 },
        { text: "ECD HERO 4.0 Black (+24.99)", id: 6, price: 24.99 },
      ];
      createFormField(
        customContainer,
        "Mesh:",
        "select",
        "custom-mesh-input",
        meshOptions
      );
      const sidewallColorOptions = [
        { id: "", text: "Select Sidewall Color" },
        { id: "wht", text: "White", color: "white" },
        { id: "blk", text: "Black", color: "black" },
        { id: "red", text: "Red", color: "red" },
        { id: "blu", text: "Blue", color: "blue" },
        { id: "grn", text: "Green", color: "green" },
        { id: "yel", text: "Yellow", color: "yellow" },
        { id: "org", text: "Orange", color: "orange" },
        { id: "pur", text: "Purple", color: "purple" },
        { id: "pin", text: "Pink", color: "pink" },
      ];
      createFormField(
        customContainer,
        "Sidewall Color:",
        "select",
        "custom-sidewall-input",
        sidewallColorOptions
      );
      const shooterColorOptions = [
        { id: "", text: "Select Shooter Color" },
        { id: "wht", text: "White", color: "white" },
        { id: "blk", text: "Black", color: "black" },
        { id: "red", text: "Red", color: "red" },
        { id: "blu", text: "Blue", color: "blue" },
        { id: "grn", text: "Green", color: "green" },
        { id: "yel", text: "Yellow", color: "yellow" },
        { id: "org", text: "Orange", color: "orange" },
        { id: "pur", text: "Purple", color: "purple" },
        { id: "pin", text: "Pink", color: "pink" },
      ];
      createFormField(
        customContainer,
        "Shooter Color:",
        "select",
        "custom-shooters-input",
        shooterColorOptions
      );
      const shooterOptions = [
        { id: "", text: "Select Shooter Setup" },
        { id: "1s", text: "1 Straight Hockey Lace" },
        { id: "1s1n", text: "1 Straight Hockey Lace, 1 Nylon" },
        { id: "2s", text: "2 Straight Hockey Lace" },
        { id: "2s1n", text: "2 Straight Hockey Lace, 1 Nylon" },
        { id: "3s", text: "3 Straight Hockey Lace" },
      ];
      createFormField(
        customContainer,
        "Shooter Setup:",
        "select",
        "custom-shooter-setup-select",
        shooterOptions
      );
      const pocketOptions = [
        { id: "", text: "Select Pocket Placement" },
        { id: "high", text: "High" },
        { id: "mid", text: "Mid" },
        { id: "low", text: "Low" },
      ];
      createFormField(
        customContainer,
        "Pocket Placement:",
        "select",
        "custom-pocket-placement-input",
        pocketOptions
      );

      // Hide the form by default
      customContainer.classList.add("form-hidden");
      customContainer.classList.remove("my-custom-field-container");

      const newBuyButton = document.createElement("button");
      newBuyButton.className = "new-buy-button disabled";
      newBuyButton.id = "new-buy-btn";
      newBuyButton.textContent = "Please make all selections"; // Initial message
      newBuyButton.disabled = true; // Disabled by default
      customContainer.appendChild(newBuyButton);

      // Find a place on the page to inject your new custom field
      // For example, right before the "Add to Bag" button.
      const productDetailsActionPanel = document.querySelector(
        ".product-details__action-panel"
      );
      if (productDetailsActionPanel) {
        // The exact selector may vary, use your browser's developer tools to find the right one.
        productDetailsActionPanel.parentElement.insertBefore(
          buttonContainer,
          productDetailsActionPanel
        );
        productDetailsActionPanel.parentElement.insertBefore(
          customContainer,
          productDetailsActionPanel
        );
      } else {
        console.error(
          "Could not find the target element to inject the form fields."
        );
      }

      setupFormListeners();

      // Get buttons
      const unstrungBtn = document.getElementById("unstrung-btn");
      const customBtn = document.getElementById("custom-btn");

      // Event listener for the "Unstrung" button
      unstrungBtn.addEventListener("click", () => {
        unstrungBtn.classList.add("active");
        customBtn.classList.remove("active");
        customContainer.classList.remove("my-custom-field-container");
        customContainer.classList.add("form-hidden");
        customStringing.stringing = 0;
        productPriceElement.setAttribute(
          "content",
          currentPriceNumber.toFixed(2)
        );
        priceSpan.textContent = `$${currentPriceNumber.toFixed(2)}`;

        //Design Configs
        window.ec = window.ec || Object();
        window.ec.storefront = window.ec.storefront || Object();
        window.ec.storefront.product_details_show_buy_button = true;
        // window.ec.storefront.product_details_show_product_price = true;

        // Apply design configs
        Ecwid.refreshConfig && Ecwid.refreshConfig();
      });

      // Event listener for the "Custom Stringing" button
      customBtn.addEventListener("click", () => {
        customBtn.classList.add("active");
        unstrungBtn.classList.remove("active");
        customContainer.classList.add("my-custom-field-container");
        customContainer.classList.remove("form-hidden");
        customStringing.stringing = 1;
        productPriceElement.setAttribute(
          "content",
          customStringing.totalPrice.toFixed(2)
        );
        priceSpan.textContent = `$${customStringing.totalPrice.toFixed(2)}`;

        //Design Configs
        window.ec = window.ec || Object();
        window.ec.storefront = window.ec.storefront || Object();
        window.ec.storefront.product_details_show_buy_button = false;
        // window.ec.storefront.product_details_show_product_price = false;

        // Apply design configs
        Ecwid.refreshConfig && Ecwid.refreshConfig();
      });

      //for hover tooltips
      const triggers = document.querySelectorAll("[data-tooltip]");

      triggers.forEach((trigger) => {
        const tooltip = document.createElement("div");
        tooltip.classList.add("tooltip");
        tooltip.textContent = trigger.dataset.tooltip;
        document.body.appendChild(tooltip); // Or append to the trigger itself

        trigger.addEventListener("mouseenter", () => {
          const rect = trigger.getBoundingClientRect();
          tooltip.style.left = `${
            rect.left +
            window.scrollX +
            rect.width / 2 -
            tooltip.offsetWidth / 2
          }px`;
          tooltip.style.top = `${
            rect.top + window.scrollY + rect.height + 5
          }px`; // 5px offset below trigger
          tooltip.classList.add("active");
        });

        trigger.addEventListener("mouseleave", () => {
          tooltip.classList.remove("active");
        });
      });

      //Set stringing items to cart and add comments(Stringing Selections)

      const addToBagButton = document.querySelector(".new-buy-button");
      addToBagButton.addEventListener("click", () => {
        var meshProduct = {
          id: customStringing.meshProductId,
          quantity: 1,
          callback: function (success, product, cart) {
            if (success) {
              console.log("Mesh added successfully");
            } else {
              console.log("Failed to add mesh");
            }
          },
        };
        var stringingServiceProduct = {
          id: stringingServiceId,
          quantity: 1,
          options: {
            Mesh: customStringing.mesh,
            "Sidewall Color": customStringing.sidewallColor,
            "Shooter Color": customStringing.shooterColor,
            "Shooter Setup": customStringing.shooterSetup,
            "Pocket Placement": customStringing.pocketPlacement,
          },
          callback: function (success, product, cart) {
            if (success) {
              console.log("Stringing Service added successfully");
            } else {
              console.log("Failed to add stringing service");
            }
          },
        };

        var headProduct = {
          id: page.productId,
          quantity: 1,
          callback: function (success, product, cart) {
            if (success) {
              console.log("Head added successfully");
            } else {
              console.log("Failed to add stringing service");
            }
          },
        };

        Ecwid.Cart.addProduct(headProduct);
        // Ecwid.Cart.addProduct(meshProduct);
        Ecwid.Cart.addProduct(stringingServiceProduct);

        Ecwid.Cart.setOrderComments(
          "Stringing Selections:\n" +
            "Head: " +
            page.name +
            "\nMesh: " +
            customStringing.mesh +
            "\nSidewall Color: " +
            customStringing.sidewallColor +
            "\nShooter Color: " +
            customStringing.shooterColor +
            "\nShooter Setup: " +
            customStringing.shooterSetup +
            "\nPocket Placement: " +
            customStringing.pocketPlacement,
          function (successCallback) {
            console.log("Successfully added comments");
          },
          function (errorCallback) {
            console.log("Failed to add comments");
          }
        );
      });
    }

    //STX product check
    if (page.type == "PRODUCT" && page.name.includes("STX")) {
      console.log("This is an STX Product");
      console.log("Removing price and ability to purchase online");

      const customContainer = document.createElement("div");
      customContainer.className = "my-custom-field-container";

      const newBuyButton = document.createElement("button");
      newBuyButton.className = "new-buy-button disabled";
      newBuyButton.id = "new-buy-btn";
      newBuyButton.textContent = "Available In Store Only"; // Initial message
      newBuyButton.disabled = true; // Disabled by default
      customContainer.appendChild(newBuyButton);

      const productDetailsActionPanel = document.querySelector(
        ".product-details__action-panel"
      );
      if (productDetailsActionPanel) {
        productDetailsActionPanel.parentElement.insertBefore(
          customContainer,
          productDetailsActionPanel
        );
      } else {
        console.error(
          "Could not find the target element to inject the form fields."
        );
      }

      //Design Configs

      window.ec = window.ec || Object();
      window.ec.storefront = window.ec.storefront || Object();
      window.ec.storefront.product_details_show_buy_button = false;
      window.ec.storefront.product_details_show_product_price = false;
      Ecwid.refreshConfig && Ecwid.refreshConfig();
    }
  });
});
