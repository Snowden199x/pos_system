(function () {
  "use strict";

  // ── State ──────────────────────────────────────────────────────────────
  const state = {
    order: [],
    orderType: "dine-in",
    paymentMethod: "cash",
    discountEnabled: false,
  };

  // ── DOM refs ───────────────────────────────────────────────────────────
  const menuGrid = document.getElementById("menu-grid");
  const orderList = document.getElementById("order-items-list");
  const orderEmpty = document.getElementById("order-empty");
  const subtotalEl = document.getElementById("subtotal-value");
  const discountValEl = document.getElementById("discount-value");
  const totalEl = document.getElementById("total-value");
  const placeOrderBtn = document.getElementById("place-order-btn");
  const amountInput = document.getElementById("amount-input");
  const amountWrap = document.getElementById("amount-wrap");
  const discountToggle = document.getElementById("discount-toggle");
  const beeperInput = document.getElementById("beeper-input");
  const beeperWrap = document.getElementById("beeper-wrap");
  const beeperError = document.getElementById("beeper-error");
  const changeDisplay = document.getElementById("change-display");
  const changeAmount = document.getElementById("change-amount");
  const toastContainer = document.getElementById("toast-container");

  // ── Profile Dropdown & Logout ──────────────────────────────────────────
  const profileBtn = document.getElementById("profile-btn");
  const profileDropdown = document.getElementById("profile-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  if (profileBtn) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("open");
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener("click", () => {
    if (profileDropdown) profileDropdown.classList.remove("open");
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      const url = logoutBtn.dataset.logoutUrl;
      window.location.href = url;
    });
  }

  // ── Date/Time Clock ────────────────────────────────────────────────────
  function updateClock() {
    const now = new Date();
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const dayName = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();
    const year = now.getFullYear();

    let h = now.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, "0");

    const dayEl = document.getElementById("current-day");
    const dateEl = document.getElementById("current-date");
    if (dayEl) dayEl.textContent = dayName;
    if (dateEl)
      dateEl.textContent = `${month} ${date}, ${year} at ${h}:${m} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // ── Discount Calculation ───────────────────────────────────────────────
  // Uses exact per-item fixed discount map (floor of 20%)
  // DISCOUNT_MAP is defined in homepage.php via <script> tag
  function getItemDiscount(price) {
    if (
      typeof DISCOUNT_MAP !== "undefined" &&
      DISCOUNT_MAP[price] !== undefined
    ) {
      return DISCOUNT_MAP[price];
    }
    // Fallback: floor(price * 0.20)
    return Math.floor(price * 0.2);
  }

  function calcTotals() {
    let subtotal = 0;
    let totalDiscount = 0;

    state.order.forEach((item) => {
      subtotal += item.price * item.qty;
    });

    if (state.discountEnabled && state.order.length > 0) {
      // Find the single cheapest item (lowest unit price)
      const cheapest = state.order.reduce(
        (min, item) => (item.price < min.price ? item : min),
        state.order[0],
      );
      totalDiscount = getItemDiscount(cheapest.price);
    }

    const total = subtotal - totalDiscount;
    return { subtotal, totalDiscount, total };
  }

  // ── Category Filter ────────────────────────────────────────────────────
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("filter-btn--active"));
      btn.classList.add("filter-btn--active");
      const cat = btn.dataset.category;
      document.querySelectorAll(".menu-card").forEach((card) => {
        card.classList.toggle(
          "hidden",
          cat !== "all" && card.dataset.category !== cat,
        );
      });
    });
  });

  // ── Add to Order ───────────────────────────────────────────────────────
  menuGrid.addEventListener("click", (e) => {
    const card = e.target.closest(".menu-card");
    if (!card) return;

    const id = parseInt(card.dataset.id);
    const name = card.dataset.name;
    const price = parseInt(card.dataset.price);

    const existing = state.order.find((o) => o.id === id);
    if (existing) {
      existing.qty++;
    } else {
      state.order.push({ id, name, price, qty: 1 });
    }

    renderOrder();

    // Brief highlight
    card.style.borderColor = "var(--green-100)";
    card.style.transform = "scale(0.97)";
    setTimeout(() => {
      card.style.borderColor = "";
      card.style.transform = "";
    }, 300);
  });

  // ── Render Order ───────────────────────────────────────────────────────
  function renderOrder() {
    // Remove existing order items (keep empty state element)
    orderList.querySelectorAll(".order-item").forEach((el) => el.remove());

    if (state.order.length === 0) {
      orderEmpty.style.display = "flex";
    } else {
      orderEmpty.style.display = "none";
      state.order.forEach((item) =>
        orderList.appendChild(createOrderItemEl(item)),
      );
    }

    updateTotals();
  }

  function createOrderItemEl(item) {
    const row = document.createElement("div");
    row.className = "order-item";
    row.dataset.id = item.id;

    // Only show discount on the cheapest item
    const cheapest =
      state.order.length > 0
        ? state.order.reduce(
            (min, o) => (o.price < min.price ? o : min),
            state.order[0],
          )
        : null;
    const isCheapest = cheapest && item.id === cheapest.id;
    const disc =
      state.discountEnabled && isCheapest ? getItemDiscount(item.price) : 0;
    const effPrice = item.price - disc;

    row.innerHTML = `
            <div style="flex:1;min-width:0;">
                <span class="order-item__name" title="${escHtml(item.name)}">${escHtml(item.name)}</span>
                <span class="order-item__price-sub">Php ${effPrice}</span>
            </div>
            <div class="order-item__qty">
                <button class="qty-btn" data-action="dec" aria-label="Decrease">−</button>
                <span class="qty-num">${item.qty}</span>
                <button class="qty-btn" data-action="inc" aria-label="Increase">+</button>
            </div>
            <button class="order-item__remove" aria-label="Remove item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            </button>
        `;

    row.querySelector('[data-action="dec"]').addEventListener("click", () => {
      const o = state.order.find((x) => x.id === item.id);
      if (!o) return;
      o.qty--;
      if (o.qty <= 0) state.order = state.order.filter((x) => x.id !== item.id);
      renderOrder();
    });

    row.querySelector('[data-action="inc"]').addEventListener("click", () => {
      const o = state.order.find((x) => x.id === item.id);
      if (o) {
        o.qty++;
        renderOrder();
      }
    });

    row.querySelector(".order-item__remove").addEventListener("click", () => {
      state.order = state.order.filter((x) => x.id !== item.id);
      renderOrder();
    });

    return row;
  }

  // ── Update Totals ──────────────────────────────────────────────────────
  function updateTotals() {
    const { subtotal, totalDiscount, total } = calcTotals();

    subtotalEl.textContent = `Php ${subtotal.toLocaleString()}`;
    discountValEl.textContent =
      totalDiscount > 0 ? `−Php ${totalDiscount.toLocaleString()}` : "Php 0";
    totalEl.textContent = `Php ${total.toFixed(2)}`;
    placeOrderBtn.textContent = `Place order – Php ${total.toFixed(2)}`;

    updatePlaceOrderState();
    updateChangeDisplay();
  }

  // ── Validate & enable/disable place order button ───────────────────────
  function updatePlaceOrderState() {
    const { total } = calcTotals();
    const hasItems = state.order.length > 0;
    const beeper = beeperInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const isCash = state.paymentMethod === "cash";

    let canPlace = hasItems;

    // Beeper required
    if (!beeper || parseInt(beeper) < 1) canPlace = false;

    // Cash: amount must be >= total and > 0
    if (isCash) {
      if (amount <= 0 || amount < total) canPlace = false;
    }
    // GCash: no amount required

    placeOrderBtn.disabled = !canPlace;
  }

  // ── Change Display ─────────────────────────────────────────────────────
  function updateChangeDisplay() {
    const { total } = calcTotals();
    const amount = parseFloat(amountInput.value) || 0;
    const isCash = state.paymentMethod === "cash";

    if (isCash && amount > 0 && amount >= total && total > 0) {
      const change = amount - total;
      changeAmount.textContent = `Php ${change.toFixed(2)}`;
      changeDisplay.style.display = "flex";
    } else {
      changeDisplay.style.display = "none";
    }
  }

  // ── Show/hide amount input based on method ─────────────────────────────
  function syncAmountVisibility() {
    if (state.paymentMethod === "gcash") {
      amountWrap.style.display = "none";
      changeDisplay.style.display = "none";
    } else {
      amountWrap.style.display = "";
    }
  }

  // ── Discount Toggle ────────────────────────────────────────────────────
  discountToggle.addEventListener("change", () => {
    state.discountEnabled = discountToggle.checked;
    renderOrder(); // re-render so per-item price updates
  });

  // ── Order Type ─────────────────────────────────────────────────────────
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".type-btn")
        .forEach((b) => b.classList.remove("type-btn--active"));
      btn.classList.add("type-btn--active");
      state.orderType = btn.dataset.type;
    });
  });

  // ── Payment Method ─────────────────────────────────────────────────────
  document.querySelectorAll(".payment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".payment-btn")
        .forEach((b) => b.classList.remove("payment-btn--active"));
      btn.classList.add("payment-btn--active");
      state.paymentMethod = btn.dataset.method;
      syncAmountVisibility();
      updateTotals();
    });
  });

  // ── Beeper input: validate on input ────────────────────────────────────
  beeperInput.addEventListener("input", () => {
    const val = beeperInput.value.trim();
    if (!val || parseInt(val) < 1) {
      beeperWrap.classList.add("beeper-error");
      beeperError.classList.add("visible");
    } else {
      beeperWrap.classList.remove("beeper-error");
      beeperError.classList.remove("visible");
    }
    updatePlaceOrderState();
  });

  // ── Amount input: live change display ──────────────────────────────────
  amountInput.addEventListener("input", () => {
    updateChangeDisplay();
    updatePlaceOrderState();
  });

  // ── Place Order ────────────────────────────────────────────────────────
  placeOrderBtn.addEventListener("click", () => {
    if (placeOrderBtn.disabled) return;

    const { total, totalDiscount } = calcTotals();
    const beeper = beeperInput.value.trim();
    const amount = parseFloat(amountInput.value) || 0;
    const isCash = state.paymentMethod === "cash";

    // Double-check beeper
    if (!beeper || parseInt(beeper) < 1) {
      beeperWrap.classList.add("beeper-error");
      beeperError.classList.add("visible");
      beeperInput.focus();
      return;
    }

    // Double-check cash amount
    if (isCash && (amount <= 0 || amount < total)) {
      showToast(
        "Amount paid must be equal to or greater than the total.",
        "error",
      );
      amountInput.focus();
      return;
    }

    const change = isCash ? amount - total : 0;

    let msg = `✅ Order placed!\n`;
    msg += `Type: ${state.orderType === "dine-in" ? "Dine In" : "Take Out"} | Beeper: #${beeper}\n`;
    msg += `Payment: ${isCash ? "Cash" : "GCash"} | Total: Php ${total.toFixed(2)}`;
    if (isCash) msg += `\nChange: Php ${change.toFixed(2)}`;
    if (totalDiscount > 0) msg += `\nDiscount applied: −Php ${totalDiscount}`;

    const subtotal = state.order.reduce((s, o) => s + o.price * o.qty, 0);

    fetch("/Github/POS_System/modules/homepage/place_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beeper_number: beeper,
        order_type: state.orderType,
        payment_method: state.paymentMethod,
        amount_paid: amount,
        subtotal: subtotal,
        discount: totalDiscount,
        total: total,
        change_amount: change,
        items: state.order,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast(msg, "success");
          state.order = [];
          state.discountEnabled = false;
          discountToggle.checked = false;
          amountInput.value = "";
          beeperInput.value = "";
          beeperWrap.classList.remove("beeper-error");
          beeperError.classList.remove("visible");
          changeDisplay.style.display = "none";
          renderOrder();
        } else {
          showToast("Failed to save order: " + data.message, "error");
        }
      })
      .catch(() => showToast("Network error. Order not saved.", "error"));
  });

  // ── Toast ──────────────────────────────────────────────────────────────
  function showToast(message, type = "success") {
    // Use main.js if available
    if (typeof window.showToast === "function") {
      window.showToast(message, type);
      return;
    }

    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "opacity 0.3s, transform 0.3s";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ── Escape HTML ────────────────────────────────────────────────────────
  function escHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // ── Init ───────────────────────────────────────────────────────────────
  syncAmountVisibility();
  renderOrder();
})();
