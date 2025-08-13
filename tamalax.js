Ecwid.OnAPILoaded.add(function () {
  console.log("JS API is loaded");
  console.log("Ecwid store ID: " + Ecwid.getOwnerId());

  Ecwid.OnPageLoaded.add(function (page) {
    const unstrungCategoryId = 175358054;

    console.log("Page DOM is loaded");
    console.log("Page type is: " + page.type);
    console.log("Page category is: " + page.categoryId);
    console.log("Page Main category is: " + page.mainCategoryId);
    if (
      page.type == "PRODUCT" &&
      (page.categoryId == unstrungCategoryId ||
        page.mainCategoryId == unstrungCategoryId)
    ) {
      console.log(
        `
       Page loaded!
       Ecwid store ID is: ${Ecwid.getOwnerId()}
       Product ID is: ${page.productId}
       Page is: ${page}
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
        totalPrice: currentPriceNumber + 20.0,
      };

      // --- Create Your Custom Field ---
      // This is just standard JavaScript DOM manipulation.
      // You can create any HTML elements you want.
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

          options.forEach((optionData) => {
            // Looping through objects now
            const option = document.createElement("option");
            // Set the option's value to the ID from our object
            option.value = optionData.text;
            option.id = optionData.id;
            // Set the displayed text to the Text from our object
            option.innerText = optionData.text;

            if (optionData.price !== undefined) {
              option.dataset.price = optionData.price;
            }

            input.appendChild(option);
          });

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
        customBtn.textContent = "Custom Stringing (+20.00)";
        customBtn.dataset.tooltip = "+$20.00";

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
          customStringing.totalPrice = currentPriceNumber + 20.0 + meshPrice;
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
        { text: "StringKing White 5x (+29.99)", id: 713353000, price: 29.99 },
        { text: "StringKing White 5s (+29.99)", id: 760238689, price: 19.99 },
        { text: "StringKing Black 5x (+29.99)", id: 1, price: 29.99 },
        { text: "StringKing Black 5s (+29.99)", id: 2, price: 29.99 },
        { text: "ECD HERO 4.0 White (+24.99)", id: 3, price: 24.99 },
        { text: "ECD HERO 4.0 Black (+24.99)", id: 4, price: 24.99 },
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
        { id: "wht", text: "White" },
        { id: "blk", text: "Black" },
        { id: "red", text: "Red" },
        { id: "blu", text: "Blue" },
        { id: "grn", text: "Green" },
        { id: "yel", text: "Yellow" },
        { id: "org", text: "Orange" },
        { id: "pur", text: "Purple" },
        { id: "pin", text: "Pink" },
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
        { id: "wht", text: "White" },
        { id: "blk", text: "Black" },
        { id: "red", text: "Red" },
        { id: "blu", text: "Blue" },
        { id: "grn", text: "Green" },
        { id: "yel", text: "Yellow" },
        { id: "org", text: "Orange" },
        { id: "pur", text: "Purple" },
        { id: "pin", text: "Pink" },
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
        Ecwid.Cart.addProduct(meshProduct);
        Ecwid.Cart.addProduct(stringingServiceProduct);

        Ecwid.Cart.setOrderComments(
          "Mesh: " +
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
  });
});
