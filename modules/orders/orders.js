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
            const beeper   = (card.querySelector('.order-id')?.dataset.beeper || '').trim();
            const items    = (card.querySelector('.order-items')?.textContent || '').toLowerCase();
            const payment  = (card.querySelector('.extra-row span:last-child')?.textContent || '').toLowerCase();
            const date     = (card.querySelector('.time')?.textContent || '').toLowerCase();
            const type     = (card.dataset.type || '').toLowerCase();
            const typeMatch   = currentFilter === 'all' || card.dataset.type === currentFilter;
            const searchMatch = val === '' 
                || beeper === val 
                || items.includes(val.toLowerCase())
                || payment.includes(val.toLowerCase())
                || date.includes(val.toLowerCase())
                || type.includes(val.toLowerCase());
            const match = typeMatch && searchMatch;

            card.style.display = match ? 'flex' : 'none';
            if (match) visible++;
        });

        showEmpty(visible === 0);
    }

    window.filterOrders = filterOrders;

    // ── MARK AS SERVED ─────────────────────────────────────
    function markServed(btn) {
        const card    = btn.closest('.order-card');
        const orderId = btn.dataset.id;

        btn.disabled    = true;
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
                    const remaining = document.querySelectorAll('.order-card').length;
                    showEmpty(remaining === 0);
                }, 300);
            } else {
                btn.disabled    = false;
                btn.textContent = 'Mark as served';
                alert('Failed to mark as served: ' + (data.message || 'Unknown error'));
            }
        })
        .catch(() => {
            btn.disabled    = false;
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
            empty.id        = 'empty';
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
            const val = this.value.trim();
            let visible = 0;

            document.querySelectorAll('.order-card').forEach(card => {
                const beeper = (card.querySelector('.order-id')?.textContent || '').replace('#','').trim();
                const items  = (card.querySelector('.order-items')?.textContent || '').toLowerCase();
                const typeMatch = currentFilter === 'all' || card.dataset.type === currentFilter;
                const searchMatch = val === '' || beeper === val || items.includes(val.toLowerCase());
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
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });
        document.addEventListener('click', () => dropdown.classList.remove('open'));
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.location.href = logoutBtn.dataset.logoutUrl;
        });
    }

    // ── CLOCK ──────────────────────────────────────────────
    function updateClock() {
        const now     = new Date();
        const days    = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        let h         = now.getHours();
        const ampm    = h >= 12 ? 'PM' : 'AM';
        h             = h % 12 || 12;
        const m       = String(now.getMinutes()).padStart(2, '0');

        const dayEl  = document.getElementById('current-day');
        const dateEl = document.getElementById('current-date');
        if (dayEl)  dayEl.textContent  = days[now.getDay()];
        if (dateEl) dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} at ${h}:${m} ${ampm}`;
    }

    updateClock();
    setInterval(updateClock, 1000);

})();