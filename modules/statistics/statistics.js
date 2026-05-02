(function () {
  "use strict";

  // ── CHART COLORS ───────────────────────────────────────────────────────
  const GREEN = "#1C3924";
  const GOLD = "#D8C36F";
  const GOLD_T = "rgba(216,195,111,0.18)";

  // ── TREND LINE CHART ───────────────────────────────────────────────────
  let trendChart = null;

  function buildTrendData(mode) {
    if (mode === "weekly") {
      return {
        labels: WEEKLY_DATA.map((w) => {
          const s = new Date(w.week_start);
          const e = new Date(w.week_end);
          const fmt = (d) =>
            `${d.toLocaleString("en", { month: "short" })} ${d.getDate()}`;
          return `${fmt(s)} – ${fmt(e)}`;
        }),
        values: WEEKLY_DATA.map((w) => parseFloat(w.total_sales)),
      };
    } else {
      const mNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return {
        labels: MONTHLY_DATA.map((m) => mNames[m.mo - 1]),
        values: MONTHLY_DATA.map((m) => parseFloat(m.total_sales)),
      };
    }
  }

  function renderTrendChart(mode) {
    const ctx = document.getElementById("trendChart");
    if (!ctx) return;
    const { labels, values } = buildTrendData(mode);
    if (trendChart) trendChart.destroy();
    trendChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            data: values,
            borderColor: GREEN,
            backgroundColor: GOLD_T,
            pointBackgroundColor: GREEN,
            pointRadius: 5,
            pointHoverRadius: 7,
            tension: 0.3,
            fill: true,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `₱${ctx.parsed.y.toLocaleString()}` },
          },
          datalabels: false,
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => `₱${(v / 1000).toFixed(0)}k`,
              font: { family: "Poppins", size: 11 },
              color: "#5A6B5E",
            },
            grid: { color: "rgba(0,0,0,0.05)" },
            beginAtZero: true,
          },
          x: {
            ticks: { font: { family: "Poppins", size: 11 }, color: "#5A6B5E" },
            grid: { display: false },
          },
        },
      },
    });
  }

  window.switchTrend = function (mode) {
    renderTrendChart(mode);
  };

  // ── BAR CHART (dashboard) ──────────────────────────────────────────────
  let barChart = null;

  function buildBarData(mode) {
    if (mode === "weekly") {
      return {
        labels: WEEKLY_DATA.map((w) => {
          const s = new Date(w.week_start);
          return `${s.toLocaleString("en", { month: "short" })} ${s.getDate()}`;
        }),
        values: WEEKLY_DATA.map((w) => parseFloat(w.total_sales)),
      };
    } else {
      return {
        labels: DAILY_DATA.map((d) => {
          const dt = new Date(d.sale_date);
          return `${dt.toLocaleString("en", { month: "short" })} ${dt.getDate()}`;
        }),
        values: DAILY_DATA.map((d) => parseFloat(d.total_sales)),
      };
    }
  }

  function renderBarChart(mode) {
    const ctx = document.getElementById("barChart");
    if (!ctx) return;
    const { labels, values } = buildBarData(mode);
    if (barChart) barChart.destroy();
    barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: GOLD,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: { label: (ctx) => `₱${ctx.parsed.y.toLocaleString()}` },
          },
          datalabels: false,
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => `₱${(v / 1000).toFixed(0)}k`,
              font: { family: "Poppins", size: 11 },
              color: "#5A6B5E",
            },
            grid: { color: "rgba(0,0,0,0.05)" },
            beginAtZero: true,
          },
          x: {
            ticks: { font: { family: "Poppins", size: 11 }, color: "#5A6B5E" },
            grid: { display: false },
          },
        },
      },
    });
  }

  window.switchBarView = function (mode) {
    renderBarChart(mode);
  };

  // ── SECTION BAR CHART (Orders per Day) ────────────────────────────────
  let sectionBarChart = null;

  function renderSectionBarChart() {
    const ctx = document.getElementById("sectionBarChart");
    if (!ctx) return;
    if (!BAR_DATA || BAR_DATA.length === 0) {
      ctx.parentElement.style.display = "none";
      return;
    }

    const labels = BAR_DATA.map((d) => {
      const dt = new Date(d.d);
      return `${dt.toLocaleString("en", { month: "short" })} ${dt.getDate()}`;
    });
    const values = BAR_DATA.map((d) => parseInt(d.cnt));

    if (sectionBarChart) sectionBarChart.destroy();

    sectionBarChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: GOLD,
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 29,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.y} orders` } },
          datalabels: false,
        },
        scales: {
          y: {
            ticks: {
              stepSize: 1,
              font: { family: "Poppins", size: 11 },
              color: "#5A6B5E",
            },
            grid: { color: "rgba(0,0,0,0.05)" },
            beginAtZero: true,
          },
          x: {
            ticks: {
              font: { family: "Poppins", size: 10 },
              color: "#5A6B5E",
              maxRotation: 0,
              padding: 8,
            },
            grid: { display: false },
          },
        },
      },
    });
  }

  // ── FILTER TABLE ───────────────────────────────────────────────────────
  window.filterTable = function () {
    // Toggle filter UI
    let filterBar = document.getElementById("filter-bar");
    if (filterBar) {
      filterBar.style.display =
        filterBar.style.display === "none" ? "flex" : "none";
      return;
    }

    // Build filter bar
    filterBar = document.createElement("div");
    filterBar.id = "filter-bar";
    filterBar.style.cssText = `
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 0;
      flex-wrap: wrap;
    `;

    filterBar.innerHTML = `
      <label style="font-size:12.5px;font-weight:600;color:#1C3924;">Filter by date:</label>
      <input type="date" id="filter-date-from" style="
        padding: 6px 10px;
        border-radius: 8px;
        border: 1.5px solid #ccc;
        font-family: Poppins, sans-serif;
        font-size: 12px;
        outline: none;
        color: #1C3924;
      ">
      <span style="font-size:12px;color:#888;">to</span>
      <input type="date" id="filter-date-to" style="
        padding: 6px 10px;
        border-radius: 8px;
        border: 1.5px solid #ccc;
        font-family: Poppins, sans-serif;
        font-size: 12px;
        outline: none;
        color: #1C3924;
      ">
      <button onclick="applyFilter()" style="
        padding: 6px 16px;
        border-radius: 999px;
        border: 1.5px solid #1C3924;
        background: #1C3924;
        color: #fff;
        font-family: Poppins, sans-serif;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      ">Apply</button>
      <button onclick="clearFilter()" style="
        padding: 6px 14px;
        border-radius: 999px;
        border: 1.5px solid #ccc;
        background: transparent;
        font-family: Poppins, sans-serif;
        font-size: 12px;
        color: #888;
        cursor: pointer;
      ">Clear</button>
    `;

    const header = document.querySelector(".orders-list__header");
    header.insertAdjacentElement("afterend", filterBar);
  };

  window.applyFilter = function () {
    const from = document.getElementById("filter-date-from").value;
    const to = document.getElementById("filter-date-to").value;
    const rows = document.querySelectorAll("#orders-table tbody tr");

    rows.forEach((row) => {
      const dateCell = row.cells[1];
      if (!dateCell) return;

      const rawText = dateCell.textContent.trim(); // e.g. "May 2, 2026 3:04 PM"
      const rowDate = new Date(rawText);

      if (isNaN(rowDate)) {
        row.style.display = "";
        return;
      }

      const rowDateOnly = rowDate.toISOString().split("T")[0];
      let show = true;
      if (from && rowDateOnly < from) show = false;
      if (to && rowDateOnly > to) show = false;
      row.style.display = show ? "" : "none";
    });
  };

  window.clearFilter = function () {
    document.getElementById("filter-date-from").value = "";
    document.getElementById("filter-date-to").value = "";
    document
      .querySelectorAll("#orders-table tbody tr")
      .forEach((r) => (r.style.display = ""));
  };

  // ── SIDEBAR TREE ───────────────────────────────────────────────────────
  window.toggleYear = function (yr) {
    const months = document.getElementById("ym-" + yr);
    const arrow = document.getElementById("ya-" + yr);
    if (!months) return;
    const open = months.style.display !== "none";
    months.style.display = open ? "none" : "block";
    arrow.textContent = open ? "›" : "▾";
  };

  window.toggleMonth = function (yr, num) {
    const children = document.getElementById("mc-" + yr + "-" + num);
    const arrow = document.getElementById("ma-" + yr + "-" + num);
    if (!children) return;
    const open = children.style.display !== "none";
    children.style.display = open ? "none" : "block";
    arrow.textContent = open ? "›" : "▾";
  };

  // ── ANNUAL INCOME MODAL ────────────────────────────────────────────────
  function buildAnnualModal() {
    // Build overlay
    const overlay = document.createElement("div");
    overlay.id = "annual-overlay";
    overlay.style.cssText = `
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.45);
      z-index: 1000;
      display: flex; align-items: center; justify-content: center;
    `;

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.remove();
    });

    const mNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const labels = MONTHLY_DATA.map((m) => mNames[m.mo - 1]);
    const values = MONTHLY_DATA.map((m) => parseFloat(m.total_sales));
    const total = values.reduce((a, b) => a + b, 0);

    overlay.innerHTML = `
      <div style="
        background: #fff;
        border-radius: 20px;
        padding: 28px 30px;
        width: 560px;
        max-width: 95vw;
        box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        position: relative;
        font-family: Poppins, sans-serif;
      ">
        <button onclick="document.getElementById('annual-overlay').remove()" style="
          position: absolute; top: 16px; right: 18px;
          background: none; border: none; font-size: 20px; cursor: pointer; color: #888;
        ">✕</button>
        <h2 style="font-size:18px;font-weight:700;color:#1C3924;margin-bottom:4px;">
          📁 Annual Income — ${SELECTED_YEAR}
        </h2>
        <p style="font-size:13px;color:#888;margin-bottom:18px;">
          Total: <strong style="color:#1C3924;">₱${total.toLocaleString()}</strong>
        </p>
        <canvas id="annualChart" height="160"></canvas>
        <div id="annual-month-list" style="margin-top:18px;display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;"></div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Render bar chart
    const ctx = document.getElementById("annualChart");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: GOLD,
            borderRadius: 6,
            borderSkipped: false,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const month = MONTHLY_DATA[idx].mo;
            window.location.href = `?page=statistics&sidebar=1&year=${SELECTED_YEAR}&month=${month}&section=orders`;
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `₱${ctx.parsed.y.toLocaleString()}`,
              afterLabel: () => "Click to view orders",
            },
          },
          datalabels: false,
        },
        scales: {
          y: {
            ticks: {
              callback: (v) => `₱${(v / 1000).toFixed(0)}k`,
              font: { family: "Poppins", size: 11 },
              color: "#5A6B5E",
            },
            grid: { color: "rgba(0,0,0,0.05)" },
            beginAtZero: true,
          },
          x: {
            ticks: { font: { family: "Poppins", size: 11 }, color: "#5A6B5E" },
            grid: { display: false },
          },
        },
      },
    });

    // Month breakdown list
    const list = document.getElementById("annual-month-list");
    MONTHLY_DATA.forEach((m) => {
      const item = document.createElement("a");
      item.href = `?page=statistics&sidebar=1&year=${SELECTED_YEAR}&month=${m.mo}&section=orders`;
      item.style.cssText = `
        display: flex; justify-content: space-between; align-items: center;
        padding: 8px 12px; border-radius: 10px;
        background: #fdf9ee; text-decoration: none;
        border: 1px solid #e8e0c8;
        transition: background 0.15s;
      `;
      item.innerHTML = `
        <span style="font-size:13px;font-weight:500;color:#1C3924;">📂 ${mNames[m.mo - 1]}</span>
        <span style="font-size:13px;font-weight:700;color:#1C3924;">₱${parseFloat(m.total_sales).toLocaleString()}</span>
      `;
      item.onmouseover = () => (item.style.background = "#f5edcf");
      item.onmouseout = () => (item.style.background = "#fdf9ee");
      list.appendChild(item);
    });
  }

  // Make .tree-annual clickable
  function initAnnualClick() {
    const annualEl = document.querySelector(".tree-annual");
    if (!annualEl) return;
    annualEl.style.cursor = "pointer";
    annualEl.style.borderRadius = "8px";
    annualEl.style.transition = "background 0.15s";
    annualEl.addEventListener(
      "mouseenter",
      () => (annualEl.style.background = "rgba(216,195,111,0.2)"),
    );
    annualEl.addEventListener(
      "mouseleave",
      () => (annualEl.style.background = ""),
    );
    annualEl.addEventListener("click", buildAnnualModal);
  }

  // ── SIDEBAR OPEN / CLOSE ───────────────────────────────────────────────
  window.openSidebar = function () {
    const sidebar = document.getElementById("stats-sidebar");
    const openBtn = document.getElementById("open-sidebar");
    if (sidebar) sidebar.classList.add("stats-sidebar--open");
    if (openBtn) openBtn.style.display = "none";
  };

  window.closeSidebar = function () {
    const sidebar = document.getElementById("stats-sidebar");
    const openBtn = document.getElementById("open-sidebar");
    if (sidebar) sidebar.classList.remove("stats-sidebar--open");
    if (openBtn) openBtn.style.display = "flex";
};

  // ── PROFILE DROPDOWN ───────────────────────────────────────────────────
  const profileBtn = document.getElementById("profile-btn");
  const dropdown = document.getElementById("profile-dropdown");
  const logoutBtn = document.getElementById("logout-btn");

  if (profileBtn && dropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    });
    document.addEventListener("click", () => dropdown.classList.remove("open"));
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = logoutBtn.dataset.logoutUrl;
    });
  }

  // ── CLOCK ──────────────────────────────────────────────────────────────
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
    let h = now.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const m = String(now.getMinutes()).padStart(2, "0");
    const dayEl = document.getElementById("current-day");
    const dateEl = document.getElementById("current-date");
    if (dayEl) dayEl.textContent = days[now.getDay()];
    if (dateEl)
      dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()} at ${h}:${m} ${ampm}`;
  }

  updateClock();
  setInterval(updateClock, 1000);

  // ── INIT ───────────────────────────────────────────────────────────────
  // Hide open-sidebar button if sidebar is already open (server-side)
  if (typeof SIDEBAR_OPEN !== "undefined" && SIDEBAR_OPEN) {
    const openBtn = document.getElementById("open-sidebar");
    if (openBtn) openBtn.style.display = "none";
  }

  // Dashboard charts
  renderTrendChart("weekly");
  renderBarChart("weekly");

  // Section bar chart (Orders per Day)
  renderSectionBarChart();

  // Annual income click
  initAnnualClick();
})();
