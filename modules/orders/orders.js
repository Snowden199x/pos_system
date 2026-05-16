(function () {
    'use strict';

    // ── FILTER ─────────────────────────────────────────────
    let currentFilter = 'all';

    function filterOrders(type, el) {
        currentFilter = type;
        document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
        if (el) el.classList.add('active');
        const val = searchInput ? searchInput.value.trim() : '';
        let visible = 0;
        document.querySelectorAll('.order-card').forEach(card => {
            const beeper = (card.querySelector('.order-id')?.dataset.beeper || '').trim();
            const items = Array.from(card.querySelectorAll('.order-row span:first-child'))
                .map(el => el.textContent.toLowerCase().replace(/^\d+x\s*/i, ''))
                .join(' ');
            const typeMatch   = currentFilter === 'all' || card.dataset.type === currentFilter;
            const searchMatch = val === '' || beeper === val || items.includes(val.toLowerCase());
            const match = typeMatch && searchMatch;
            card.style.display = match ? 'flex' : 'none';
            if (match) visible++;
        });
        showEmpty(visible === 0);
    }
    window.filterOrders = filterOrders;

    // ── MARK AS SERVED ─────────────────────────────────────
    function markServed(btn) {
        const card = btn.closest('.order-card');
        const orderId = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = 'Saving...';
        fetch('modules/orders/serve_order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_id: orderId })
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                card.style.transition = 'opacity 0.3s, transform 0.3s';
                card.style.opacity    = '0';
                card.style.transform  = 'scale(0.95)';
                setTimeout(() => {
                    card.remove();
                    showEmpty(document.querySelectorAll('.order-card').length === 0);
                }, 300);
            } else {
                btn.disabled = false;
                btn.textContent = 'Mark as served';
                alert('Failed to mark as served: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(() => {
            btn.disabled = false;
            btn.textContent = 'Mark as served';
            alert('Network error. Please try again.');
        });
    }
    window.markServed = markServed;

    // ── EMPTY STATE ────────────────────────────────────────
    function showEmpty(show) {
        let empty = document.getElementById('empty');
        if (!empty && show) {
            empty = document.createElement('div');
            empty.id = 'empty';
            empty.className = 'orders-empty';
            empty.textContent = 'No pending orders yet.';
            document.getElementById('orders-grid').appendChild(empty);
        }
        if (empty) empty.style.display = show ? 'block' : 'none';
    }

    // ── SEARCH ─────────────────────────────────────────────
    const searchInput = document.getElementById('orderSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const val = this.value.trim().toLowerCase();
            let visible = 0;
            document.querySelectorAll('.order-card').forEach(card => {
                const beeper = (card.querySelector('.order-id')?.dataset.beeper || '').trim();
                const items  = Array.from(card.querySelectorAll('.order-row span:first-child'))
                    .map(el => el.textContent.toLowerCase().replace(/^\d+x\s*/i, ''))
                    .join(' ');
                const typeMatch   = currentFilter === 'all' || card.dataset.type === currentFilter;
                const searchMatch = val === '' || beeper === val || items.includes(val);
                const match = typeMatch && searchMatch;
                card.style.display = match ? 'flex' : 'none';
                if (match) visible++;
            });
            showEmpty(visible === 0);
        });
    }

    // ── PROFILE DROPDOWN ───────────────────────────────────
    const profileBtn = document.getElementById('profile-btn');
    const dropdown   = document.getElementById('profile-dropdown');
    const logoutBtn  = document.getElementById('logout-btn');
    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', e => { e.stopPropagation(); dropdown.classList.toggle('open'); });
        document.addEventListener('click', () => dropdown.classList.remove('open'));
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => { window.location.href = logoutBtn.dataset.logoutUrl; });
    }

    // ── ORDER MENU ─────────────────────────────────────────
    document.querySelectorAll('.order-menu-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            document.querySelectorAll('.order-menu').forEach(menu => {
                if (menu !== this.nextElementSibling) menu.classList.remove('open');
            });
            this.nextElementSibling.classList.toggle('open');
        });
    });
    document.addEventListener('click', () => {
        document.querySelectorAll('.order-menu').forEach(menu => menu.classList.remove('open'));
    });

    // ══════════════════════════════════════════════════════
    //  EDIT MODAL
    // ══════════════════════════════════════════════════════

    const epm = {
        orderId:         null,
        items:           [],
        orderType:       'dine-in',
        paymentMethod:   'cash',
        discountEnabled: false,
        pickerCat:       'all',
    };

    const editModal       = document.getElementById('editModal');
    const epmClose        = document.getElementById('editModalClose');
    const epmTypeWrap     = document.getElementById('epm-type-wrap');
    const epmTypeInput    = document.getElementById('epm-type');
    const epmBeeper       = document.getElementById('epm-beeper');
    const epmItemsList    = document.getElementById('epm-items-list');
    const epmAddBtn       = document.getElementById('epm-add-btn');
    const epmMenuPicker   = document.getElementById('epm-menu-picker');
    const epmPickerGrid   = document.getElementById('epm-picker-grid');
    const epmDiscToggle   = document.getElementById('epm-discount-toggle');
    const epmDiscVal      = document.getElementById('epm-discount-val');
    const epmSubtotalVal  = document.getElementById('epm-subtotal-val');
    const epmTotalVal     = document.getElementById('epm-total-val');
    const epmPaymentWrap  = document.getElementById('epm-payment-wrap');
    const epmPaymentInput = document.getElementById('epm-payment');
    const epmAmountWrap   = document.getElementById('epm-amount-wrap');
    const epmAmountInput  = document.getElementById('epm-amount-input');
    const epmTotalBtn     = document.getElementById('epm-total-btn');
    const epmSaveBtn      = document.getElementById('epm-save-btn');
    const epmOrderId      = document.getElementById('epm-order-id');

    function getItemDiscount(price) {
        if (typeof DISCOUNT_MAP !== 'undefined' && DISCOUNT_MAP[price] !== undefined) {
            return DISCOUNT_MAP[price];
        }
        return Math.floor(price * 0.20);
    }

    function calcEpmTotals() {
        let subtotal = 0;
        epm.items.forEach(item => { subtotal += item.price * item.qty; });
        let disc = 0;
        if (epm.discountEnabled && epm.items.length > 0) {
            const cheapest = epm.items.reduce((m, o) => o.price < m.price ? o : m, epm.items[0]);
            disc = getItemDiscount(cheapest.price);
        }
        return { subtotal, disc, total: subtotal - disc };
    }

    function escHtml(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    function renderEpmItems() {
        epmItemsList.innerHTML = '';

        if (epm.items.length === 0) {
            epmItemsList.innerHTML = `
                <div class="order-empty" style="display:flex;">
                    <svg class="order-empty__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                    </svg>
                    <span class="order-empty__text">No items yet</span>
                </div>`;
        } else {
            const cheapest = epm.items.reduce((m, o) => o.price < m.price ? o : m, epm.items[0]);
            epm.items.forEach(item => {
                const disc     = (epm.discountEnabled && item.id === cheapest.id) ? getItemDiscount(item.price) : 0;
                const effPrice = item.price - disc;

                const row = document.createElement('div');
                row.className = 'order-item';
                row.dataset.id = item.id;
                row.innerHTML = `
                    <div style="flex:1;min-width:0;">
                        <span class="order-item__name">${escHtml(item.name)}</span>
                        <span class="order-item__price-sub">Php ${effPrice}</span>
                    </div>
                    <div class="order-item__qty">
                        <button class="qty-btn" data-action="dec" aria-label="Decrease">−</button>
                        <span class="qty-num">${item.qty}</span>
                        <button class="qty-btn" data-action="inc" aria-label="Increase">+</button>
                    </div>
                    <button class="order-item__remove" aria-label="Remove">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>`;

                row.querySelector('[data-action="dec"]').addEventListener('click', () => {
                    const o = epm.items.find(x => x.id === item.id);
                    if (!o) return;
                    o.qty--;
                    if (o.qty <= 0) epm.items = epm.items.filter(x => x.id !== item.id);
                    renderEpmItems();
                    updateEpmTotals();
                });
                row.querySelector('[data-action="inc"]').addEventListener('click', () => {
                    const o = epm.items.find(x => x.id === item.id);
                    if (o) { o.qty++; renderEpmItems(); updateEpmTotals(); }
                });
                row.querySelector('.order-item__remove').addEventListener('click', () => {
                    epm.items = epm.items.filter(x => x.id !== item.id);
                    renderEpmItems();
                    updateEpmTotals();
                });

                epmItemsList.appendChild(row);
            });
        }

        updateEpmTotals();
    }

    function updateEpmTotals() {
        const { subtotal, disc, total } = calcEpmTotals();
        epmSubtotalVal.textContent = `Php ${subtotal.toLocaleString()}`;
        epmDiscVal.textContent     = disc > 0 ? `−Php ${disc.toLocaleString()}` : 'Php 0';
        epmTotalVal.textContent    = `Php ${total.toFixed(2)}`;
        epmTotalBtn.textContent    = `Place order – Php ${total.toFixed(2)}`;
        syncEpmAmount();
    }

    function syncEpmAmount() {
        epmAmountWrap.style.display = epm.paymentMethod === 'gcash' ? 'none' : '';
    }

    // ── Build menu picker grid (sushi only — no category filter needed) ────
    function renderPickerGrid() {
        epmPickerGrid.innerHTML = '';
        const items = (typeof MENU_ITEMS !== 'undefined') ? MENU_ITEMS : [];
        items.forEach(item => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'epm-picker-card';
            card.dataset.id = item.id;
            card.innerHTML = `
                <img src="${BASE_URL}${escHtml(item.image)}" alt="${escHtml(item.name)}"
                     onerror="this.style.display='none'">
                <span class="epm-picker-name">${escHtml(item.name)}</span>
                <span class="epm-picker-price">Php ${item.price}</span>`;
            card.addEventListener('click', () => {
                const existing = epm.items.find(o => o.id === item.id);
                if (existing) {
                    existing.qty++;
                } else {
                    epm.items.push({ id: item.id, name: item.name, price: item.price, qty: 1 });
                }
                card.style.transform = 'scale(0.94)';
                setTimeout(() => { card.style.transform = ''; }, 200);
                renderEpmItems();
                updateEpmTotals();
            });
            epmPickerGrid.appendChild(card);
        });
    }

    // ── Toggle menu picker ─────────────────────────────────
    epmAddBtn.addEventListener('click', () => {
        const open = epmMenuPicker.classList.toggle('open');
        epmAddBtn.textContent = open ? 'close ✕' : 'add order +';
        if (open) renderPickerGrid();
    });

    // ── Type buttons ───────────────────────────────────────
    epmTypeWrap.querySelectorAll('.type-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            epmTypeWrap.querySelectorAll('.type-btn').forEach(b => b.classList.remove('type-btn--active'));
            this.classList.add('type-btn--active');
            epm.orderType      = this.dataset.type;
            epmTypeInput.value = this.dataset.type;
        });
    });

    // ── Payment buttons ────────────────────────────────────
    epmPaymentWrap.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            epmPaymentWrap.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('payment-btn--active'));
            this.classList.add('payment-btn--active');
            epm.paymentMethod      = this.dataset.method;
            epmPaymentInput.value  = this.dataset.method;
            syncEpmAmount();
        });
    });

    // ── Discount toggle ────────────────────────────────────
    epmDiscToggle.addEventListener('change', () => {
        epm.discountEnabled = epmDiscToggle.checked;
        renderEpmItems();
        updateEpmTotals();
    });

    // ── Open edit modal ────────────────────────────────────
    document.querySelectorAll('.edit-order-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            epmMenuPicker.classList.remove('open');
            epmAddBtn.textContent = 'add order +';

            epm.orderId         = this.dataset.id;
            epm.orderType       = this.dataset.type;
            epm.paymentMethod   = this.dataset.payment;
            epm.discountEnabled = parseFloat(this.dataset.discount) > 0;

            try {
                epm.items = JSON.parse(this.dataset.items) || [];
            } catch(e) {
                epm.items = [];
            }

            epmOrderId.value      = epm.orderId;
            epmTypeInput.value    = epm.orderType;
            epmPaymentInput.value = epm.paymentMethod;
            epmBeeper.value       = this.dataset.beeper;
            epmAmountInput.value  = '';

            epmTypeWrap.querySelectorAll('.type-btn').forEach(b => {
                b.classList.toggle('type-btn--active', b.dataset.type === epm.orderType);
            });

            epmPaymentWrap.querySelectorAll('.payment-btn').forEach(b => {
                b.classList.toggle('payment-btn--active', b.dataset.method === epm.paymentMethod);
            });

            epmDiscToggle.checked = epm.discountEnabled;

            renderEpmItems();
            syncEpmAmount();

            editModal.classList.add('show');
        });
    });

    // ── Close edit modal ───────────────────────────────────
    function closeEditModal() {
        editModal.classList.remove('show');
        epmMenuPicker.classList.remove('open');
        epmAddBtn.textContent = 'add order +';
    }
    window.closeEditModal = closeEditModal;
    epmClose.addEventListener('click', closeEditModal);
    editModal.addEventListener('click', function (e) {
        if (e.target === this) closeEditModal();
    });

    // ── Save Changes ───────────────────────────────────────
    epmSaveBtn.addEventListener('click', function () {
        const { subtotal, disc, total } = calcEpmTotals();
        const beeper = parseInt(epmBeeper.value) || 0;

        if (!beeper || beeper < 1) {
            epmBeeper.focus();
            epmBeeper.style.borderColor = '#d9534f';
            setTimeout(() => { epmBeeper.style.borderColor = ''; }, 1500);
            return;
        }

        if (epm.items.length === 0) {
            alert('Please add at least one item.');
            return;
        }

        const amountPaid = epm.paymentMethod === 'cash'
            ? (parseFloat(epmAmountInput.value) || total)
            : total;

        const payload = {
            order_id:       parseInt(epm.orderId),
            beeper_number:  beeper,
            order_type:     epm.orderType,
            payment_method: epm.paymentMethod,
            amount_paid:    amountPaid,
            subtotal:       subtotal,
            discount:       disc,
            total:          total,
            items:          epm.items.map(o => ({
                id:    o.id,
                name:  o.name,
                price: o.price,
                qty:   o.qty,
            })),
        };

        epmSaveBtn.disabled    = true;
        epmSaveBtn.textContent = 'Saving...';

        fetch('modules/orders/update_order.php', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload),
        })
        .then(r => r.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Failed to save: ' + (data.message || 'Unknown error'));
                epmSaveBtn.disabled    = false;
                epmSaveBtn.textContent = 'Save Changes';
            }
        })
        .catch(() => {
            alert('Network error.');
            epmSaveBtn.disabled    = false;
            epmSaveBtn.textContent = 'Save Changes';
        });
    });

    // ── DELETE MODAL ───────────────────────────────────────
    const deleteModal = document.getElementById('deleteModal');
    let deleteOrderId = null;

    function closeDeleteModal() { deleteModal.classList.remove('show'); }
    window.closeDeleteModal = closeDeleteModal;

    document.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            deleteOrderId = this.dataset.id;
            deleteModal.classList.add('show');
        });
    });

    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', function () {
            fetch('modules/orders/delete_order.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ order_id: deleteOrderId }),
            })
            .then(r => r.json())
            .then(data => {
                if (data.success) { location.reload(); }
                else { alert(data.message || 'Delete failed.'); }
            })
            .catch(() => { alert('Network error.'); });
        });
    }

    // ── CLOCK ──────────────────────────────────────────────
    function updateClock() {
        const now    = new Date();
        const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['January','February','March','April','May','June',
                        'July','August','September','October','November','December'];
        let h = now.getHours();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        const m = String(now.getMinutes()).padStart(2, '0');
        const dayEl  = document.getElementById('current-day');
        const dateEl = document.getElementById('current-date');
        if (dayEl)  dayEl.textContent  = days[now.getDay()];
        if (dateEl) dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} at ${h}:${m} ${ampm}`;
    }
    updateClock();
    setInterval(updateClock, 1000);

})();