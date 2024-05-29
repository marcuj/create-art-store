/*
 * Name: Marcus Jundt
 * Date: 5/28/2024
 * Section: CSE 154 AE
 *
 * This is the JS file which adds functionality for the Create website. Populates the site with
 * items, allows filtering and search of items, gives functionality to all buttons for navigation.
 * Allows for posting to server when buying, selling, logging in, logging out, and
 * registering an account.
 */

"use strict";
(function() {

  let loggedIn = null;
  let currUser = null;
  let currSearch = null;
  let currFilters = null;

  const SEC = 1000;

  window.addEventListener("load", init);

  /**
   * Initializes functionality of buttons, fills main item display with items, and logn in user
   * if a previous user login is remembered.
   */
  function init() {
    initLogin();
    setBuyView();
    populateCategories();

    initBuyViewBtns();
    initSellViewBtns();
    initLoginBtns();
  }

  /** Initializes functionality for buttons in the buy view. */
  function initBuyViewBtns() {
    qs("header h1").addEventListener("click", setBuyView);
    id("btn-buy").addEventListener("click", setBuyView);
    id("grid-setting").addEventListener("change", changeGrid);
    id("btn-item-buy").addEventListener("click", setPurchaseView);
    id("btn-back-purchase").addEventListener("click", backToProductView);
    id("btn-confirm-buy").addEventListener("click", userBuyItem);
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
  }

  /** Initializes functionality for buttons in the sell view. */
  function initSellViewBtns() {
    id("btn-sell").addEventListener("click", setSellView);
    id("btn-expand-list").addEventListener("click", toggleExpandList);
    id("btn-create-listing").addEventListener("click", toggleListingForm);
    id("btn-cancel-list").addEventListener("click", toggleListingForm);
    id("btn-list").addEventListener("click", (evt) => {
      evt.preventDefault();
      userSellItem();
    });
  }

  /** Initializes functionality for buttons in the login/register view. */
  function initLoginBtns() {
    let warnings = qsa(".log-in-warning");
    for (let i = 0; i < warnings.length; i++) {
      warnings[i].addEventListener("click", setLoginView);
    }
    id("btn-login").addEventListener("click", (evt) => {
      evt.preventDefault();
      submitLogin();
    });
    id("btn-create-acc").addEventListener("click", (evt) => {
      evt.preventDefault();
      submitRegister();
    });
    id("btn-view-login").addEventListener("click", setLoginView);
    id("to-login-form").addEventListener("click", toggleLoginCreateAcc);
    id("to-create-acc-form").addEventListener("click", toggleLoginCreateAcc);
    id("btn-view-profile").addEventListener("click", setProfileView);
    id("btn-logout").addEventListener("click", userLogout);
  }

  /** Hides all views and resets all forms and warning messages. */
  function hideAllViews() {
    qs("header .incorrect").classList.add("hidden");
    resetItemDisplay();
    resetFilters();
    resetSearch();
    resetLoginRegister();
    resetListingForm();
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

  /**
   * Sets the main view to the login screen. Allows for autocomplete of username if previously
   * logged in.
   */
  function setLoginView() {
    hideAllViews();
    let prevUser = gen("option");
    prevUser.value = window.localStorage.getItem("prev-user");
    id("prev-username").innerHTML = "";
    id("prev-username").appendChild(prevUser);
    id("login-view").classList.remove("hidden");
    id("create-account-form").classList.add("hidden");
    id("login-form").classList.remove("hidden");
  }

  /** Toggles between viewing login form and create account form. Resets the forms to default. */
  function toggleLoginCreateAcc() {
    id("create-account-form").classList.toggle("hidden");
    id("login-form").classList.toggle("hidden");
    resetLoginRegister();
  }

  /** Disables other views, sets the buy view, and populates items to buy. */
  function setBuyView() {
    hideAllViews();
    id("buy-view").classList.remove("hidden");
    populateAllItems();
  }

  /**
   * Disables other views, sets the sell view. If not logged in, prompts the user to login.
   * If logged in, shows the user the items they have listed on the store, and shows form to
   * list a new item.
   */
  function setSellView() {
    hideAllViews();
    id("sell-view").classList.remove("hidden");
    populateSellItems();
  }

  /** Toggles the filter menu. */
  function toggleFilterView() {
    id("filter-view").classList.toggle("hidden");
    id("right-column").classList.toggle("hidden");
  }

  /** Removes the filter menu. */
  function removeFilterView() {
    id("filter-view").classList.add("hidden");
    id("right-column").classList.add("hidden");
  }

  /** Shows create new listing form on the sell view. */
  function toggleListingForm() {
    id("create-listing").classList.toggle("hidden");
    id("btn-create-listing").classList.toggle("no-bottom-radius");
  }

  /** Resets the new listing form on the sell view to default values. */
  function resetListingForm() {
    clearListMessages();
    id("list-form").reset();
  }

  /** Removes product page and returns to the item view. */
  function backToItemDisplay() {
    id("buy-view").classList.remove("hidden");
    id("product-view").classList.add("hidden");
  }

  /** Removes the confirm purchase menu and goes back to the product page. */
  function backToProductView() {
    id("product-view").classList.remove("hidden");
    id("purchase-view").classList.add("hidden");
    qs("#purchase-view .item-title").textContent = "";
    qs("#purchase-view .price-tag").textContent = "";
  }

  /**
   * Shows the confirm purchase menu.
   * Shows item information for the specific item that was clicked on to buy.
   */
  function setPurchaseView() {
    id("product-view").classList.add("hidden");
    id("purchase-view").classList.remove("hidden");
    qs("#purchase-view .success").classList.add("hidden");
    qs("#purchase-view .incorrect").classList.add("hidden");
    qs("#purchase-view .item-title").textContent = "Item: " +
      qs("#product-view .item-title").textContent;
    qs("#purchase-view .price-tag").textContent = "Price: " +
      qs("#product-view .price-tag").textContent;
  }

  /** Hides all other view, shows the profile view. Only available if logged in. */
  function setProfileView() {
    hideAllViews();
    id("profile-view").classList.remove("hidden");
    qs("#profile-view h2").textContent = "Hello, " + currUser;
    populateTransactions();
  }

  /**
   * Deletes the item cards in the menus (buy view, sell view, transactions)
   * containing item cards.
   */
  function resetItemDisplay() {
    id("item-display").innerHTML = "";
    id("listed-item-display").innerHTML = "";
    id("transaction-display").innerHTML = "";
  }

  /** Clears the login/register forms and any success/warning messages. */
  function resetLoginRegister() {
    clearLoginMessages();
    clearRegisterMessages();
    qs("#login-form > form").reset();
    qs("#create-account-form > form").reset();
  }

  /** Toggles between the login button and profile button (one replaces the other). */
  function toggleLoginProfileBtns() {
    id("btn-view-login").classList.toggle("hidden");
    id("btn-view-profile").classList.toggle("hidden");
  }

  /** Logs the user in if the user's login was remembered. */
  async function initLogin() {
    try {
      let cookie = await fetch("/storage");
      await statusCheck(cookie);
      cookie = await cookie.text();
      if (cookie) {
        currUser = cookie;
        loggedIn = true;
        toggleLoginProfileBtns();
      }
    } catch (err) {
      handleError("header", err);
    }
  }

  /**
   * Gets item listing information by the listing ID.
   * @param {Number} id - listing ID
   * @returns {Object} - listing information
   */
  async function fetchItemByID(id) {
    try {
      let item = await fetch("/listings?id=" + id);
      await statusCheck(item);
      item = await item.json();
      return item[0];
    } catch (err) {
      handleError("header", err);
    }
  }

  /** Fills in user transactions in their profile if they are logged in. */
  async function populateTransactions() {
    try {
      id("transaction-display").innerHTML = "";
      qs("#transaction-container .incorrect").classList.add("hidden");
      let transactions = await fetch("/transactions?buyerUser=" + currUser);
      await statusCheck(transactions);
      transactions = await transactions.json();

      if (transactions.length > 0) {
        id("transaction-display").classList.add("hide-items");
        qs("#transaction-container > p").classList.add("hidden");
        for (let i = 0; i < transactions.length; i++) {
          createTransactionCard(transactions[i]);
        }
        if (transactions.length > 3) {
          id("btn-expand-transactions").classList.remove("hidden");
        } else {
          id("btn-expand-transactions").classList.add("hidden");
        }
      } else {
        qs("#transaction-container > p").classList.remove("hidden");
      }
    } catch (err) {
      handleError("#transaction-container", err);
    }
  }

  /**
   * Creates card showing information of a transaction. Shows amount spent, date placed,
   * the user it was purchased from, and the order number.
   * @param {Object} transaction - transaction information
   */
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
      handleError("#transaction-container", err);
    }
  }

  /**
   * Generates an element displaying a transaction's information. Includes amount spent,
   * date placed, the user it was purchased from, and the order number.
   * @param {Object} transaction - transaction information
   * @param {Object} item - item listing information
   * @returns {Element} - element containing transaction information
   */
  function genTransactionInfo(transaction, item) {
    let itemInfo = gen("section");
    itemInfo.classList.add("item-info");
    let productName = gen("h2");
    productName.textContent = item.title;
    let label = gen("span");
    label.classList.add("label");

    let price = genPriceEl(label, transaction);
    let date = genDateEl(label, transaction);
    let seller = genSellerEl(label, transaction);
    let transactionID = genTransactionIDEl(label, transaction);

    itemInfo.appendChild(productName);
    itemInfo.appendChild(price);
    itemInfo.appendChild(date);
    itemInfo.appendChild(seller);
    itemInfo.appendChild(transactionID);

    return itemInfo;
  }

  /**
   * Generates price element for transaction card
   * @param {Element} label - label base element
   * @param {Object} transaction - transaction information
   * @returns {Element} - price element
   */
  function genPriceEl(label, transaction) {
    let price = gen("p");
    price.classList.add("price-tag");
    let priceLabel = label.cloneNode();
    priceLabel.textContent = "Total ";
    price.textContent = formatCurrency(transaction.cost);
    price.prepend(priceLabel);
    return price;
  }

  /**
   * Generates date element for transaction card
   * @param {Element} label - label base element
   * @param {Object} transaction - transaction information
   * @returns {Element} - date element
   */
  function genDateEl(label, transaction) {
    let date = gen("p");
    let dateLabel = label.cloneNode();
    dateLabel.textContent = "Order placed ";
    date.textContent = (new Date(transaction.date)).toLocaleString();
    date.prepend(dateLabel);
    return date;
  }

  /**
   * Generates seller element for transaction card
   * @param {Element} label - label base element
   * @param {Object} transaction - transaction information
   * @returns {Element} - seller element
   */
  function genSellerEl(label, transaction) {
    let seller = gen("p");
    let sellerLabel = label.cloneNode();
    sellerLabel.textContent = "Bought from ";
    seller.textContent = transaction.sellerUser;
    seller.prepend(sellerLabel);
    return seller;
  }

  /**
   * Generates transaction ID element for transaction card
   * @param {Element} label - label base element
   * @param {Object} transaction - transaction information
   * @returns {Element} - transaction ID element
   */
  function genTransactionIDEl(label, transaction) {
    let transactionID = gen("p");
    let transactionIDLabel = label.cloneNode();
    transactionIDLabel.textContent = "Order # ";
    transactionID.textContent = transaction.id;
    transactionID.prepend(transactionIDLabel);
    return transactionID;
  }

  /** Logs the user out and un-remembers the user login. */
  async function userLogout() {
    try {
      let logout = await fetch("/logout", {method: "POST"});
      await statusCheck(logout);
      setBuyView();
      toggleLoginProfileBtns();
      currUser = null;
      loggedIn = false;

    } catch (err) {
      handleError("header", err);
    }
  }

  /**
   * Purchases the selected item for the current logged in user. Adds a transaction associated
   * to the user and decrements stock of the item by 1.
   */
  async function userBuyItem() {
    try {
      clearBuyMessages();
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
      }, 2 * SEC);
    } catch (err) {
      qs("#purchase-view .incorrect").classList.remove("hidden");
      setPurchaseBtnState(false);
      setHeaderBtnState(false);
    }
  }

  /** Clears success/failure messages which appear after purchasing an item. */
  function clearBuyMessages() {
    qs("#purchase-view .incorrect").classList.add("hidden");
    qs("#purchase-view .success").classList.add("hidden");
  }

  /** Clears login success/failure messages which appear after attempting a login. */
  function clearLoginMessages() {
    qs("#login-form .missing").classList.add("hidden");
    qs("#login-form .incorrect").classList.add("hidden");
    qs("#login-form .success").classList.add("hidden");
  }

  /** Clears account register success/failure messages which appear after attempting to register. */
  function clearRegisterMessages() {
    qs("#create-account-form .missing").classList.add("hidden");
    let msgs = qsa("#create-account-form .incorrect");
    for (let i = 0; i < msgs.length; i++) {
      msgs[i].classList.add("hidden");
    }
    qs("#create-account-form .success").classList.add("hidden");
  }

  /**
   * Takes login form and attempts login. If successful saves the login and changes the page to
   * reflect that a user is logged in.
   */
  async function submitLogin() {
    try {
      clearLoginMessages();
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

        window.localStorage.setItem("prev-user", user);

        await activateLogin(user);
      }
    } catch (err) {
      handleError("#login-form", err);
      setLoginBtnState(false);
      setHeaderBtnState(false);
    }
  }

  /**
   * Takes create account form and attempts to register an account.
   * Only successful if username does not already exist and the two passwords match.
   * If successful, logs in the user.
   */
  async function submitRegister() {
    try {
      clearRegisterMessages();
      let params = new FormData(qs("#create-account-form > form"));
      if (!params.get("username") || !params.get("password") || !params.get("confirm-password")) {
        qs("#create-account-form .missing").classList.remove("hidden");
      } else if (params.get("password") !== params.get("confirm-password")) {
        qsa("#create-account-form .incorrect")[0].classList.remove("hidden");
      } else {
        setLoginBtnState(true);
        setHeaderBtnState(true);
        let register = await fetch("/register", {method: "POST", body: params});
        await statusCheck(register);
        qs("#create-account-form .success").classList.remove("hidden");

        let user = params.get("username");
        let pw = params.get("password");

        let loginParams = new FormData();
        loginParams.append("username", user);
        loginParams.append("password", pw);
        let login = await fetch("/login", {method: "POST", body: params});
        await statusCheck(login);
        await activateLogin(params.get("username"));
      }
    } catch (err) {
      qsa("#create-account-form .incorrect")[1].classList.remove("hidden");
      qsa("#create-account-form .incorrect")[1].textContent = err;
      setLoginBtnState(false);
      setHeaderBtnState(false);
    }
  }

  /**
   * Changes the page to reflect that a user is logged in (shows profile button,
   * allows for buying/selling items). Returns to buy view.
   * @param {String} user - username logged in 
   */
  function activateLogin(user) {
    loggedIn = true;
    currUser = user;

    setTimeout(function() {
      setBuyView();
      setLoginBtnState(false);
      setHeaderBtnState(false);
      toggleLoginProfileBtns();
    }, SEC);
  }

  /**
   * Disables/enables login buttons.
   * @param {Boolean} isOff - true if want buttons turned off, false to turn on
   */
  function setLoginBtnState(isOff) {
    id("btn-login").disabled = isOff;
    id("to-create-acc-form").disabled = isOff;
    id("btn-create-acc").disabled = isOff;
    id("to-login-form").disabled = isOff;
  }

  /**
   * Disables/enables sell item buttons.
   * @param {Boolean} isOff - true if want buttons turned off, false to turn on
   */
  function setSellBtnState(isOff) {
    id("btn-list").disabled = isOff;
    id("btn-cancel-list").disabled = isOff;
    id("btn-create-listing").disabled = isOff;
  }

  /**
   * Disables/enables header navigation buttons.
   * @param {Boolean} isOff - true if want buttons turned off, false to turn on
   */
  function setHeaderBtnState(isOff) {
    id("btn-view-login").disabled = isOff;
    id("btn-view-profile").disabled = isOff;
    id("btn-buy").disabled = isOff;
    id("btn-sell").disabled = isOff;
  }

  /**
   * Disables/enables purchase item buttons.
   * @param {Boolean} isOff - true if want buttons turned off, false to turn on
   */
  function setPurchaseBtnState(isOff) {
    id("btn-confirm-buy").disabled = isOff;
    id("btn-back-purchase").disabled = isOff;
  }

  /** Clears warning/success messages which appear after attempting to list a new item. */
  function clearListMessages() {
    qs("#list-form .missing").classList.add("hidden");
    qs("#list-form .incorrect").classList.add("hidden");
    qs("#list-form .success").classList.add("hidden");
  }

  /**
   * Takes in given form information and lists a new item to the store
   * associated to logged in user.
   */
  async function userSellItem() {
    try {
      clearListMessages();
      let params = new FormData(id("list-form"));
      params.append("username", currUser);
      if (
        (!params.get("title") || !params.get("category") || !params.get("stock")) ||
        (!params.get("price") || !params.get("description") || !params.get("image"))
      ) {
        qs("#list-form .missing").classList.remove("hidden");
      } else {
        setSellBtnState(true);
        setHeaderBtnState(true);
        let list = await fetch("/listings/add", {method: "POST", body: params});
        await statusCheck(list);
        qs("#list-form .success").classList.remove("hidden");
        setTimeout(function() {
          setSellView();
          setSellBtnState(false);
          setHeaderBtnState(false);
        }, SEC);
      }
    } catch (err) {
      handleError("#list-form", err);
      setLoginBtnState(false);
      setHeaderBtnState(false);
    }
  }

  /** Shows items the the current logged in user has listed in the store in the sell view. */
  async function populateSellItems() {
    try {
      if (loggedIn) {
        clearSellItemsMessages();
        id("logged-in-view").classList.remove("hidden");
        let listedItems = await fetch("/listings?username=" + currUser);
        await statusCheck(listedItems);
        listedItems = await listedItems.json();
        if (listedItems.length > 0) {
          hideSellViewEls();
          for (let i = 0; i < listedItems.length; i++) {
            let item = listedItems[i];
            item.category = await getCategoryName(item.category);
            createCard(item, false);
          }
          if (listedItems.length > 3) {
            id("btn-expand-list").classList.remove("hidden");
          }
        } else {
          qs("#logged-in-view > div > p").classList.remove("hidden");
        }
      } else {
        qs("#sell-view .no-items").classList.remove("hidden");
        id("logged-in-view").classList.add("hidden");
      }
    } catch (err) {
      handleError("#sell-view", err);
    }
  }

  function hideSellViewEls() {
    id("listed-item-display").classList.add("hide-items");
    qs("#logged-in-view > div > p").classList.add("hidden");
    id("btn-expand-list").classList.add("hidden");
  }

  /** Clears "No items" and server error warning messages in the sell view. */
  function clearSellItemsMessages() {
    qs("#sell-view .no-items").classList.add("hidden");
    qs("#sell-view .incorrect").classList.add("hidden");
  }

  /** Toggles expansion of list of items in the sell view. */
  function toggleExpandList() {
    id("listed-item-display").classList.toggle("hide-items");
  }

  /** Populates items in buy view from search query and filters if applied. */
  async function searchPopulate() {
    try {
      currSearch = id("search-inp").value.trim();
      await populateItems();
    } catch (err) {
      handleError("#buy-view", err);
    }
  }

  /** Resets search input. */
  function resetSearch() {
    id("search-inp").value = "";
    currSearch = null;
  }

  /** Populates items in buy view from filters and search query if previously searched */
  async function filterPopulate() {
    try {
      currFilters = [getCatFilter()[0], getPriceFilter()];
      await populateItems();
    } catch (err) {
      handleError("#buy-view", err);
    }
  }

  /** Clears filters and populates items in buy view. */
  async function clearFilterPopulate() {
    try {
      resetFilters();
      await filterPopulate();
    } catch (err) {
      handleError("#buy-view", err);
    }
  }

  /** Resets current filters and the filter form values. */
  function resetFilters() {
    currFilters = null;
    qs("#filter-view > form").reset();
  }

  /** Populates buy view with all available items. */
  async function populateAllItems() {
    try {
      currFilters = null;
      currSearch = null;
      await populateItems();
    } catch (err) {
      handleError("#buy-view", err);
    }
  }

  /** Populates items in the buy view according to current search query and applied filters. */
  async function populateItems() {
    try {
      resetItemDisplay();
      qs("#buy-view .incorrect").classList.add("hidden");
      id("filter-info").innerHTML = "";

      let url = "/listings?";
      let filter = gen("p");
      filter.classList.add("applied-filter");

      if (currSearch) {
        let searchFilter = filter.cloneNode();
        searchFilter.textContent = "Search: " + currSearch;
        id("filter-info").appendChild(searchFilter);
        url = url + "search=" + currSearch + "&";
      }
      if (currFilters) {
        url = createFilters(url, filter);
      }
      url = url.substring(0, url.length - 1);

      let items = await fetch(url);
      await statusCheck(items);
      items = await items.json();
      addItemCards(items);

    } catch (err) {
      handleError("#buy-view", err);
    }
  }

  /**
   * Displays filter elements according to current filters and adds to fetch url for items.
   * @param {String} url - starting url to fetch items from
   * @param {Element} filter - base filter element
   * @returns {String} - final url to fetch items
   */
  function createFilters(url, filter) {
    let category = currFilters[0];
    let price = currFilters[1];

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
    return url;
  }

  /**
   * Gets current selected category setting in the filter menu.
   * @returns {String} - category setting
   */
  function getCatFilter() {
    let categorySelect = qs("#category-setting select");
    let selected = categorySelect.options[categorySelect.selectedIndex];
    return [selected.value, selected.textContent];
  }

  /**
   * Gets current selected price setting in the filter menu.
   * @returns {Array} - [lower bound, upper bound] for the price of items
   */
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

  /**
   * Adds cards for each item in the list to the buy view.
   * @param {Array} items - list of objects containing individual item information
   */
  async function addItemCards(items) {
    try {
      if (items.length === 0) {
        let message = gen("p");
        message.textContent = "No items found.";
        id("item-display").appendChild(message);
      } else {
        for (let i = 0; i < items.length; i++) {
          let item = items[i];
          item.category = await getCategoryName(item.category);
          createCard(item, true);
        }
      }
    } catch (err) {
      handleError("header", err);
    }
  }

  /** Populates the filter form and list item form with the available categories for items. */
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
      handleError("header", err);
    }
  }

  /**
   * Creates product card. Displays item title, price, category, description, and image.
   * @param {Object} item - item JSON object info
   * @param {Boolean} isMain - true = create card in buy view, false = create card in sell view
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

  /**
   * Gets the display name of the category from the given category id.
   * @param {String} id - category ID
   * @returns {String} - category display name
   */
  async function getCategoryName(id) {
    try {
      let name = await fetch("/category?id=" + id);
      await statusCheck(name);
      name = await name.text();
      return name;
    } catch (err) {
      handleError("header", err);
    }
  }

  /**
   * Applies current grid setting (row or tile) to given card.
   * @param {Element} card - product card
   * @returns {Element} - product card
   */
  function applyCurrSettings(card) {
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
   * Shows product page of clicked on product. Shows additional information including seller user,
   * current stock, and item ID.
   * @param {Number} itemID - item ID
   */
  async function showProductPage(itemID) {
    try {
      qs("#product-view .incorrect").classList.add("hidden");
      let item = await fetch("/listings?id=" + itemID);
      await statusCheck(item);
      item = (await item.json())[0];
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
      handleError("#product-view", err);
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
   * Displays error message in given selector with text content of the given error message.
   * @param {String} selector - location to display error message
   * @param {Error} err - error message
   */
  function handleError(selector, err) {
    qs(selector + " .incorrect").classList.remove("hidden");
    qs(selector + " .incorrect").textContent = err;
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
   * @param {String} selector - class name to get HTML element
   * @param {Element} node - HTML element to start query from
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