(function () {
    'use strict';

    // ── FILTER ─────────────────────────────────────────────
    let currentFilter = 'all';

    function filterOrders(type, el) {
        currentFilter = type;

        document.querySelectorAll('.filter').forEach(btn => btn.classList.remove('active'));
        if (el) el.classList.add('active');

        const cards = document.querySelectorAll('.order-card');
        let visible = 0;

        cards.forEach(card => {
            if (type === 'all' || card.dataset.type === type) {
                card.style.display = 'flex';
                visible++;
            } else {
                card.style.display = 'none';
            }
        });

        const empty = document.getElementById('empty');
        if (empty) {
            empty.style.display = visible === 0 ? 'block' : 'none';
        }
    }

    window.filterOrders = filterOrders;

    // ── SERVE BUTTON ───────────────────────────────────────
    function markServed(btn) {
        const card = btn.closest('.order-card');
        if (card) card.remove();

        if (document.querySelectorAll('.order-card').length === 0) {
            const empty = document.getElementById('empty');
            if (empty) empty.style.display = 'block';
        }
    }

    window.markServed = markServed;

    // ── PROFILE DROPDOWN ───────────────────────────────────
    const profileBtn = document.getElementById('profile-btn');
    const dropdown   = document.getElementById('profile-dropdown');

    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        document.addEventListener('click', () => {
            dropdown.classList.remove('open');
        });
    }

    // ── CLOCK ──────────────────────────────────────────────
    function updateClock() {
        const now = new Date();

        const day = now.toLocaleDateString('en-US', { weekday: 'long' });

        const time = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const fullDate = now.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        const dayEl  = document.getElementById('current-day');
        const dateEl = document.getElementById('current-date');

        if (dayEl)  dayEl.textContent  = day;
        if (dateEl) dateEl.textContent = `${fullDate} at ${time}`;
    }

    setInterval(updateClock, 1000);
    updateClock();

    // ── SEARCH ORDERS ──────────────────────────────────────
    const searchInput = document.getElementById('orderSearch');

if (searchInput) {
    searchInput.addEventListener('input', function () {
        const value = this.value.toLowerCase().trim();

        let visible = 0;

        document.querySelectorAll('.order-card').forEach(card => {
            const orderIdEl = card.querySelector('.order-id');
            const orderId = orderIdEl ? orderIdEl.textContent.toLowerCase() : '';
            const type = card.dataset.type.toLowerCase();

            const searchableText = orderId + ' ' + type;

            if (searchableText.includes(value)) {
                card.style.display = 'flex';
                visible++;
            } else {
                card.style.display = 'none';
            }
        });

        const empty = document.getElementById('empty');
        if (empty) {
            empty.style.display = visible === 0 ? 'block' : 'none';
        }
    });
}


})();