/*
 * Name: Marcus Jundt
 * Date: 4/24/2024
 * Section: CSE 154 AE
 *
 * This is the JS file which
 */

"use strict";
(function() {

  const MOCK_ITEMS = [{
    thumb: "",
    productName: "Large Egg",
    productID: 0,
    price: 4.9,
    category: "Egg",
    categoryID: "egg",
    description: "The Large Egg is a very large egg. This is perfect for large omelette!" +
      "Buy this now to get a large egg! Please buy this!",
    stock: 24
  },
  {
    thumb: "",
    productName: "Long Egg",
    productID: 1,
    price: 12,
    category: "Egg",
    categoryID: "egg",
    description: "The Long Egg is a very long egg. This is perfect for long omelette!" +
      "Buy this now to get a long egg! Please buy this!",
    stock: 3
  },
  {
    thumb: "",
    productName: "Big Chicken",
    productID: 2,
    price: 49.99,
    category: "Chicken",
    categoryID: "chicken",
    description: "This is a description for Big Chicken! It is a big chicken that can be used for" +
      "making big chicken salad! Enjoy.",
    stock: 104
  },
  {
    thumb: "",
    productName: "Cool Egg",
    productID: 3,
    price: 449.5,
    category: "Egg",
    categoryID: "egg",
    description: "This egg is very cool!",
    stock: 0
  },
  {
    thumb: "",
    productName: "Product name",
    productID: 4,
    price: 50,
    category: "Egg",
    categoryID: "egg",
    description: "This is a description for Product name! What is up",
    stock: 3
  },
  {
    thumb: "",
    productName: "Tiny Chicken",
    productID: 5,
    price: 75,
    category: "Chicken",
    categoryID: "chicken",
    description: "This is a description for Tiny Chicken! It is a tiny chicken that can be used" +
      "for making tiny chicken salad! Enjoy.",
    stock: 5031
  }];

  let loggedIn = true;

  window.addEventListener("load", init);

  /**
   * Initializes functionality of buttons and fills items display with items
   */
  function init() {
    fetchAllItems();

    id("grid-setting").addEventListener("change", changeGrid);
    id("category-setting").addEventListener("change", changeCategory);

    id("btn-buy").addEventListener("click", setBuyView);
    id("btn-sell").addEventListener("click", setSellView);

    id("btn-view-login").addEventListener("click", setLoginView);
    id("to-login-form").addEventListener("click", toggleLoginCreateAcc);
    id("to-create-acc-form").addEventListener("click", toggleLoginCreateAcc);

    id("btn-expand-list").addEventListener("click", toggleExpandList);
    id("btn-create-listing").addEventListener("click", toggleListingForm);
    id("btn-cancel-list").addEventListener("click", toggleListingForm);

    id("btn-back").addEventListener("click", backToItemDisplay);

    id("btn-search").addEventListener("click", fetchItemQuery);
  }

  function hideAllViews() {
    id("login-view").classList.add("hidden");
    id("buy-view").classList.add("hidden");
    id("sell-view").classList.add("hidden");
    id("product-view").classList.add("hidden");
  }

  function setLoginView() {
    hideAllViews();
    id("login-view").classList.remove("hidden");
    id("create-account-form").classList.add("hidden");
    id("login-form").classList.remove("hidden");
  }

  function toggleLoginCreateAcc() {
    id("create-account-form").classList.toggle("hidden");
    id("login-form").classList.toggle("hidden");
  }

  /** Disables other views and refetches items, acts as "refresh" of items */
  function setBuyView() {
    hideAllViews();
    id("buy-view").classList.remove("hidden");
    resetItemDisplay();
    fetchAllItems();
  }

  /** Swaps from buy view to sell view */
  function setSellView() {
    hideAllViews();
    id("sell-view").classList.remove("hidden");
    resetItemDisplay();
    fetchListedItems();
  }

  /** Shows create new listing form */
  function toggleListingForm() {
    id("create-listing").classList.toggle("hidden");
    id("btn-create-listing").classList.toggle("no-bottom-radius");
  }

  /** Swaps from product page to grid */
  function backToItemDisplay() {
    id("buy-view").classList.remove("hidden");
    id("product-view").classList.add("hidden");
  }

  /**
   * Fetches items to populate item display
   * TODO: fetch from API and make async when doing API call
   */
  function fetchAllItems() {
    for (let i = 0; i < MOCK_ITEMS.length; i++) {
      createCard(MOCK_ITEMS[i], true);
    }
  }

  /**
   * Fetches item from API from query
   * TODO: fetch from API and make async
   * @returns {null} - nothing :D for now
   */
  function fetchItemQuery() {
    return null;
  }

  /** Deletes products on display */
  function resetItemDisplay() {
    id("item-display").innerHTML = "";
    id("listed-item-display").innerHTML = "";
  }

  function fetchListedItems() {
    if (loggedIn) {
      qs("#sell-view > p").classList.add("hidden");
      id("logged-in-view").classList.remove("hidden");
      id("listed-item-display").classList.add("hide-items")

      let listedItems = MOCK_ITEMS;
      if (listedItems.length > 0) {
        qs("#logged-in-view > p").classList.add("hidden");
        for (let i = 0; i < listedItems.length; i++) {
          createCard(MOCK_ITEMS[i], false);
        }
        if (listedItems.length > 3) {
          id("btn-expand-list").classList.remove("hidden");
        } else {
          id("btn-expand-list").classList.add("hidden");
        }
      } else {
        qs("#logged-in-view > p").classList.remove("hidden");
      }

    } else {
      qs("#sell-view > p").classList.remove("hidden");
      id("logged-in-view").classList.add("hidden");
    }
  }

  function toggleExpandList() {
    id("listed-item-display").classList.toggle("hide-items")
  }

  /**
   * Creates product card
   * @param {Object} item - item JSON object info
   */
  function createCard(item, isMain) {
    let card = gen("div");
    let thumb = genProductImg(item);
    let itemInfo = genProductInfo(item);
    card.appendChild(thumb);
    card.appendChild(itemInfo);
    if (isMain) {
      card = applyCurrSettings(card, item);
      id("item-display").appendChild(card);
      card.addEventListener("click", () => showProductPage(item.productID));
    } else {
      card.classList.add("card");
      id("listed-item-display").appendChild(card);
      // create/add edit button
    }
    
  }

  /**
   * Creates product thumbnail element
   * @param {Object} item - item JSON object info
   * @returns {Element} - thumbnail element
   */
  function genProductImg(item) {
    let thumb = gen("img");
    thumb.classList.add("product-thumb");
    thumb.src = item.thumb;
    thumb.alt = item.productName;
    return thumb;
  }

  /**
   * Creates product info element
   * @param {Object} item - item JSON object info
   * @returns {Element} - item info element
   */
  function genProductInfo(item) {
    let itemInfo = gen("section");
    let productName = gen("h2");
    let subInfo = gen("section");
    let price = gen("p");
    let category = gen("p");
    let description = gen("p");

    itemInfo.classList.add("item-info");
    subInfo.classList.add("item-subinfo");
    price.classList.add("price-tag");
    category.classList.add("category-tag");
    description.classList.add("item-description");

    productName.textContent = item.productName;
    price.textContent = formatCurrency(item.price);
    category.textContent = item.category;
    description.textContent = item.description;

    itemInfo.appendChild(productName);
    itemInfo.appendChild(subInfo);
    itemInfo.appendChild(description);
    subInfo.appendChild(price);
    subInfo.appendChild(category);

    return itemInfo;
  }

  /**
   * Applies current settings in item display to the given card
   * @param {Element} card - product card
   * @param {Object} item - item JSON object info
   * @returns {Element} - product card
   */
  function applyCurrSettings(card, item) {
    card.classList.add("card");
    if (id("grid-setting").firstElementChild.checked) {
      card.classList.add("tile");
    } else {
      card.classList.add("row");
    }
    let catSetting = getCatSetting();
    if (catSetting !== "all" && catSetting !== item.category.toLowerCase()) {
      card.classList.add("hidden");
    }
    return card;
  }

  /**
   * Formats given price into USD format
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
   * @param {Number} price - price number to format
   * @returns {String} - formatted price
   */
  function formatCurrency(price) {
    let currencyFormat = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD"});
    return currencyFormat.format(price);
  }

  /**
   * Shows product page of clicked on product
   * TODO: async re-fetch item info
   * @param {String} productID - ID of product for database
   */
  function showProductPage(productID) {
    // temp item - instead fetch from API
    let item = MOCK_ITEMS[productID];
    // let productEl = id("product-display");

    let imageEl = id("product-image");
    imageEl.src = item.thumb;
    imageEl.alt = item.productName;

    qs("#product-display h2").textContent = item.productName;
    qs("#product-display .category-tag").textContent = item.category;
    qs("#product-display .price-tag").textContent = formatCurrency(item.price);
    qs("#product-display .item-description").textContent = item.description;
    qs("#product-display .item-stock").textContent = "In stock: " + item.stock;

    id("buy-view").classList.add("hidden");
    id("product-view").classList.remove("hidden");
  }

  /** Toggles grid/row view in item display */
  function changeGrid() {
    let checkbox = this.firstElementChild;
    let cards = qsa(".card");
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      if (checkbox.checked) {
        card.classList.remove("row");
        card.classList.add("tile");
      } else {
        card.classList.remove("tile");
        card.classList.add("row");
      }
    }
  }

  /** On cataegory change updates items displayed to align with what category is selected */
  function changeCategory() {
    let category = getCatSetting();
    let cards = qsa(".card");
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];

      // instead get from database when working? or diff way to store category tag?
      // INTSRUCTOR: a good way to change the items based on the selected category would be filtering on that category when you retrieve items to display--this is required feature 5 (search)!
      let productCategory = qs(".category-tag", card).textContent.toLowerCase();
      if (productCategory === category || category === "all") {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    }
  }

  /**
   * Gets current selected category setting
   * @returns {String} - category setting
   */
  function getCatSetting() {
    let categorySelect = qs("#category-setting select");
    return categorySelect.options[categorySelect.selectedIndex].value;
  }

  /**
   * Create element from given tag name - took from CSE 154 Lecture 07 slides
   * @param {String} tagName - name of HTML element created
   * @return {Element} - HTML element with given name
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Get element from id shortcut - took from CSE 154 Lecture 07 slides
   * @param {String} id - id of HTML element
   * @return {Element} - HTML element with given id
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Query selector shortcut - adapted from CSE 154 Lecture 07 slides
   * @param {Element} node - HTML element to start query from
   * @param {String} selector - class name to get HTML element
   * @return {Element} - HTML element with given selector under given node
   */
  function qs(selector, node = document) {
    return node.querySelector(selector);
  }

  /**
   * Query selector all shortcut - took from CSE 154 Lecture 07 slides
   * @param {String} selector - class name of HTML element
   * @return {NodeList<Element>} - list of HTML elements with given class name
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

})();