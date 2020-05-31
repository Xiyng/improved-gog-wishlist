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
const APPLY_FILTERS_CLASS = "applyFilters";

const customCss =
    `
.customFilters {
    padding-top: 17px;
    padding-bottom: 17px;
}

.customFilter:not(:first-child) {
    margin-top: 17px;
}

.customFilter:not(:last-child) {
    margin-bottom: 17px;
}
`;

const uiHtml =
    `
<div class="customFilters module module--filters">
    <ul>
        <li class="filter customFilter">
            <label>
               <span>Maximum price</span>
               <input class="${MAXIMUM_PRICE_CLASS}" type="number">
            </label>
        </li>
        <li class="filter customFilter">
            <label>
               <span>Minimum discount percentage</span>
               <input class="${MINIMUM_DISCOUNT_CLASS}" type="number">
            </label>
        <li>
        <li class="filter customFilter">
            <button class="${APPLY_FILTERS_CLASS}">Apply filters</button>
        </li>
    </ul>
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
        return this.element.getElementsByClassName(MAXIMUM_PRICE_CLASS)[0];
    }

    getMinimumDiscountElement() {
        return this.element.getElementsByClassName(MINIMUM_DISCOUNT_CLASS)[0];
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