/*
 * Name: Marcus Jundt
 * Date: 4/24/2024
 * Section: CSE 154 AE
 *
 * This is the JS file which
 */

"use strict";
(function() {

  window.addEventListener("load", init);

  /**
   * Initializes the
   */
  function init() {
    id("grid-setting").addEventListener("change", changeGrid);
  }

  function changeGrid() {
    
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