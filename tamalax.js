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
        stringingComments: "",
        totalPrice: currentPriceNumber + 29.99,
      };

      function createCustomDropdown(
        container,
        labelText,
        inputId,
        options,
        stringingKey
      ) {
        const fieldDiv = document.createElement("div");
        fieldDiv.className = "form-field";

        const label = document.createElement("label");
        label.innerText = labelText;
        label.htmlFor = inputId;

        // This wrapper is the positioning anchor for the absolute-positioned options list
        const dropdownWrapper = document.createElement("div");
        dropdownWrapper.className = "custom-dropdown-container";

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

          if (index === 0) {
            listItem.classList.add("disabled");
          }

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
            // If the option is disabled, just close the dropdown and do nothing else.
            if (listItem.classList.contains("disabled")) {
              optionsList.classList.remove("open");
              dropdownDisplay.classList.remove("open");
              return;
            }
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
        // Append the visible parts to the wrapper
        dropdownWrapper.appendChild(dropdownDisplay);
        dropdownWrapper.appendChild(optionsList);
        fieldDiv.appendChild(dropdownWrapper); // Append the wrapper to the field
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

      function createStandardField(
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
        } else if (inputType === "textarea") {
          input = document.createElement("textarea");
          input.id = inputId;
          input.rows = 4; // Set a default height
          input.placeholder = "Any special instructions?";
        } else {
          input = document.createElement("input");
          input.type = inputType;
          input.id = inputId;
          input.placeholder = "Enter value...";
        }

        if (inputType === "select") {
          // Wrap the native select in a container to apply custom styling
          const selectWrapper = document.createElement("div");
          selectWrapper.className = "custom-dropdown-container";
          selectWrapper.appendChild(input);
          fieldDiv.appendChild(label);
          fieldDiv.appendChild(selectWrapper);
        } else {
          fieldDiv.appendChild(label);
          fieldDiv.appendChild(input);
        }
        container.appendChild(fieldDiv);
        return input;
      }

      function createFormField(
        container,
        labelText,
        inputType,
        inputId,
        options = [],
        stringingKey
      ) {
        // If it's a color dropdown, use the new custom function and then exit.
        if (options.some((opt) => opt.color)) {
          return createCustomDropdown(
            container,
            labelText,
            inputId,
            options,
            stringingKey
          );
        } else {
          // For all other dropdowns, proceed with the original logic.
          return createStandardField(
            container,
            labelText,
            inputType,
            inputId,
            options,
            stringingKey
          );
        }
      }

      function createImageRadioButtons(container, labelText, name, options) {
        const fieldDiv = document.createElement("div");
        fieldDiv.id = name;
        fieldDiv.className = `form-field image-radio-field ${name}`;

        const label = document.createElement("label");
        label.innerText = labelText;
        label.htmlFor = name;

        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.innerText = labelText;

        const selectionDisplay = document.createElement("span");
        selectionDisplay.id = `${name}-display`;
        label.appendChild(selectionDisplay);
        fieldset.appendChild(legend);

        const optionsWrapper = document.createElement("div");
        optionsWrapper.className = "image-radio-options-wrapper";
        optionsWrapper.classList.add(`image-radio-wrapper-${name}`); // Add a unique class

        options.forEach((optionData) => {
          const wrapper = document.createElement("div");
          wrapper.className = `image-radio-wrapper`;

          const input = document.createElement("input");
          input.type = "radio";
          input.id = `radio-${name}-${optionData.id}`;
          input.name = name;
          input.value = optionData.text; // Pass the full text as the value

          const label = document.createElement("label");
          label.htmlFor = input.id;
          label.dataset.tooltip = optionData.text;

          const img = document.createElement("img");
          img.src = optionData.image;
          img.alt = optionData.text;
          img.style.width = "120px";
          img.style.height = "120px";

          const textSpan = document.createElement("span");
          // textSpan.innerText = optionData.text;

          label.appendChild(img);
          label.appendChild(textSpan);
          wrapper.appendChild(input);
          wrapper.appendChild(label);
          optionsWrapper.appendChild(wrapper);
        });

        fieldDiv.appendChild(label);
        fieldset.appendChild(optionsWrapper);
        fieldDiv.appendChild(fieldset);
        container.appendChild(fieldDiv);

        // Add event listener to the wrapper to handle changes
        optionsWrapper.addEventListener("change", (event) => {
          if (event.target.type === "radio") {
            // We can dispatch a custom event if needed, but for now we'll let the main listener handle it.
            // This is just to show where you'd capture the change.
          }
        });

        // Return the wrapper for consistency, though we'll listen differently
        return optionsWrapper;
      }

      function createMeshImageRadioButtons(
        container,
        labelText,
        name,
        options
      ) {
        const fieldDiv = document.createElement("div");
        fieldDiv.id = name;
        fieldDiv.className = `form-field image-radio-field ${name}`;

        const label = document.createElement("label");
        label.innerText = labelText;
        label.htmlFor = name;

        const fieldset = document.createElement("fieldset");
        const legend = document.createElement("legend");
        legend.innerText = labelText;

        const selectionDisplay = document.createElement("span");
        selectionDisplay.id = `${name}-display`;
        label.appendChild(selectionDisplay);
        fieldset.appendChild(legend);

        const optionsWrapper = document.createElement("div");
        optionsWrapper.className = "image-radio-options-wrapper";
        optionsWrapper.classList.add(`image-radio-wrapper-${name}`); // Add a unique class

        options.forEach((optionData) => {
          const wrapper = document.createElement("div");
          wrapper.className = `image-radio-wrapper`;

          const input = document.createElement("input");
          input.type = "radio";
          input.id = `radio-${name}-${optionData.id}`;
          input.name = name;
          input.value = optionData.text; // Pass the full text as the value
          if (optionData.price !== undefined) {
            input.dataset.price = optionData.price;
          }

          const label = document.createElement("label");
          label.htmlFor = input.id;
          label.dataset.tooltip = optionData.text;

          const textSpan = document.createElement("span");
          textSpan.innerText = optionData.title;
          textSpan.dataset.tooltip = optionData.text;

          label.appendChild(textSpan);
          wrapper.appendChild(input);
          wrapper.appendChild(label);
          optionsWrapper.appendChild(wrapper);
        });

        fieldDiv.appendChild(label);
        fieldset.appendChild(optionsWrapper);
        fieldDiv.appendChild(fieldset);
        container.appendChild(fieldDiv);

        // Add event listener to the wrapper to handle changes
        optionsWrapper.addEventListener("change", (event) => {
          if (event.target.type === "radio") {
            // We can dispatch a custom event if needed, but for now we'll let the main listener handle it.
            // This is just to show where you'd capture the change.
          }
        });

        // Return the wrapper for consistency, though we'll listen differently
        return optionsWrapper;
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
        const commentsInput = document.getElementById(
          "custom-stringing-comments-input"
        );

        const newBuyButton = document.getElementById("new-buy-btn");

        // New function to check if all selections are made
        function checkFormValidity() {
          if (customStringing.shooterSetup === "Other (Specify in comments)") {
            return (
              customStringing.mesh !== "" &&
              customStringing.sidewallColor !== "" &&
              customStringing.shooterColor !== "" &&
              customStringing.shooterSetup !== "" &&
              customStringing.pocketPlacement !== "" &&
              customStringing.stringingComments !== ""
            );
          } else {
            return (
              customStringing.mesh !== "" &&
              customStringing.sidewallColor !== "" &&
              customStringing.shooterColor !== "" &&
              customStringing.shooterSetup !== "" &&
              customStringing.pocketPlacement !== ""
            );
          }
        }
        function updateButtonState() {
          if (checkFormValidity()) {
            newBuyButton.disabled = false;
            newBuyButton.className = "new-buy-button active";
            newBuyButton.textContent = "Add to Bag";
          } else {
            newBuyButton.disabled = true;
            newBuyButton.className = "new-buy-button disabled";
            newBuyButton.textContent = "Please make all selections";
          }
        }

        // Add a 'change' event listener to each select element
        // meshSelect.addEventListener("change", (event) => {
        //   customStringing.mesh = event.target.value;
        //   const selectedOption = event.target.selectedOptions[0];
        //   customStringing.meshProductId = selectedOption.id;
        //   // Get the price from the data-price attribute, converted to a number
        //   const meshPrice = parseFloat(selectedOption.dataset.price);
        //   customStringing.totalPrice = currentPriceNumber + 29.99 + meshPrice;
        //   // Update the content attribute on the div
        //   productPriceElement.setAttribute(
        //     "content",
        //     customStringing.totalPrice.toFixed(2)
        //   );

        //   // Update the text content of the span
        //   priceSpan.textContent = `$${customStringing.totalPrice.toFixed(2)}`;
        //   updateButtonState();
        //   console.log(customStringing); // For testing
        // });

        const meshSelectContainer = document.querySelector(
          ".image-radio-wrapper-mesh-brand" // Use the unique class
        );
        const meshSelectDisplay = document.getElementById("mesh-brand");
        meshSelectContainer.addEventListener("change", (event) => {
          const meshBrand = event.target.value;
          const stringKingDiv = document.getElementById(
            "stringking-mesh-options"
          );
          const ecdDiv = document.getElementById("ecd-mesh-options");
          const meshBrandDisplay =
            document.getElementById("mesh-brand-display");
          console.log(meshBrand);
          if (meshBrand === "StringKing") {
            if (ecdDiv) {
              ecdDiv.remove();
            }
            meshBrandDisplay.innerText = ` ${event.target.value}`;
            createMeshImageRadioButtons(
              meshSelectDisplay,
              "* Choose a Mesh:",
              "stringking-mesh-options",
              stringKingMeshOptions
            );
            // Re-initialize tooltips for the newly created elements
            const newMeshOptionsContainer = document.querySelector(
              ".image-radio-wrapper-stringking-mesh-options"
            );
            if (newMeshOptionsContainer) {
              initializeTooltips(newMeshOptionsContainer);
            }
            newMeshOptionsContainer.addEventListener("change", (event) => {
              const stringkingDisplay = document.getElementById(
                "stringking-mesh-options-display"
              );
              stringkingDisplay.innerText = ` ${event.target.value}`;
              customStringing.mesh = event.target.value;

              // Get the price from the data-price attribute, converted to a number
              const meshPrice = parseFloat(event.target.dataset.price);
              customStringing.totalPrice =
                currentPriceNumber + 29.99 + meshPrice;
              // Update the content attribute on the div
              productPriceElement.setAttribute(
                "content",
                customStringing.totalPrice.toFixed(2)
              );
              // Update the text content of the span
              priceSpan.textContent = `$${customStringing.totalPrice.toFixed(
                2
              )}`;
              updateButtonState();
              console.log(customStringing);
            });
          } else if (meshBrand === "ECD") {
            if (stringKingDiv) {
              stringKingDiv.remove();
            }
            meshBrandDisplay.innerText = ` ${event.target.value}`;
            updateButtonState();
            console.log(customStringing);
          }

          // customStringing.mesh = event.target.value;
          // const selectedOption = event.target.selectedOptions[0];
          // customStringing.meshProductId = selectedOption.id;
          // // Get the price from the data-price attribute, converted to a number
          // const meshPrice = parseFloat(selectedOption.dataset.price);
          // customStringing.totalPrice = currentPriceNumber + 29.99 + meshPrice;
          // // Update the content attribute on the div
          // productPriceElement.setAttribute(
          //   "content",
          //   customStringing.totalPrice.toFixed(2)
          // );

          // // Update the text content of the span
          // priceSpan.textContent = `$${customStringing.totalPrice.toFixed(2)}`;
          // updateButtonState();
          // console.log(customStringing); // For testing
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

        // Updated listener for the radio button group
        const shooterSetupContainer = document.querySelector(
          ".image-radio-wrapper-shooter-setup" // Use the unique class
        );
        const shooterSelectionDisplay = document.getElementById(
          "shooter-setup-display"
        );
        shooterSetupContainer.addEventListener("change", (event) => {
          if (event.target.name === "shooter-setup") {
            customStringing.shooterSetup = event.target.value;
            updateButtonState();
            shooterSelectionDisplay.innerText = ` ${event.target.value}`;
            console.log(customStringing); // For testing
          }
        });

        // Updated listener for the radio button group
        const pocketSetupContainer = document.querySelector(
          ".image-radio-wrapper-pocket-placement" // Use the unique class
        );
        const pocketSelectionDisplay = document.getElementById(
          "pocket-placement-display"
        );
        pocketSetupContainer.addEventListener("change", (event) => {
          if (event.target.name === "pocket-placement") {
            customStringing.pocketPlacement = event.target.value;
            updateButtonState();
            pocketSelectionDisplay.innerText = ` ${event.target.value}`;
            console.log(customStringing); // For testing
          }
        });
        // pocketPlacementSelect.addEventListener("change", (event) => {
        //   customStringing.pocketPlacement = event.target.value;
        //   updateButtonState();
        //   console.log(customStringing); // For testing
        // });

        commentsInput.addEventListener("input", (event) => {
          customStringing.stringingComments = event.target.value;
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

      // const meshOptions = [
      //   { text: "Select Mesh", id: "" },
      //   { text: "StringKing White 5x (+29.99)", id: 1, price: 29.99 },
      //   { text: "StringKing White 5s (+29.99)", id: 2, price: 29.99 },
      //   { text: "StringKing Black 5x (+29.99)", id: 3, price: 29.99 },
      //   { text: "StringKing Black 5s (+29.99)", id: 4, price: 29.99 },
      //   { text: "ECD HERO 4.0 White (+24.99)", id: 5, price: 24.99 },
      //   { text: "ECD HERO 4.0 Black (+24.99)", id: 6, price: 24.99 },
      // ];
      // createFormField(
      //   customContainer,
      //   "* Mesh:",
      //   "select",
      //   "custom-mesh-input",
      //   meshOptions
      // );

      const meshOptions = [
        {
          id: "stringking",
          text: "StringKing",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5388042419.png",
          price: 29.99,
        },
        {
          id: "ecd",
          text: "ECD",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5388042425.png",
          price: 29.99,
        },
      ];

      createImageRadioButtons(
        customContainer,
        "* Mesh Brand:",
        "mesh-brand",
        meshOptions
      );

      const stringKingMeshOptions = [
        {
          id: "5xwht",
          text: "StringKing White 5x (+29.99)",
          title: "5x White",
          price: 29.99,
        },
        {
          id: "5xblk",
          text: "StringKing Black 5x (+29.99)",
          title: "5x Black",
          price: 29.99,
        },
        {
          id: "5swht",
          text: "StringKing White 5s (+29.99)",
          title: "5s White",
          price: 29.99,
        },
        {
          id: "5sblk",
          text: "StringKing Black 5s (+29.99)",
          title: "5s Black",
          price: 29.99,
        },
        {
          id: "4xwht",
          text: "StringKing White 4x (+24.99)",
          title: "4x White",
          price: 24.99,
        },
        {
          id: "4xblk",
          text: "StringKing Black 4x (+24.99)",
          title: "4x Black",
          price: 24.99,
        },
        {
          id: "4swht",
          text: "StringKing White 4s (+24.99)",
          title: "4s White",
          price: 24.99,
        },
        {
          id: "4sblk",
          text: "StringKing Black 4s (+24.99)",
          title: "4s Black",
          price: 24.99,
        },
        {
          id: "3xwht",
          text: "StringKing White 3x (+19.99)",
          price: 19.99,
        },
        {
          id: "3xblk",
          text: "StringKing Black 3x (+19.99)",
          price: 19.99,
        },
        {
          id: "3swht",
          text: "StringKing White 3s (+19.99)",
          price: 19.99,
        },
        {
          id: "3sblk",
          text: "StringKing Black 3s (+19.99)",
          price: 19.99,
        },
      ];

      const sidewallColorOptions = [
        { id: "", text: "Select Sidewall Color" },
        { id: "wht", text: "White", color: "white" },
        { id: "blk", text: "Black", color: "black" },
        { id: "red", text: "Red", color: "red" },
        { id: "yel", text: "Yellow", color: "#ffe100" },
        { id: "org", text: "Orange", color: "#f4562b" },
        { id: "royblu", text: "Royal Blue", color: "#1965d7" },
        { id: "nvyblu", text: "Navy Blue", color: "#171d44" },
        { id: "carblu", text: "Carolina Blue", color: "#8edbff" },
        { id: "klygrn", text: "Kelly Green", color: "#4CBB17" },
        { id: "frstgrn", text: "Forest Green", color: "#228B22" },
        { id: "pur", text: "Purple", color: "purple" },
        { id: "npink", text: "Neon Pink", color: "#ff6cf5" },
        { id: "nyel", text: "Neon Yellow", color: "#eaff00" },
        { id: "norg", text: "Neon Orange", color: "#ff9900" },
        { id: "ngrn", text: "Neon Green", color: "#11ff1d" },
      ];
      createFormField(
        customContainer,
        "* Sidewall Color:",
        "select",
        "custom-sidewall-input",
        sidewallColorOptions
      );

      const shooterColorOptions = [
        { id: "", text: "Select Sidewall Color" },
        { id: "wht", text: "White", color: "white" },
        { id: "blk", text: "Black", color: "black" },
        { id: "red", text: "Red", color: "red" },
        { id: "yel", text: "Yellow", color: "#ffe100" },
        { id: "org", text: "Orange", color: "#f4562b" },
        { id: "royblu", text: "Royal Blue", color: "#1965d7" },
        { id: "nvyblu", text: "Navy Blue", color: "#171d44" },
        { id: "carblu", text: "Carolina Blue", color: "#8edbff" },
        { id: "klygrn", text: "Kelly Green", color: "#4CBB17" },
        { id: "frstgrn", text: "Forest Green", color: "#228B22" },
        { id: "pur", text: "Purple", color: "purple" },
        { id: "npink", text: "Neon Pink", color: "#ff6cf5" },
        { id: "nyel", text: "Neon Yellow", color: "#eaff00" },
        { id: "norg", text: "Neon Orange", color: "#ff9900" },
        { id: "ngrn", text: "Neon Green", color: "#11ff1d" },
      ];
      createFormField(
        customContainer,
        "* Shooter Color:",
        "select",
        "custom-shooters-input",
        shooterColorOptions
      );

      const shooterOptions = [
        {
          id: "1s",
          text: "1 Straight Hockey",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5375146099.png",
        },
        {
          id: "1s1n",
          text: "1 Nylon, 1 Straight Hockey",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5375146105.png",
        },
        {
          id: "2s",
          text: "2 Straight Hockey",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5375146111.png",
        },
        {
          id: "2s1n",
          text: "1 Nylon, 2 Straight Hockey",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5384964103.png",
        },
        {
          id: "3s",
          text: "3 Straight Hockey",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5375151082.png",
        },
        {
          id: "other",
          text: "Other (Specify in comments)",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5384964055.png",
        },
      ];
      createImageRadioButtons(
        customContainer,
        "* Shooter Setup:",
        "shooter-setup",
        shooterOptions
      );

      const pocketOptions = [
        {
          id: "high",
          text: "High",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5375215826.png",
        },
        {
          id: "mid",
          text: "Mid",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5375202204.png",
        },
        {
          id: "low",
          text: "Low",
          image:
            "https://d2j6dbq0eux0bg.cloudfront.net/images/111661765/5375209645.png",
        },
      ];

      createImageRadioButtons(
        customContainer,
        "* Pocket Placement:",
        "pocket-placement",
        pocketOptions
      );

      createFormField(
        customContainer,
        "Stringing Comments:",
        "textarea",
        "custom-stringing-comments-input"
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

      // --- Function to initialize tooltips for elements within a given container ---
      function initializeTooltips(container) {
        const triggers = container.querySelectorAll("[data-tooltip]");

        triggers.forEach((trigger) => {
          const tooltip = document.createElement("div");
          tooltip.classList.add("tooltip");
          tooltip.textContent = trigger.dataset.tooltip;
          document.body.appendChild(tooltip);

          trigger.addEventListener("mouseenter", () => {
            const rect = trigger.getBoundingClientRect();
            tooltip.style.left = `${
              rect.left +
              window.scrollX +
              rect.width / 2 -
              tooltip.offsetWidth / 2
            }px`;
            tooltip.style.top = `${
              rect.top + window.scrollY - tooltip.offsetHeight - 5
            }px`; // Position above the element
            tooltip.classList.add("active");
          });

          trigger.addEventListener("mouseleave", () => {
            tooltip.classList.remove("active");
          });
        });
      }

      // Initialize tooltips for all elements present on page load
      initializeTooltips(document.body);

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
            Head: page.name,
            "Stringing Comments": customStringing.stringingComments,
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
