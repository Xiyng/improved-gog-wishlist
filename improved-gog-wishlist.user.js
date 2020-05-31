// ==UserScript==
// @name     Improved GOG Wishlist
// @version  0.1
// @author   Xiyng
// @match    https://www.gog.com/account/wishlist
// @grant    none
// ==/UserScript==

"use strict";

const MAXIMUM_PRICE_CLASS = "maximumPrice";
const MINIMUM_DISCOUNT_CLASS = "minimumDiscount";

const uiHtml =
    `
<div>
    <ul>
        <li>
            <label>
               <span>Maximum price</span>
               <input class="${MAXIMUM_PRICE_CLASS}" type="number">
            </label>
        </li>
        <li>
            <label>
               <span>Minimum discount percentage</span>
               <input class="${MINIMUM_DISCOUNT_CLASS}" type="number">
            </label>
        <li>
    </ul>
</div>`;

class Item {
    element = null;
    price = null;
    discountPercentage = null;

    passesFilters(filters) {
        if (Number.isFinite(filters.maximumPrice) && this.price > filters.maximumPrice) {
            return false;
        }
        if (
            Number.isFinite(filters.minimumDiscountPercentage) &&
            this.discountPercentage < filters.minimumDiscountPercentage
        ) {
            return false;
        }
        return true;
    }

    show() {
        this.element.style.display = "block";
    }

    hide() {
        this.element.style.display = "none";
    }

    parseValuesFromElement() {
        this.parsePriceFromElement();
        this.parseDiscountPercentageFromElement();
    }

    parsePriceFromElement() {
        const priceText = this.element.querySelector(".product-row__price .price-btn__text ._price").textContent;
        this.price = Number(priceText); // Seems to always be numeric.
    }

    parseDiscountPercentageFromElement() {
        const discountText = this.element.querySelector(".product-row__discount .price-text--discount span").textContent;
        this.discountPercentage = Number(discountText); // Empty text gets converted to 0, which is fine.
    }

    static fromElement(element) {
        const item = new Item();
        item.element = element;
        item.parseValuesFromElement();
        return item;
    }
}

function initialize() {
    createUi();
    attachEventListeners();
}

function createUi() {
    const container = document.createElement("div");
    const parent = document.getElementsByClassName("account__filters")[0];
    container.innerHTML = uiHtml;
    parent.appendChild(container);
}

function attachEventListeners() {
    getMaximumPriceElement().addEventListener("input", handleMaximumPriceChange);
    getMinimumDiscountElement().addEventListener("input", handleMinimumDiscountChange);
}

function getMaximumPriceElement() {
    return document.getElementsByClassName(MAXIMUM_PRICE_CLASS)[0];
}

function getMinimumDiscountElement() {
    return document.getElementsByClassName(MINIMUM_DISCOUNT_CLASS)[0];
}

function handleMaximumPriceChange() {
    updateList();
}

function handleMinimumDiscountChange() {
    updateList();
}

function getMaximumPrice() {
    const valueString = getMaximumPriceElement().value;
    return valueString === "" ? null : Number(valueString);
}

function getMinimumDiscountPercentage() {
    const valueString = getMinimumDiscountElement().value;
    return valueString === "" ? null : Number(valueString);
}

function updateList() {
    const itemElements = getItemElements();
    const items = itemElements.map(Item.fromElement);
    const filters = {
        maximumPrice: getMaximumPrice(),
        minimumDiscountPercentage: getMinimumDiscountPercentage()
    };
    for (const item of items) {
        if (item.passesFilters(filters)) {
            item.show();
        } else {
            item.hide();
        }
    }
}

function getItemElements() {
    return Array.from(document.querySelectorAll(".list .list-inner .product-row-wrapper"));
}

initialize();