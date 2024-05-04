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
    description: "The Large Egg is a very large egg. This is perfect for large omelette! Buy this now to get a large egg! Please buy this!",
    stock: 24
  },
  {
    thumb: "",
    productName: "Long Egg",
    productID: 1,
    price: 12,
    category: "Egg",
    categoryID: "egg",
    description: "The Long Egg is a very long egg. This is perfect for long omelette! Buy this now to get a long egg! Please buy this!",
    stock: 3
  },
  {
    thumb: "",
    productName: "Big Chicken",
    productID: 2,
    price: 49.99,
    category: "Chicken",
    categoryID: "chicken",
    description: "This is a description for Big Chicken! It is a big chicken that can be used for making big chicken salad! Enjoy.",
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
    description: "This is a description for Tiny Chicken! It is a tiny chicken that can be used for making tiny chicken salad! Enjoy.",
    stock: 5031
  }];

  window.addEventListener("load", init);

  /**
   * Initializes the
   */
  function init() {
    fetchAllItems();

    id("grid-setting").addEventListener("change", changeGrid);
    id("category-setting").addEventListener("change", changeCategory);

    id("btn-buy").addEventListener("click", setBuyView);
    id("btn-sell").addEventListener("click", setSellView);

    id("btn-create-listing").addEventListener("click", displayListingForm); // ?

    id("btn-back").addEventListener("click", backToItemDisplay);

    // product search API fetch
    // id("btn-search").addEventListener("click", fetchItemQuery);
  }

  /** disables other views and refetches items, acts as "refresh" */
  function setBuyView() {
      id("buy-view").classList.remove("hidden");
      id("sell-view").classList.add("hidden");
      id("product-view").classList.add("hidden");
      resetItemDisplay();
      fetchAllItems();
  }


  /** buy view to sell view */
  function setSellView() {
    id("buy-view").classList.add("hidden");
    id("product-view").classList.add("hidden");
    id("sell-view").classList.remove("hidden");
    resetItemDisplay();
  }

  /** shows create new listing form */
  function displayListingForm() {
    id("create-listing").classList.remove("hidden");
  }

  /** from product page to grid */
  function backToItemDisplay() {
    id("buy-view").classList.remove("hidden");
    id("product-view").classList.add("hidden");
  }

  /** make async when doing API call */
  function fetchAllItems() {
    for (let i = 0; i < 6; i++) {
      createCard(MOCK_ITEMS[i]);
    }
  }

  /** Fetches item from API from query */
  async function fetchItemQuery() {

  }

  /** Deletes products on display */
  function resetItemDisplay(){
    id("item-display").innerHTML = "";
  }

  /** Creates product card */
  function createCard(item) {
    let card = gen("div");
    let thumb = gen("img");
    let itemInfo = gen("section");
    let productName = gen("h2");
    let subInfo = gen("section");
    let price = gen("p");
    let category = gen("p");
    let description = gen("p");

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
    thumb.classList.add("product-thumb");
    itemInfo.classList.add("item-info");
    subInfo.classList.add("item-subinfo");
    price.classList.add("price-tag");
    category.classList.add("category-tag");
    description.classList.add("item-description");

    thumb.src = item.thumb;
    thumb.alt = item.productName;
    productName.textContent = item.productName;
    price.textContent = formatCurrency(item.price);
    category.textContent = item.category;
    description.textContent = item.description;

    card.appendChild(thumb);
    card.appendChild(itemInfo);
    itemInfo.appendChild(productName);
    itemInfo.appendChild(subInfo);
    itemInfo.appendChild(description);
    subInfo.appendChild(price);
    subInfo.appendChild(category);

    id("item-display").appendChild(card);
    card.addEventListener("click", () => showProductPage(item.productID));
  }

  /** https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat */
  function formatCurrency(price) {
    let currencyFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    return currencyFormat.format(price);
  }

  /** async re-fetch item info */
  function showProductPage(productID) {
    // temp item - instead fetch from API
    let item = MOCK_ITEMS[productID];
    let productEl = id("product-display");

    let imageEl = id("product-image");
    imageEl.src = item.thumb;
    imageEl.alt = item.productName;

    qs(productEl, "h2").textContent = item.productName;
    qs(productEl, ".category-tag").textContent = item.category;
    qs(productEl, ".price-tag").textContent = formatCurrency(item.price);
    qs(productEl, ".item-description").textContent = item.description;
    qs(productEl, ".item-stock").textContent = "In stock: " + item.stock;

    id("buy-view").classList.add("hidden");
    id("product-view").classList.remove("hidden");
  }

  /** swaps grid to row or row to grid */
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

  /** on cataegory change updates items displayed to align with what category is selected */
  function changeCategory() {
    let category = getCatSetting();
    let cards = qsa(".card");
    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      let productCategory = qs(card, ".category-tag").textContent.toLowerCase(); // instead get from database when working? or diff way to store category tag?
      if (productCategory === category || category === "all") {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    }
  }

  /** gets current selected category setting */
  function getCatSetting() {
    let categorySelect = qs(id("category-setting"), "select");
    return categorySelect.options[categorySelect.selectedIndex].value;
  }


  /** Displays red text error message (called when an error is caught) */
  function displayError() {
    let errorEl = gen("p");
    errorEl.textContent = "Error, couldn't load product.";
    errorEl.classList.add("error");
    id("results").appendChild(errorEl);
  }

  /**
   * Checks if the given API reponse's status is OK.
   * Throws error if not OK and doesn't return the response - took from Lecture 14 slides
   * @param {Promise} response - API response (if response is ok)
   */
  async function statusCheck(response) {
    if (!response.ok) {
      throw new Error(await response.text());
    }
    return response;
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
  function qs(node = document, selector) {
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