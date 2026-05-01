(function () {
    'use strict';

    // ── CHART COLORS ───────────────────────────────────────────────────────
    const GREEN  = '#1C3924';
    const GOLD   = '#D8C36F';
    const GOLD_T = 'rgba(216,195,111,0.18)';

    // ── TREND LINE CHART ───────────────────────────────────────────────────
    let trendChart = null;

    function buildTrendData(mode) {
        if (mode === 'weekly') {
            return {
                labels: WEEKLY_DATA.map(w => {
                    const s = new Date(w.week_start);
                    const e = new Date(w.week_end);
                    const fmt = d => `${d.toLocaleString('en',{month:'short'})} ${d.getDate()}`;
                    return `${fmt(s)} – ${fmt(e)}`;
                }),
                values: WEEKLY_DATA.map(w => parseFloat(w.total_sales))
            };
        } else {
            const mNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            return {
                labels: MONTHLY_DATA.map(m => mNames[m.mo - 1]),
                values: MONTHLY_DATA.map(m => parseFloat(m.total_sales))
            };
        }
    }

    function renderTrendChart(mode) {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const { labels, values } = buildTrendData(mode);

        if (trendChart) trendChart.destroy();

        trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    data: values,
                    borderColor: GREEN,
                    backgroundColor: GOLD_T,
                    pointBackgroundColor: GREEN,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3,
                    fill: true,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `₱${ctx.parsed.y.toLocaleString()}`
                        }
                    },
                    datalabels: false
                },
                scales: {
                    y: {
                        ticks: {
                            callback: v => `₱${(v/1000).toFixed(0)}k`,
                            font: { family: 'Poppins', size: 11 },
                            color: '#5A6B5E'
                        },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        beginAtZero: true
                    },
                    x: {
                        ticks: {
                            font: { family: 'Poppins', size: 11 },
                            color: '#5A6B5E'
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    window.switchTrend = function(mode) {
        renderTrendChart(mode);
    };

    // ── BAR CHART ──────────────────────────────────────────────────────────
    let barChart = null;

    function buildBarData(mode) {
        if (mode === 'weekly') {
            return {
                labels: WEEKLY_DATA.map(w => {
                    const s = new Date(w.week_start);
                    return `${s.toLocaleString('en',{month:'short'})} ${s.getDate()}`;
                }),
                values: WEEKLY_DATA.map(w => parseFloat(w.total_sales))
            };
        } else {
            // Daily of selected month
            return {
                labels: DAILY_DATA.map(d => {
                    const dt = new Date(d.sale_date);
                    return `${dt.toLocaleString('en',{month:'short'})} ${dt.getDate()}`;
                }),
                values: DAILY_DATA.map(d => parseFloat(d.total_sales))
            };
        }
    }

    function renderBarChart(mode) {
        const ctx = document.getElementById('barChart');
        if (!ctx) return;

        const { labels, values } = buildBarData(mode);

        if (barChart) barChart.destroy();

        barChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data: values,
                    backgroundColor: GOLD,
                    borderRadius: 8,
                    borderSkipped: false,
                    maxBarThickness: 48
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `₱${ctx.parsed.y.toLocaleString()}`
                        }
                    },
                    datalabels: false
                },
                scales: {
                    y: {
                        ticks: {
                            callback: v => `₱${(v/1000).toFixed(0)}k`,
                            font: { family: 'Poppins', size: 11 },
                            color: '#5A6B5E'
                        },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        beginAtZero: true
                    },
                    x: {
                        ticks: {
                            font: { family: 'Poppins', size: 11 },
                            color: '#5A6B5E'
                        },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    window.switchBarView = function(mode) {
        renderBarChart(mode);
    };

    // ── SIDEBAR TREE ───────────────────────────────────────────────────────
    window.toggleYear = function() {
        const months = document.getElementById('tree-months');
        const arrow  = document.getElementById('year-arrow');
        const open   = months.style.display !== 'none';
        months.style.display = open ? 'none' : 'block';
        arrow.textContent    = open ? '›' : '▾';
    };

    window.toggleMonth = function(num) {
        const children = document.getElementById('mc-' + num);
        const arrow    = document.getElementById('m-arrow-' + num);
        if (!children) return;
        const open = children.style.display !== 'none';
        children.style.display = open ? 'none' : 'block';
        arrow.textContent      = open ? '›' : '▾';
    };

    // ── PROFILE DROPDOWN ───────────────────────────────────────────────────
    const profileBtn = document.getElementById('profile-btn');
    const dropdown   = document.getElementById('profile-dropdown');
    const logoutBtn  = document.getElementById('logout-btn');

    if (profileBtn && dropdown) {
        profileBtn.addEventListener('click', e => {
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

    // ── CLOCK ──────────────────────────────────────────────────────────────
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

    // ── INIT CHARTS ────────────────────────────────────────────────────────
    renderTrendChart('weekly');
    renderBarChart('weekly');

})();