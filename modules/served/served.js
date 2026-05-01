(function () {
    'use strict';

    const PER_PAGE    = 8;
    let currentPage   = 1;
    let currentFilter = 'all';
    let searchVal     = '';

    // ── GET VISIBLE CARDS ──────────────────────────────────
    function getFilteredCards() {
        return Array.from(document.querySelectorAll('.served-card')).filter(card => {
            const typeMatch = currentFilter === 'all' || card.dataset.type === currentFilter;
            const textMatch = searchVal === '' || card.textContent.toLowerCase().includes(searchVal);
            return typeMatch && textMatch;
        });
    }

    // ── RENDER PAGE ────────────────────────────────────────
    function renderPage(page) {
        currentPage = page;
        const filtered = getFilteredCards();
        const total    = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

        // Clamp page
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * PER_PAGE;
        const end   = start + PER_PAGE;

        // Hide all first
        document.querySelectorAll('.served-card').forEach(c => c.style.display = 'none');

        // Show only current page slice
        filtered.forEach((card, idx) => {
            card.style.display = (idx >= start && idx < end) ? 'flex' : 'none';
        });

        showEmpty(total === 0);
        renderPagination(currentPage, totalPages);
    }

    // ── RENDER PAGINATION ──────────────────────────────────
    function renderPagination(page, totalPages) {
        const container = document.getElementById('pagination');
        if (!container) return;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let html = '';

        // Prev arrow
        html += `<button class="pagination__arrow" id="pg-prev" ${page === 1 ? 'disabled' : ''}>&#8592;</button>`;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination__btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        // Next arrow
        html += `<button class="pagination__arrow" id="pg-next" ${page === totalPages ? 'disabled' : ''}>&#8594;</button>`;

        container.innerHTML = html;

        // Events
        container.querySelector('#pg-prev')?.addEventListener('click', () => renderPage(currentPage - 1));
        container.querySelector('#pg-next')?.addEventListener('click', () => renderPage(currentPage + 1));
        container.querySelectorAll('.pagination__btn').forEach(btn => {
            btn.addEventListener('click', () => renderPage(parseInt(btn.dataset.page)));
        });
    }

    // ── FILTER ─────────────────────────────────────────────
    document.querySelectorAll('.served-filter').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.served-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderPage(1);
        });
    });

    // ── SEARCH ─────────────────────────────────────────────
    const searchInput = document.getElementById('servedSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function () {
            searchVal = this.value.toLowerCase().trim();
            renderPage(1);
        });
    }

    // ── EMPTY STATE ────────────────────────────────────────
    function showEmpty(show) {
        let empty = document.getElementById('served-empty');
        if (!empty && show) {
            empty = document.createElement('div');
            empty.id        = 'served-empty';
            empty.className = 'served-empty';
            empty.innerHTML = `
                <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                    <rect x="9" y="3" width="6" height="4" rx="1"/>
                    <line x1="9" y1="12" x2="15" y2="12"/>
                    <line x1="9" y1="16" x2="13" y2="16"/>
                </svg>
                <p>No served orders yet.</p>`;
            document.getElementById('served-grid').appendChild(empty);
        }
        if (empty) empty.style.display = show ? 'flex' : 'none';
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
        const now    = new Date();
        const days   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        let h        = now.getHours();
        const ampm   = h >= 12 ? 'PM' : 'AM';
        h            = h % 12 || 12;
        const m      = String(now.getMinutes()).padStart(2, '0');

        const dayEl  = document.getElementById('current-day');
        const dateEl = document.getElementById('current-date');
        if (dayEl)  dayEl.textContent  = days[now.getDay()];
        if (dateEl) dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} at ${h}:${m} ${ampm}`;
    }

    updateClock();
    setInterval(updateClock, 1000);

    // ── INIT ───────────────────────────────────────────────
    renderPage(1);

})();