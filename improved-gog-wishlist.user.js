// ==UserScript==
// @name     Improved GOG Wishlist
// @version  0.1
// @author   Xiyng
// @match    https://www.gog.com/account/wishlist
// @grant    none
// ==/UserScript==

"use strict";

const MAXIMUM_PRICE_ID = "maximumPrice";
const MINIMUM_DISCOUNT_ID = "minimumDiscount";
const APPLY_FILTERS_CLASS = "applyFilters";

const customCss =
    `
.customFilterWrapper {
    padding: 17px;
}

.customFilters {
    display: grid;
    grid-gap: 17px;
    grid-template-columns: max-content max-content;
}

.customFilters .filter {
    padding: 0;
}

.customFilters label {
    text-align: right;
}

.customFilters input.filter {
    background-color: #e6e6e6;
    border-color: #b7b7b7;
    border-radius: 1000vh;
    border-style: solid;
    border-width: 1px;
    color: gray;
    padding-left: 0.5em;
    padding-right: 0.5em;
}

.${APPLY_FILTERS_CLASS} {
    background-color: rgba(0, 0, 0, 0.01);
    border-color: #a6a6a6;
    border-radius: 3px;
    border-style: solid;
    border-width: 1px;
    color: #686868;
    margin-top: 17px;
    padding: 0.25em 1em;
    text-transform: uppercase;
}
`;

const uiHtml =
    `
<div class="customFilterWrapper module module--filters">
    <div class="customFilters">
        <label for="${MAXIMUM_PRICE_ID}" class="filter">Maximum price</label>
        <input id="${MAXIMUM_PRICE_ID}" class="filter" type="number">

        <label for="${MAXIMUM_PRICE_ID}" class="filter">Minimum discount percentage</label>
        <input id="${MINIMUM_DISCOUNT_ID}" class="filter" type="number">
    </div>
    <button class="${APPLY_FILTERS_CLASS}">Apply filters</button>
</div>
`;

class FilterUi {
    element = null;

    create() {
        const container = document.createElement("div");
        this.element = container;
        const parent = document.getElementsByClassName("account__filters")[0];
        container.innerHTML = uiHtml;
        parent.appendChild(container);
    }

    attachEventListeners() {
        this.getMaximumPriceElement().addEventListener("input", () => updateList(this));
        this.getMinimumDiscountElement().addEventListener("input", () => updateList(this));
        this.getApplyFiltersElement().addEventListener("click", () => updateList(this));
    }

    getMaximumPriceElement() {
        return document.getElementById(MAXIMUM_PRICE_ID);
    }

    getMinimumDiscountElement() {
        return document.getElementById(MINIMUM_DISCOUNT_ID);
    }

    getApplyFiltersElement() {
        return this.element.getElementsByClassName(APPLY_FILTERS_CLASS)[0];
    }

    getMaximumPrice() {
        const valueString = this.getMaximumPriceElement().value;
        return valueString === "" ? null : Number(valueString);
    }

    getMinimumDiscountPercentage() {
        const valueString = this.getMinimumDiscountElement().value;
        return valueString === "" ? null : Number(valueString);
    }
}

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
    injectCss();

    const filterUi = new FilterUi();
    filterUi.create();
    filterUi.attachEventListeners();
}

function injectCss() {
    const styleElement = document.createElement("style");
    styleElement.type = "text/css";
    styleElement.textContent = customCss;
    document.head.appendChild(styleElement);
}

function updateList(filterUi) {
    const itemElements = getItemElements();
    const items = itemElements.map(Item.fromElement);
    const filters = {
        maximumPrice: filterUi.getMaximumPrice(),
        minimumDiscountPercentage: filterUi.getMinimumDiscountPercentage()
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