(function () {
  "use strict";

  // ── State ──────────────────────────────────
  const state = {
    order: [],
    orderType: "dine-in",
    paymentMethod: "cash",
    discountEnabled: false,
    discountRate: 0.1,
  };

  // ── DOM refs ───────────────────────────────
  const menuGrid = document.getElementById("menu-grid");
  const orderList = document.getElementById("order-items-list");
  const orderEmpty = document.getElementById("order-empty");
  const subtotalEl = document.getElementById("subtotal-value");
  const discountValEl = document.getElementById("discount-value");
  const totalEl = document.getElementById("total-value");
  const placeOrderBtn = document.getElementById("place-order-btn");
  const amountInput = document.getElementById("amount-input");
  const discountToggle = document.getElementById("discount-toggle");
  const beeperInput = document.getElementById("beeper-input");

  // ── Category Filter ─────────────────────────
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("filter-btn--active"));
      btn.classList.add("filter-btn--active");
      const cat = btn.dataset.category;
      document.querySelectorAll(".menu-card").forEach((card) => {
        if (cat === "all" || card.dataset.category === cat) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  // ── Add to Order ────────────────────────────
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

    card.style.borderColor = "var(--active-green)";
    setTimeout(() => {
      card.style.borderColor = "";
    }, 500);
  });

  // ── Render Order ────────────────────────────
  function renderOrder() {
    orderList.querySelectorAll(".order-item").forEach((el) => el.remove());

    if (state.order.length === 0) {
      orderEmpty.style.display = "flex";
    } else {
      orderEmpty.style.display = "none";
      state.order.forEach((item) => {
        orderList.appendChild(createOrderItemEl(item));
      });
    }

    updateTotals();
  }

  function createOrderItemEl(item) {
    const row = document.createElement("div");
    row.className = "order-item";
    row.dataset.id = item.id;

    const lineTotal = (item.price * item.qty).toFixed(2);

    row.innerHTML = `
            <span class="order-item__name" title="${escHtml(item.name)}">${escHtml(item.name)}</span>
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

  // ── Totals ──────────────────────────────────
  function updateTotals() {
    const subtotal = state.order.reduce((s, o) => s + o.price * o.qty, 0);
    const discount = state.discountEnabled ? subtotal * state.discountRate : 0;
    const total = subtotal - discount;

    subtotalEl.textContent = `Php ${subtotal.toFixed(2)}`;
    discountValEl.textContent =
      discount > 0 ? `−Php ${discount.toFixed(2)}` : `Php 0`;
    totalEl.textContent = `Php ${total.toFixed(2)}`;
    placeOrderBtn.textContent = `Place order – Php ${total.toFixed(2)}`;
    placeOrderBtn.disabled = state.order.length === 0;
  }

  // ── Discount Toggle ─────────────────────────
  discountToggle.addEventListener("change", () => {
    state.discountEnabled = discountToggle.checked;
    updateTotals();
  });

  // ── Order Type ──────────────────────────────
  document.querySelectorAll(".type-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".type-btn")
        .forEach((b) => b.classList.remove("type-btn--active"));
      btn.classList.add("type-btn--active");
      state.orderType = btn.dataset.type;
    });
  });

  // ── Payment Method ──────────────────────────
  document.querySelectorAll(".payment-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".payment-btn")
        .forEach((b) => b.classList.remove("payment-btn--active"));
      btn.classList.add("payment-btn--active");
      state.paymentMethod = btn.dataset.method;
    });
  });

  // ── Place Order ─────────────────────────────
  placeOrderBtn.addEventListener("click", () => {
    if (state.order.length === 0) return;

    const subtotal = state.order.reduce((s, o) => s + o.price * o.qty, 0);
    const discount = state.discountEnabled ? subtotal * state.discountRate : 0;
    const total = subtotal - discount;
    const amount = parseFloat(amountInput.value) || 0;
    const beeper = beeperInput.value || "—";

    if (state.paymentMethod === "cash" && amount < total) {
      showToast("Entered amount is less than the total.", "error"); // from main.js
      amountInput.focus();
      return;
    }

    const change = state.paymentMethod === "cash" ? amount - total : 0;

    let summary = `✅ Order placed!\n`;
    summary += `Type: ${state.orderType === "dine-in" ? "Dine In" : "Take Out"} | Beeper: ${beeper}\n`;
    summary += `Payment: ${state.paymentMethod === "cash" ? "Cash" : "GCash"}\n`;
    summary += `Total: Php ${total.toFixed(2)}`;
    if (state.paymentMethod === "cash" && amount > 0) {
      summary += `\nChange: Php ${change.toFixed(2)}`;
    }

    // Save to DB via fetch
    fetch("/Github/POS_System/modules/homepage/place_order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        beeper_number: beeper,
        order_type: state.orderType,
        payment_method: state.paymentMethod,
        amount_paid: amount,
        subtotal: subtotal,
        discount: discount,
        total: total,
        items: state.order,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          showToast(summary, "success");
          state.order = [];
          amountInput.value = "";
          renderOrder();
        } else {
          showToast("Failed to save order: " + data.message, "error");
        }
      })
      .catch(() => showToast("Network error. Order not saved.", "error"));
  });

  // Initial render
  renderOrder();
})();