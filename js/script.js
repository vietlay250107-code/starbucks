(() => {
  "use strict";

  function normalizeStoreText(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/đ/g, "d")
      .trim()
      .replace(/\s+/g, " ");
  }

  function readStoreCards() {
    return Array.from(document.querySelectorAll("article[data-store-card]"), (card) => ({
      element: card,
      name: normalizeStoreText(card.querySelector("h2")?.textContent ?? ""),
      address: normalizeStoreText(card.querySelector("address")?.textContent ?? ""),
    }));
  }

  function getStoreResultMessage(count) {
    if (count === 0) {
      return "Chưa tìm thấy cửa hàng phù hợp. Thử Vinh, Vincom hoặc Hồ Tùng Mậu.";
    }

    if (count === 1) {
      return "Tìm thấy 1 cửa hàng";
    }

    return `${count} cửa hàng ở Vinh`;
  }

  function updateStoreResults(stores, keyword, result) {
    let count = 0;

    for (const store of stores) {
      const matches = store.name.includes(keyword) || store.address.includes(keyword);
      store.element.hidden = !matches;

      if (matches) {
        count += 1;
      }
    }

    result.textContent = getStoreResultMessage(count);
  }

  function setupStoreSearch() {
    const form = document.querySelector("form[data-store-search]");

    if (!form) {
      return;
    }

    const input = form.querySelector("#tu-khoa-cua-hang");
    const resetButton = form.querySelector("button[data-store-reset]");
    const result = document.getElementById("ket-qua-cua-hang");

    if (!input || !resetButton || !result) {
      return;
    }

    const stores = readStoreCards();

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const keyword = normalizeStoreText(input.value);
      updateStoreResults(stores, keyword, result);
      resetButton.hidden = keyword === "";
    });

    resetButton.addEventListener("click", () => {
      input.value = "";
      updateStoreResults(stores, "", result);
      resetButton.hidden = true;
      input.focus();
    });

    form.hidden = false;
  }

  function setupMobileMenu() {
    const bootstrap = window.bootstrap;
    const navigation = document.getElementById("dieu-huong-chinh");
    const menuButton = document.querySelector('button[aria-controls="dieu-huong-chinh"]');

    if (!navigation || !menuButton) {
      return;
    }

    if (typeof bootstrap?.Collapse?.getOrCreateInstance !== "function") {
      menuButton.hidden = true;
      navigation.classList.remove("collapse");
      return;
    }

    const desktop = window.matchMedia("(min-width: 992px)");

    function closeMobileMenu() {
      if (desktop.matches || !navigation.classList.contains("show")) {
        return;
      }

      const collapse = bootstrap.Collapse.getOrCreateInstance(navigation, { toggle: false });

      navigation.addEventListener("hidden.bs.collapse", () => {
        if (!desktop.matches) {
          menuButton.focus();
        }
      }, { once: true });

      collapse.hide();
    }

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape" || desktop.matches || menuButton.getAttribute("aria-expanded") !== "true") {
        return;
      }

      event.preventDefault();
      if (navigation.classList.contains("collapsing")) {
        navigation.addEventListener("shown.bs.collapse", closeMobileMenu, { once: true });
        return;
      }

      closeMobileMenu();
    });
  }

  setupStoreSearch();
  setupMobileMenu();
})();
