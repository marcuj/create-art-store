/*
 * Name: Marcus Jundt
 * Date: 4/24/2024
 * Section: CSE 154 AE
 *
 * This is the JS file which
 */

"use strict";
(function() {

  const MOCK_ITEM = {
    thumb: "",
    productName: "Product name",
    productID: 1,
    price: 50,
    category: "Egg",
    categoryID: "egg",
    description: "This is a description for Product name! What is up"
  };

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

    // product search API fetch
    // id("btn-search").addEventListener("click", fetchItemQuery);
  }

  function setBuyView() {
      id("buy-view").classList.remove("hidden");
      id("sell-view").classList.add("hidden");
      resetItemDisplay();
      fetchAllItems();
  }

  function setSellView() {
    id("buy-view").classList.add("hidden");
    id("sell-view").classList.remove("hidden");
    resetItemDisplay();
  }

  function displayListingForm() {
    id("create-listing").classList.remove("hidden");
  }

  function setLoginView() {

  }

  function setProfileView() {

  }

  function hideCurrentView() {

  }

  // make async
  function fetchAllItems() {
    for (let i = 0; i < 5; i++) {
      createCard(MOCK_ITEM);
    }
  }

  async function fetchItemQuery() {

  }

  function resetItemDisplay(){
    id("item-display").innerHTML = "";
  }


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
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
    let currencyFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
    let formattedPrice = currencyFormat.format(item.price);
    price.textContent = formattedPrice;
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
  }

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