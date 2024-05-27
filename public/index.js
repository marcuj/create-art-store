/*
 * Name: Marcus Jundt
 * Date: 4/24/2024
 * Section: CSE 154 AE
 *
 * This is the JS file which
 */

"use strict";
(function() {

  let loggedIn = false;
  let currUser = null; // BETTER WAY TO GET THIS INFO ???
  let currSearch = null;
  let currFilters = null;

  window.addEventListener("load", init);

  /**
   * Initializes functionality of buttons and fills items display with items
   */
  function init() {
    setBuyView();
    populateCategories();

    id("grid-setting").addEventListener("change", changeGrid);

    id("btn-buy").addEventListener("click", setBuyView);
    id("btn-sell").addEventListener("click", setSellView);

    id("btn-view-login").addEventListener("click", setLoginView);
    id("to-login-form").addEventListener("click", toggleLoginCreateAcc);
    id("to-create-acc-form").addEventListener("click", toggleLoginCreateAcc);

    id("btn-view-profile").addEventListener("click", setProfileView);
    id("btn-logout").addEventListener("click", userLogout);

    id("btn-expand-list").addEventListener("click", toggleExpandList);
    id("btn-create-listing").addEventListener("click", toggleListingForm);
    id("btn-cancel-list").addEventListener("click", toggleListingForm);

    id("btn-back").addEventListener("click", backToItemDisplay);

    id("btn-filter").addEventListener("click", toggleFilterView);

    id("btn-search").addEventListener("click", searchPopulate);
    id("btn-apply-filter").addEventListener("click", (evt) => {
      evt.preventDefault();
      filterPopulate();
    });
    id("btn-clear-filter").addEventListener("click", (evt) => {
      evt.preventDefault();
      clearFilterPopulate();
    });

    id("btn-login").addEventListener("click", (evt) => {
      evt.preventDefault();
      submitLogin();
    });

    id("btn-item-buy").addEventListener("click", setPurchaseView);
    id("btn-back-purchase").addEventListener("click", backToProductView);
    id("btn-confirm-buy").addEventListener("click", userBuyItem);
  }

  function hideAllViews() {
    resetItemDisplay();
    resetFilters();
    resetSearch();
    resetLoginRegister();
    id("list-form").reset();
    id("profile-view").classList.add("hidden");
    id("purchase-view").classList.add("hidden");
    id("login-view").classList.add("hidden");
    id("buy-view").classList.add("hidden");
    id("sell-view").classList.add("hidden");
    id("product-view").classList.add("hidden");
    id("filter-view").classList.add("hidden");
    id("right-column").classList.add("hidden");
    id("create-listing").classList.add("hidden");
    id("btn-create-listing").classList.remove("no-bottom-radius");
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
    resetLoginRegister();
  }

  /** Disables other views and refetches items, acts as "refresh" of items */
  function setBuyView() {
    hideAllViews();
    id("buy-view").classList.remove("hidden");
    populateAllItems();
  }

  /** Swaps from buy view to sell view */
  function setSellView() {
    hideAllViews();
    id("sell-view").classList.remove("hidden");
    populateSellItems();
  }

  function toggleFilterView() {
    id("filter-view").classList.toggle("hidden");
    id("right-column").classList.toggle("hidden");
  }

  function removeFilterView() {
    id("filter-view").classList.add("hidden");
    id("right-column").classList.add("hidden");
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

  function backToProductView() {
    id("product-view").classList.remove("hidden");
    id("purchase-view").classList.add("hidden");
    qs("#purchase-view .item-title").textContent = "";
    qs("#purchase-view .price-tag").textContent = "";
  }

  function setPurchaseView() {
    id("product-view").classList.add("hidden");
    id("purchase-view").classList.remove("hidden");
    qs("#purchase-view .success").classList.add("hidden");
    qs("#purchase-view .incorrect").classList.add("hidden");
    qs("#purchase-view .item-title").textContent = "Item: " + qs("#product-view .item-title").textContent;
    qs("#purchase-view .price-tag").textContent = "Price: " + qs("#product-view .price-tag").textContent;
  }

  function setProfileView() {
    hideAllViews();
    id("profile-view").classList.remove("hidden");
    qs("#profile-view h2").textContent = "Hello, " + currUser;
    populateTransactions();
  }

  /** Deletes products on display */
  function resetItemDisplay() {
    id("item-display").innerHTML = "";
    id("listed-item-display").innerHTML = "";
  }

  function resetLoginRegister() {
    qs("#login-form .missing").classList.add("hidden");
    qs("#login-form .incorrect").classList.add("hidden");
    qs("#login-form .success").classList.add("hidden");
    qs("#create-account-form .missing").classList.add("hidden");
    qs("#login-form > form").reset();
    qs("#create-account-form > form").reset();
  }

  function toggleLoginProfileBtns() {
    id("btn-view-login").classList.toggle("hidden");
    id("btn-view-profile").classList.toggle("hidden");
  }

  async function fetchItemByID(id) {
    let item = await fetch("/listings?id=" + id);
    await statusCheck(item);
    item = await item.json();
    return item[0];
  }

  async function populateTransactions() {
    try {
      let transactions = await fetch("/transactions?buyerUser=" + currUser);
      await statusCheck(transactions);
      transactions = await transactions.json();
      for (let i = 0; i < transactions.length; i++) {
        createTransactionCard(transactions[i]);
      }
      /**
      if (listedItems.length > 0) {
        qs("#logged-in-view > p").classList.add("hidden");
        for (let i = 0; i < listedItems.length; i++) {
          createCard(listedItems[i], false);
        }
        if (listedItems.length > 3) {
          id("btn-expand-list").classList.remove("hidden");
        } else {
          id("btn-expand-list").classList.add("hidden");
        }
      } else {
        let message = gen("p");
        message.textContent = "No items listed."
        id("listed-item-display").appendChild(message);
      }
      */
    } catch (err) {
      console.log(err);
handleError();
    }
  }

  async function createTransactionCard(transaction) {
    try {
      let item = await fetchItemByID(transaction.listingID);
      let card = gen("div");
      card.classList.add("card");
      let image = genProductImg(item);
      card.appendChild(image);
      let info = genTransactionInfo(transaction, item);
      card.appendChild(info);
      id("transaction-display").appendChild(card);
    } catch (err) {
      console.log(err);
      handleError()
    }
  }

  function genTransactionInfo(transaction, item) {
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

    productName.textContent = item.title;
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

  function userLogout() {
    setBuyView();
    toggleLoginProfileBtns();
    currUser = null;
    loggedIn = false;
  }

  async function userBuyItem() {
    try {
      setPurchaseBtnState(true);
      setHeaderBtnState(true);

      let idTag = qs("#product-view .id-tag").textContent;
      let id = idTag.substring(idTag.indexOf(":") + 2);
      
      let item = await fetchItemByID(id);

      let params = new FormData();
      params.append("listingID", id);
      params.append("sellerUser", item.username);
      params.append("buyerUser", currUser);
      params.append("cost", item.price);
      let buy = await fetch("/transactions/add", {method: "POST", body: params});
      await statusCheck(buy);
      let stock = await buy.text();
      qs("#purchase-view .success").classList.remove("hidden");
      qs("#product-view .item-stock").textContent = "(" + stock + " available)";
      
      setTimeout(function() {
        backToProductView();
        setPurchaseBtnState(false);
        setHeaderBtnState(false);
      }, 2000);
    } catch (err) {
      console.log(err);

      qs("#purchase-view .incorrect").classList.remove("hidden");
      setPurchaseBtnState(false);
      setHeaderBtnState(false);
      
      console.log(err);
handleError();
    }
  }

  async function submitLogin() {
    try {
      qs("#login-form .missing").classList.add("hidden");
      qs("#login-form .incorrect").classList.add("hidden");
      qs("#login-form .success").classList.add("hidden");
      let params = new FormData(qs("#login-form > form"));
      
      if (!params.get("username") || !params.get("password")) {
        qs("#login-form .missing").classList.remove("hidden");
      } else {
        setLoginBtnState(true);
        setHeaderBtnState(true);

        let login = await fetch("/login", {method: "POST", body: params});
        await statusCheck(login);
        let user = await login.text();
        qs("#login-form .success").classList.remove("hidden");
        
        console.log(user);
        loggedIn = true;
        currUser = user;

        setTimeout(function() {
          setBuyView();
          setLoginBtnState(false);
          setHeaderBtnState(false);
          toggleLoginProfileBtns();
        }, 1000);
      }
    } catch (err) {
      qs("#login-form .incorrect").classList.remove("hidden");
      setLoginBtnState(false);
      setHeaderBtnState(false);
      console.log(err);
handleError();
    }
  }

  function setLoginBtnState(isOff) {
    id("btn-login").disabled = isOff;
    id("to-create-acc-form").disabled = isOff;
    id("btn-create-acc").disabled = isOff;
    id("to-login-form").disabled = isOff;
  }

  function setHeaderBtnState(isOff) {
    id("btn-view-login").disabled = isOff;
    id("btn-view-profile").disabled = isOff;
    id("btn-buy").disabled = isOff;
    id("btn-sell").disabled = isOff;
  }

  function setPurchaseBtnState(isOff) {
    id("btn-confirm-buy").disabled = isOff;
    id("btn-back-purchase").disabled = isOff;
  }

  function populateSellItems() {
    if (loggedIn) {
      qs("#sell-view > p").classList.add("hidden");
      id("logged-in-view").classList.remove("hidden");
      id("listed-item-display").classList.add("hide-items")

      let listedItems = [];
      if (listedItems.length > 0) {
        qs("#logged-in-view > p").classList.add("hidden");
        for (let i = 0; i < listedItems.length; i++) {
          createCard(listedItems[i], false);
        }
        if (listedItems.length > 3) {
          id("btn-expand-list").classList.remove("hidden");
        } else {
          id("btn-expand-list").classList.add("hidden");
        }
      } else {
        let message = gen("p");
        message.textContent = "No items listed."
        id("listed-item-display").appendChild(message);
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
   * Populates items from search query and filters if applied
   */
  async function searchPopulate() {
    try {
      currSearch = id("search-inp").value.trim();
      await populateItems();
    } catch (err) {
      console.log(err);
handleError();
    }
  }

  function resetSearch() {
    id("search-inp").value = "";
    currSearch = null;
  }

  /**
   * Populates items from filters and search query if previously searched
   */
  async function filterPopulate() {
    try {
      currFilters = [getCatFilter()[0], getPriceFilter()];
      await populateItems();
    } catch (err) {
      console.log(err);
handleError();
    }
  }

  function clearFilterPopulate() {
    resetFilters();
    filterPopulate();    
  }

  function resetFilters() {
    currFilters = null;
    id("filter-info").classList.add("hidden");
    qs("#filter-view > form").reset();
  }

  /**
   * Populates home page with all yips
   */
  async function populateAllItems() {
    try {
      let items = await fetch("/listings");
      await statusCheck(items);
      items = await items.json();
      addItemCards(items);
    } catch (err) {
      
      console.log(err);
handleError();
    }
  }

  async function populateItems() {
    try {
      resetItemDisplay();
      id("filter-info").innerHTML = "";
    
      let url = "/listings?";
      let filter = gen("p");
      filter.classList.add("applied-filter");
      
      console.log(currSearch);
      if (currSearch) {
        let searchFilter = filter.cloneNode();
        searchFilter.textContent = "Search: " + currSearch;
        id("filter-info").appendChild(searchFilter);
        url = url + "search=" + currSearch + "&";
      }
      if (currFilters) {
        let category = currFilters[0];
        let price = currFilters[1];
        if (category === "all" && price[0] === "any" && price[1] === "any") {
          id("filter-info").classList.add("hidden");
        } else {
          id("filter-info").classList.remove("hidden");
          
          if (category !== "all") {
            let catFilter = filter.cloneNode();
            catFilter.textContent = getCatFilter()[1];
            id("filter-info").appendChild(catFilter);
            url = url + "category=" + category + "&";
          }
          if (price[0] !== "any") {
            let lowFilter = filter.cloneNode();
            lowFilter.textContent = "Above " + formatCurrency(price[0]);
            id("filter-info").appendChild(lowFilter);
            url = url + "lowerPrice=" + price[0] + "&";
          }
          if (price[1] !== "any") {
            let upperFilter = filter.cloneNode();
            upperFilter.textContent = "Below " + formatCurrency(price[1]);
            id("filter-info").appendChild(upperFilter);
            url = url + "upperPrice=" + price[1] + "&";
          }
        }
      }
      url = url.substring(0, url.length - 1);

      let items = await fetch(url);
      await statusCheck(items);
      items = await items.json();
      addItemCards(items);
      currFilters = [category, price];

    } catch (err) {
      
    }
  }

  /**
   * Gets current selected category setting
   * @returns {String} - category setting
   */
  function getCatFilter() {
    let categorySelect = qs("#category-setting select");
    let selected = categorySelect.options[categorySelect.selectedIndex];
    return [selected.value, selected.textContent];
  }

  function getPriceFilter() {
    let options = qsa("#price-setting input");
    let result = [];
    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      if (option.checked) {
        if (option.value === "custom") {
          let lower = id("lower-price").value;
          let upper = id("upper-price").value;

          if (lower !== "") {
            result.push(Number(lower));
          } else {
            result.push("any");
          }
          if (upper !== "") {
            result.push(Number(upper));
          } else {
            result.push("any");
          }
        } else {
          let split = option.value.split("-");
          result = [split[0], split[2]];
        }
      }
    }
    return result;
  }

  async function addItemCards(items) {
    if (items.length === 0) {
      let message = gen("p");
      message.textContent = "No items found."
      id("item-display").appendChild(message);
    } else {
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.category = await getCategoryName(item.category);
        createCard(item, true);
      }
    }
  }

  async function populateCategories() {
    try {
      let cats = await fetch("/category");
      await statusCheck(cats);
      cats = await cats.json();
      for (let i = 0; i < cats.length; i++) {
        let cat = cats[i];
        let selectFilter = qs("#category-setting select");
        let selectList = qs("#category-input");
        let option1 = gen('option');
        option1.value = cat.id;
        let option2 = option1.cloneNode();
        option1.textContent = cat.name;
        option2.textContent = cat.name;
        selectFilter.appendChild(option1);
        selectList.appendChild(option2);
      }
    } catch (err) {
      console.log(err);
handleError();
    }
  }

  /**
   * Creates product card
   * @param {Object} item - item JSON object info
   */
  function createCard(item, isMain) {
    let card = gen("div");
    let image = genProductImg(item);
    let itemInfo = genProductInfo(item);
    card.appendChild(image);
    card.appendChild(itemInfo);
    if (isMain) {
      card = applyCurrSettings(card, item);
      id("item-display").appendChild(card);
      card.addEventListener("click", () => showProductPage(item.id));
    } else {
      card.classList.add("card");
      id("listed-item-display").appendChild(card);
      // create/add edit button
    }
  }

  /**
   * Creates product image element
   * @param {Object} item - item JSON object info
   * @returns {Element} - image element
   */
  function genProductImg(item) {
    let image = gen("img");
    image.classList.add("product-thumb");
    image.src = item.image;
    image.alt = item.title;
    return image;
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

    productName.textContent = item.title;
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

  async function getCategoryName(id) {
    try {
      let name = await fetch("/category?id=" + id);
      await statusCheck(name);
      name = await name.text();
      return name;
    } catch (err) {
      console.log(err);
handleError();
    }
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
   * @param {Number} id - ID of product for database
   */
  async function showProductPage(itemID) {
    try {
      let item = await fetch("/listings?id=" + itemID);
      await statusCheck(item);
      item = await item.json();
      item = item[0];

      let imageEl = id("product-image");
      imageEl.src = item.image;
      imageEl.alt = item.title;

      qs("#product-view h2").textContent = item.title;
      qs("#product-view .category-tag").textContent = await getCategoryName(item.category);
      qs("#product-view .price-tag").textContent = formatCurrency(item.price);
      qs("#product-view .item-description").textContent = item.description;
      qs("#product-view .item-stock").textContent = "(" + item.stock + " available)";
      qs("#product-view .user-tag").textContent = "Sold by: " + item.username;
      qs("#product-view .id-tag").textContent = "ID: " + itemID;

      if (loggedIn) {
        qs("#product-view .log-in-warning").classList.add("hidden");
        id("btn-item-buy").disabled = false;
      } else {
        qs("#product-view .log-in-warning").classList.remove("hidden");
        id("btn-item-buy").disabled = true;
      }

      removeFilterView();
      id("buy-view").classList.add("hidden");
      id("product-view").classList.remove("hidden");
    } catch (err) {
      console.log(err);
      console.log(err);
handleError();
    }
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

  /**
   * Displays error view, hides other views, disables buttons and search bar within navigation bar
   */
  function handleError() {
    console.log("Oh, error!")
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