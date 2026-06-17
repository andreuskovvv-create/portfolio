/* ============================================================
   ЕМ. — Готовое питание · интерактив
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");
  const rub = (n) => fmt(n) + " ₽";

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  /* ---------- Sticky nav ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 16);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const mobilemenu = $("#mobilemenu");
  function toggleMenu(force) {
    const open = force ?? !mobilemenu.classList.contains("open");
    mobilemenu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    mobilemenu.setAttribute("aria-hidden", String(!open));
  }
  burger.addEventListener("click", () => toggleMenu());
  $$("#mobilemenu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
      const dur = 1500, start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString("ru-RU") + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(start);
      cio.unobserve(el);
    }),
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* ============================================================
     GOAL SELECTOR  (Подбор по цели)
     ============================================================ */
  const GOALS = [
    { key: "slim", ic: "ic-fire", name: "Снижение веса", short: "Дефицит без голода",
      tag: "Дефицит ≈ 15% · 3 приёма", kcal: 1400, p: 115, f: 45, c: 120, meals: 3, day: 1190,
      tier: 1500, prefMeals: ["breakfast", "lunch", "dinner"], pref: "protein",
      desc: "Мягкий дефицит калорий с упором на белок — уходит жир, а не мышцы. Сытные порции, чтобы не срываться." },
    { key: "maintain", ic: "ic-scale", name: "Поддержание формы", short: "Баланс на каждый день",
      tag: "Норма калорий · 3 приёма", kcal: 1800, p: 100, f: 60, c: 190, meals: 3, day: 1290,
      tier: 1800, prefMeals: ["breakfast", "lunch", "dinner"], pref: "balanced",
      desc: "Сбалансированный рацион в норме калорий. Стабильный вес, ровная энергия и никаких качелей." },
    { key: "mass", ic: "ic-muscle", name: "Набор массы", short: "Профицит + много белка",
      tag: "Профицит ≈ 15% · 5 приёмов", kcal: 2600, p: 155, f: 80, c: 290, meals: 5, day: 1690,
      tier: 2200, prefMeals: ["breakfast", "lunch", "dinner", "snack"], pref: "protein",
      desc: "Калорийный профицит и 1.8 г белка на кг веса. Частые приёмы пищи, чтобы расти без лишнего жира." },
    { key: "detox", ic: "ic-leaf", name: "Детокс-перезагрузка", short: "Лёгкость и клетчатка",
      tag: "Лёгкий рацион · 4 приёма", kcal: 1300, p: 70, f: 40, c: 150, meals: 4, day: 1390,
      tier: 1200, prefMeals: ["breakfast", "lunch", "dinner", "snack"], pref: "veg",
      desc: "Овощи, зелень и сложные углеводы. Мягкая разгрузка ЖКТ, больше воды и клетчатки на 5–7 дней." },
    { key: "energy", ic: "ic-bolt", name: "Энергия для спорта", short: "Топливо под нагрузки",
      tag: "Высокий углевод · 4 приёма", kcal: 2200, p: 130, f: 65, c: 250, meals: 4, day: 1490,
      tier: 2200, prefMeals: ["breakfast", "lunch", "dinner", "snack"], pref: "balanced",
      desc: "Углеводный акцент для тренировок и долгого фокуса. Заряд до зала и восстановление после." },
  ];

  const goalCards = $("#goalCards");
  const goalPanel = $("#goalPanel");
  let activeGoal = GOALS[1];

  goalCards.innerHTML = GOALS.map((g, i) => `
    <button data-goal="${g.key}" class="${i === 1 ? "is-active" : ""}" role="tab" aria-selected="${i === 1}">
      <span class="g-ic"><svg class="ic"><use href="#${g.ic}"/></svg></span>
      <span class="g-tx"><b>${g.name}</b><small>${g.short}</small></span>
    </button>`).join("");

  function renderGoal(g) {
    activeGoal = g;
    goalPanel.innerHTML = `
      <div class="gp">
        <div class="gp__top">
          <span class="gp__emoji"><svg class="ic"><use href="#${g.ic}"/></svg></span>
          <div>
            <div class="gp__name">${g.name}</div>
            <div class="gp__tag">${g.tag}</div>
          </div>
        </div>
        <p class="gp__desc">${g.desc}</p>
        <div class="gp__metrics">
          <div class="gp__metric gp__metric--kcal"><b>${fmt(g.kcal)}</b><span>ккал/день</span></div>
          <div class="gp__metric"><b>${g.p}</b><span>белки, г</span></div>
          <div class="gp__metric"><b>${g.f}</b><span>жиры, г</span></div>
          <div class="gp__metric"><b>${g.c}</b><span>углев, г</span></div>
        </div>
        <div class="gp__actions">
          <button class="btn btn--solid" id="goalToConstructor">Собрать на этой цели →</button>
          <div class="gp__price"><small>от</small> <b>${fmt(g.day)} ₽</b> <small>/ день</small></div>
        </div>
      </div>`;
    $("#goalToConstructor").addEventListener("click", () => applyGoalToBuilder(g));
  }

  $$("button", goalCards).forEach((b) => {
    b.addEventListener("click", () => {
      $$("button", goalCards).forEach((x) => { x.classList.remove("is-active"); x.setAttribute("aria-selected", "false"); });
      b.classList.add("is-active");
      b.setAttribute("aria-selected", "true");
      renderGoal(GOALS.find((g) => g.key === b.dataset.goal));
    });
  });
  renderGoal(activeGoal);

  /* ============================================================
     CONSTRUCTOR  (Конструктор меню)
     ============================================================ */
  const TIER_MEAL_PRICE = { 1200: 340, 1500: 390, 1800: 445, 2200: 520 };
  const PREF_RATIO = {
    balanced: { p: 0.25, f: 0.30, c: 0.45 },
    protein:  { p: 0.35, f: 0.28, c: 0.37 },
    veg:      { p: 0.20, f: 0.28, c: 0.52 },
    gluten:   { p: 0.25, f: 0.30, c: 0.45 },
  };
  const DAYS_DISCOUNT = { 5: 0, 6: 0.05, 7: 0.10 };
  const MEAL_META = {
    breakfast: { ic: "ic-sunrise", name: "Сырники с ягодным соусом", w: 0.28 },
    lunch:     { ic: "ic-bowl",    name: "Боул с лососем и киноа", w: 0.34 },
    dinner:    { ic: "ic-moon",    name: "Индейка с овощами гриль", w: 0.30 },
    snack:     { ic: "ic-apple",   name: "Гранола с йогуртом", w: 0.12 },
  };
  const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"];

  const B = { kcal: 1500, meals: ["breakfast", "lunch", "dinner"], days: 5, pref: "balanced", goalName: "Поддержание формы" };

  const ctrlKcal = $("#ctrlKcal"), ctrlMeals = $("#ctrlMeals"), ctrlDays = $("#ctrlDays"), ctrlPref = $("#ctrlPref");

  function calcKbju(kcal, pref) {
    const r = PREF_RATIO[pref] || PREF_RATIO.balanced;
    return {
      p: Math.round((kcal * r.p) / 4),
      f: Math.round((kcal * r.f) / 9),
      c: Math.round((kcal * r.c) / 4),
    };
  }

  function renderBuilder() {
    const mealsCount = B.meals.length;
    const prefMult = +($("button.is-active", ctrlPref)?.dataset.mult || 1);
    const perDay = mealsCount * TIER_MEAL_PRICE[B.kcal] * prefMult;
    const weekGross = perDay * B.days;
    const disc = DAYS_DISCOUNT[B.days] || 0;
    const save = weekGross * disc;
    const weekNet = weekGross - save;
    const perPortion = weekNet / (mealsCount * B.days);
    const kb = calcKbju(B.kcal, B.pref);

    // summary numbers
    $("#sumGoalPill").textContent = B.goalName;
    $("#sumPlates").textContent = mealsCount + (mealsCount === 1 ? " блюдо" : mealsCount < 5 ? " блюда" : " блюд") + " / день";
    $("#sumKcal").textContent = fmt(B.kcal);
    $("#sumP").textContent = kb.p;
    $("#sumF").textContent = kb.f;
    $("#sumC").textContent = kb.c;
    $("#sumMeals").textContent = mealsCount;
    $("#sumDays").textContent = B.days;
    $("#sumPerDay").textContent = rub(perDay);
    $("#sumSave").textContent = "–" + rub(save);
    $("#sumSaveRow").style.opacity = save > 0 ? "1" : ".45";
    $("#sumWeek").textContent = rub(weekNet);
    $("#sumPerPortion").textContent = "≈ " + rub(perPortion) + " / блюдо";
    $("#builderCheckout").dataset.amount = Math.round(weekNet);
    $("#builderCheckout").dataset.kcal = B.kcal;

    // kbju ring segments
    const pK = kb.p * 4, fK = kb.f * 9, cK = kb.c * 4, totalK = pK + fK + cK;
    const ring = $("#kbjuRing");
    ring.style.setProperty("--seg-p", (360 * pK / totalK).toFixed(1) + "deg");
    ring.style.setProperty("--seg-f", (360 * (pK + fK) / totalK).toFixed(1) + "deg");

    // sample day
    const sel = MEAL_ORDER.filter((m) => B.meals.includes(m));
    const wsum = sel.reduce((s, m) => s + MEAL_META[m].w, 0);
    $("#sampleKcal").textContent = fmt(B.kcal) + " ккал";
    $("#sampleList").innerHTML = sel.map((m) => {
      const meta = MEAL_META[m];
      const k = Math.round(B.kcal * meta.w / wsum / 10) * 10;
      return `<li><span class="s-ic"><svg class="ic"><use href="#${meta.ic}"/></svg></span><span class="s-name">${meta.name}</span><span class="s-kcal">${k} ккал</span></li>`;
    }).join("");
  }

  // calorie tier
  $$("button", ctrlKcal).forEach((b) => b.addEventListener("click", () => {
    $$("button", ctrlKcal).forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    B.kcal = +b.dataset.kcal;
    renderBuilder();
  }));

  // meals (toggle, min 2)
  $$("button", ctrlMeals).forEach((b) => b.addEventListener("click", () => {
    const m = b.dataset.meal, on = b.classList.contains("is-on");
    if (on && B.meals.length <= 2) { toast("Минимум 2 приёма пищи в день"); return; }
    b.classList.toggle("is-on");
    B.meals = on ? B.meals.filter((x) => x !== m) : [...B.meals, m];
    renderBuilder();
  }));

  // days
  $$("button", ctrlDays).forEach((b) => b.addEventListener("click", () => {
    $$("button", ctrlDays).forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    B.days = +b.dataset.days;
    renderBuilder();
  }));

  // preference
  $$("button", ctrlPref).forEach((b) => b.addEventListener("click", () => {
    $$("button", ctrlPref).forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    B.pref = b.dataset.pref;
    renderBuilder();
  }));

  // apply a goal preset into the builder
  function applyGoalToBuilder(g) {
    B.kcal = g.tier; B.meals = [...g.prefMeals]; B.pref = g.pref; B.goalName = g.name;
    $$("button", ctrlKcal).forEach((x) => x.classList.toggle("is-active", +x.dataset.kcal === g.tier));
    $$("button", ctrlMeals).forEach((x) => x.classList.toggle("is-on", g.prefMeals.includes(x.dataset.meal)));
    $$("button", ctrlPref).forEach((x) => x.classList.toggle("is-active", x.dataset.pref === g.pref));
    renderBuilder();
    document.getElementById("constructor").scrollIntoView({ behavior: "smooth", block: "start" });
    toast(`✓ Рацион настроен под цель «${g.name}»`);
  }
  renderBuilder();

  /* ============================================================
     MENU GRID  (Меню недели)
     ============================================================ */
  const DISHES = [
    { n: "Сырники с ягодным соусом", cat: "breakfast", k: 320, p: 22, f: 9, c: 38, pr: 290, g: "g-grad-3", e: "ic-pancake" },
    { n: "Овсяноблин с авокадо", cat: "breakfast", k: 350, p: 18, f: 16, c: 34, pr: 280, g: "g-grad-2", e: "ic-avocado" },
    { n: "Гранола и греческий йогурт", cat: "breakfast", k: 290, p: 14, f: 8, c: 42, pr: 250, g: "g-grad-7", e: "ic-granola" },
    { n: "Боул с лососем и киноа", cat: "lunch", k: 480, p: 34, f: 18, c: 46, pr: 420, g: "g-grad-1", e: "ic-fish" },
    { n: "Паста с курицей и песто", cat: "lunch", k: 520, p: 38, f: 16, c: 58, pr: 390, g: "g-grad-8", e: "ic-pasta" },
    { n: "Том-ям с креветкой", cat: "lunch", k: 360, p: 28, f: 12, c: 34, pr: 410, g: "g-grad-4", e: "ic-shrimp" },
    { n: "Стейк из индейки + булгур", cat: "dinner", k: 440, p: 42, f: 12, c: 40, pr: 430, g: "g-grad-5", e: "ic-steak" },
    { n: "Треска на пару с овощами", cat: "dinner", k: 330, p: 36, f: 9, c: 22, pr: 440, g: "g-grad-6", e: "ic-fish" },
    { n: "Тёплый салат с тунцом", cat: "dinner", k: 300, p: 30, f: 14, c: 16, pr: 380, g: "g-grad-2", e: "ic-salad" },
    { n: "Протеиновый бар", cat: "snack", k: 200, p: 20, f: 7, c: 18, pr: 150, g: "g-grad-7", e: "ic-bar" },
    { n: "Яблоко и арахисовая паста", cat: "snack", k: 180, p: 6, f: 9, c: 22, pr: 120, g: "g-grad-8", e: "ic-apple" },
    { n: "Смузи манго-шпинат", cat: "snack", k: 160, p: 5, f: 3, c: 30, pr: 170, g: "g-grad-3", e: "ic-cup" },
  ];
  const CAT_LABEL = { breakfast: "Завтрак", lunch: "Обед", dinner: "Ужин", snack: "Перекус" };
  const menuGrid = $("#menuGrid");

  function renderMenu(cat) {
    const list = cat === "all" ? DISHES : DISHES.filter((d) => d.cat === cat);
    menuGrid.innerHTML = list.map((d) => `
      <article class="dish">
        <div class="dish__img ${d.g}">
          <span class="dish__cat">${CAT_LABEL[d.cat]}</span>
          <svg class="ic ic--dish"><use href="#${d.e}"/></svg>
        </div>
        <div class="dish__body">
          <div class="dish__name">${d.n}</div>
          <div class="dish__kbju">
            <span class="k-kcal">${d.k} ккал</span>
            <span>Б ${d.p}</span><span>Ж ${d.f}</span><span>У ${d.c}</span>
          </div>
          <div class="dish__add">
            <b>${fmt(d.pr)} ₽</b>
            <button class="dish__btn" data-dish="${d.n}" aria-label="Добавить ${d.n}">+</button>
          </div>
        </div>
      </article>`).join("");
    $$(".dish__btn", menuGrid).forEach((btn) =>
      btn.addEventListener("click", () => toast(`✓ «${btn.dataset.dish}» добавлено в рацион`)));
  }
  $$("#menuFilters button").forEach((b) => b.addEventListener("click", () => {
    $$("#menuFilters button").forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    renderMenu(b.dataset.cat);
  }));
  renderMenu("all");

  /* ============================================================
     PLANS billing toggle (неделя / месяц)
     ============================================================ */
  const billingSwitch = $("#billingSwitch"), labWeek = $("#labWeek"), labMonth = $("#labMonth");
  let monthly = false;
  function updatePlans() {
    $$(".plan .amount").forEach((el) => {
      const val = monthly ? el.dataset.m : el.dataset.w;
      el.style.opacity = "0";
      setTimeout(() => { el.textContent = (+val).toLocaleString("ru-RU"); el.style.opacity = "1"; }, 140);
    });
    $$(".plan__per").forEach((el) => { el.textContent = monthly ? el.dataset.m : el.dataset.w; });
    labWeek.classList.toggle("is-active", !monthly);
    labMonth.classList.toggle("is-active", monthly);
  }
  billingSwitch.addEventListener("click", () => {
    monthly = !monthly;
    billingSwitch.classList.toggle("on", monthly);
    updatePlans();
  });

  /* ============================================================
     DELIVERY CALENDAR  (Календарь доставки)
     ============================================================ */
  const TODAY = new Date(2026, 5, 15);            // 15 июня 2026
  const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
  const MONTHS_GEN = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const deliv = new Set();   // ISO days with delivery
  const skip = new Set();    // ISO days explicitly skipped
  // default: fill rest of June 2026 (skip Sundays) starting tomorrow
  (function seedDeliveries() {
    const end = new Date(2026, 5, 30);
    for (let d = new Date(2026, 5, 16); d <= end; d.setDate(d.getDate() + 1)) {
      if (d.getDay() !== 0) deliv.add(iso(d));
    }
  })();

  let view = { y: 2026, m: 5 };
  let win = "7:00–9:00";

  const calGrid = $("#calGrid"), calMonthEl = $("#calMonth");

  function renderCalendar() {
    calMonthEl.textContent = `${MONTHS[view.m]} ${view.y}`;
    const first = new Date(view.y, view.m, 1);
    const startPad = (first.getDay() + 6) % 7; // Mon=0
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    let html = "";
    for (let i = 0; i < startPad; i++) html += `<div class="cal__cell empty"></div>`;
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(view.y, view.m, day);
      const key = iso(date);
      const isToday = date.getTime() === TODAY.getTime();
      const isPast = date < TODAY;
      let cls = "cal__cell";
      if (isPast && !isToday) cls += " past";
      else if (isToday) cls += " today";
      else if (skip.has(key)) cls += " skip selectable";
      else if (deliv.has(key)) cls += " on selectable";
      else cls += " selectable";
      html += `<div class="${cls}" data-key="${key}">${day}</div>`;
    }
    calGrid.innerHTML = html;

    $$(".cal__cell.selectable", calGrid).forEach((cell) => {
      cell.addEventListener("click", () => {
        const key = cell.dataset.key;
        if (deliv.has(key)) { deliv.delete(key); skip.add(key); toast("Доставка на этот день отменена"); }
        else if (skip.has(key)) { skip.delete(key); deliv.add(key); toast("Доставка возвращена"); }
        else { deliv.add(key); toast("✓ Добавлен день доставки"); }
        renderCalendar();
        updateDeliveryInfo();
      });
    });
  }

  function updateDeliveryInfo() {
    // counts for viewed month
    const monthPrefix = `${view.y}-${String(view.m + 1).padStart(2, "0")}`;
    const dDays = [...deliv].filter((k) => k.startsWith(monthPrefix)).length;
    const sDays = [...skip].filter((k) => k.startsWith(monthPrefix)).length;
    $("#dcDays").textContent = dDays;
    $("#dcSkips").textContent = sDays;

    // next delivery globally (>= tomorrow)
    const tomorrow = new Date(TODAY); tomorrow.setDate(tomorrow.getDate() + 1);
    const next = [...deliv].map((k) => k).filter((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d) >= tomorrow;
    }).sort()[0];
    const nextDate = $("#nextDate"), nextWin = $("#nextWin");
    if (next) {
      const [y, m, d] = next.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      const isTomorrow = dt.getTime() === tomorrow.getTime();
      nextDate.textContent = (isTomorrow ? "завтра, " : "") + `${d} ${MONTHS_GEN[m - 1]}`;
    } else {
      nextDate.textContent = "не запланирована";
    }
    nextWin.textContent = "окно " + win;
  }

  $("#calPrev").addEventListener("click", () => {
    view.m--; if (view.m < 0) { view.m = 11; view.y--; }
    renderCalendar(); updateDeliveryInfo();
  });
  $("#calNext").addEventListener("click", () => {
    view.m++; if (view.m > 11) { view.m = 0; view.y++; }
    renderCalendar(); updateDeliveryInfo();
  });

  $$("#winSeg button").forEach((b) => b.addEventListener("click", () => {
    $$("#winSeg button").forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    win = b.dataset.win;
    updateDeliveryInfo();
    buildCabinetDeliveries();
  }));

  renderCalendar();
  updateDeliveryInfo();

  /* ============================================================
     LOYALTY — copy referral
     ============================================================ */
  $("#copyRef").addEventListener("click", () => {
    const code = $("#refCode").textContent.trim();
    const done = () => { const b = $("#copyRef"); b.textContent = "Скопировано ✓"; toast("Промокод скопирован"); setTimeout(() => (b.textContent = "Копировать"), 1800); };
    if (navigator.clipboard) navigator.clipboard.writeText(code).then(done).catch(done);
    else done();
  });
  $$("#tiers .tier").forEach((t) => t.addEventListener("click", () => {
    $$("#tiers .tier").forEach((x) => x.classList.remove("is-current"));
    t.classList.add("is-current");
  }));

  /* ============================================================
     FAQ accordion
     ============================================================ */
  $$("#acc .acc__item").forEach((item) => {
    const q = $(".acc__q", item), a = $(".acc__a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$("#acc .acc__item").forEach((it) => { it.classList.remove("open"); $(".acc__a", it).style.maxHeight = null; });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ============================================================
     MODALS (generic)
     ============================================================ */
  let lastFocus = null;
  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal(modal) {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$(".modal").forEach((modal) =>
    $$("[data-close]", modal).forEach((el) => el.addEventListener("click", () => closeModal(modal))));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") $$(".modal.open").forEach(closeModal); });

  /* ---------- Cabinet ---------- */
  const cabinetModal = $("#cabinetModal");
  $("#openCabinet").addEventListener("click", () => openModal(cabinetModal));
  $("#openCabinetMobile").addEventListener("click", () => { toggleMenu(false); openModal(cabinetModal); });
  $("#openCabinetFromCal").addEventListener("click", () => openModal(cabinetModal));

  $$("#cabinetTabs button").forEach((b) => b.addEventListener("click", () => {
    $$("#cabinetTabs button").forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    $$(".cabtab").forEach((p) => p.classList.toggle("is-active", p.dataset.pane === b.dataset.tab));
  }));

  function buildCabinetDeliveries() {
    const tomorrow = new Date(TODAY); tomorrow.setDate(tomorrow.getDate() + 1);
    const upcoming = [...deliv].filter((k) => {
      const [y, m, d] = k.split("-").map(Number);
      return new Date(y, m - 1, d) >= tomorrow;
    }).sort().slice(0, 5);
    const wd = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
    const rowsFor = (n) => upcoming.slice(0, n).map((k, i) => {
      const [y, m, d] = k.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      const lbl = i === 0 ? "Завтра" : `${wd[dt.getDay()]}, ${d} ${MONTHS_GEN[m - 1]}`;
      return `<li>
          <span class="cd-date">${lbl}</span>
          <span class="cd-info">Окно <b>${win}</b> · Баланс 1800 ккал</span>
          <button class="cab-skip" data-key="${k}">Пропустить</button>
        </li>`;
    }).join("");
    $("#cabDeliv").innerHTML = rowsFor(3);
    $("#cabDeliv2").innerHTML = rowsFor(5);
    $$(".cab-skip", cabinetModal).forEach((btn) => btn.addEventListener("click", () => {
      btn.textContent = "Пропущено ✓"; btn.classList.add("done");
      const key = btn.dataset.key;
      if (deliv.has(key)) { deliv.delete(key); skip.add(key); }
      renderCalendar(); updateDeliveryInfo();
      toast("День пропущен — деньги перенесены на следующий период");
    }));
  }
  buildCabinetDeliveries();

  $("#cabPause").addEventListener("click", () => toast("⏸ Подписка поставлена на паузу"));
  $("#cabChange").addEventListener("click", () => { closeModal(cabinetModal); document.getElementById("plans").scrollIntoView({ behavior: "smooth" }); });
  $("#cabRenew").addEventListener("click", () => { closeModal(cabinetModal); openPayment("Баланс", monthly ? "На месяц" : "На неделю", monthly ? 27850 : 8190); });

  /* ============================================================
     PAYMENT modal
     ============================================================ */
  const paymentModal = $("#paymentModal");
  const payForm = $("#payForm");
  const paySuccess = $("#paySuccess");

  function openPayment(plan, period, amount) {
    $("#paySummaryPlan").textContent = plan;
    $("#paySummaryPeriod").textContent = period;
    $("#paySummaryAmount").textContent = rub(amount);
    $("#payBtnAmount").textContent = rub(amount);
    $("#payBonus").textContent = "+" + fmt(amount * 0.05);
    payForm.hidden = false;
    paySuccess.hidden = true;
    payForm.reset();
    $$(".field", payForm).forEach((f) => f.classList.remove("invalid"));
    openModal(paymentModal);
  }

  // plan buttons
  $$(".plan__buy").forEach((btn) => btn.addEventListener("click", () => {
    const amount = monthly ? +btn.dataset.amountM : +btn.dataset.amountW;
    openPayment(btn.dataset.plan, monthly ? "На месяц" : "На неделю", amount);
  }));
  // builder checkout
  $("#builderCheckout").addEventListener("click", (e) => {
    const amount = +e.currentTarget.dataset.amount;
    const kcal = e.currentTarget.dataset.kcal;
    openPayment(`Свой рацион · ${kcal} ккал`, "На неделю", amount);
  });

  // masks
  const cardNumber = $("#cardNumber"), cardExp = $("#cardExp"), cardCvc = $("#cardCvc"), payPhone = $("#payPhone");
  cardNumber.addEventListener("input", () => {
    cardNumber.value = cardNumber.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  });
  cardExp.addEventListener("input", () => {
    let v = cardExp.value.replace(/\D/g, "").slice(0, 4);
    if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
    cardExp.value = v;
  });
  cardCvc.addEventListener("input", () => { cardCvc.value = cardCvc.value.replace(/\D/g, "").slice(0, 3); });
  payPhone.addEventListener("input", () => {
    let d = payPhone.value.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    let out = "+7";
    if (d.length > 1) out += " (" + d.slice(1, 4);
    if (d.length >= 4) out += ") " + d.slice(4, 7);
    if (d.length >= 7) out += "-" + d.slice(7, 9);
    if (d.length >= 9) out += "-" + d.slice(9, 11);
    payPhone.value = out;
  });

  function setError(input, msg) {
    const field = input.closest(".field");
    const err = field.querySelector(".error");
    field.classList.toggle("invalid", !!msg);
    if (err && msg) err.textContent = msg;
    return !msg;
  }

  payForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    if ($("#payName").value.trim().length < 2) ok = setError($("#payName"), "Укажите имя") && ok; else setError($("#payName"), "");
    if (payPhone.value.replace(/\D/g, "").length < 11) ok = setError(payPhone, "Введите телефон полностью") && ok; else setError(payPhone, "");
    if ($("#payAddr").value.trim().length < 5) ok = setError($("#payAddr"), "Укажите адрес доставки") && ok; else setError($("#payAddr"), "");

    const num = cardNumber.value.replace(/\s/g, "");
    if (num.length < 16) ok = setError(cardNumber, "Введите 16 цифр карты") && ok; else setError(cardNumber, "");
    if (!/^\d{2}\/\d{2}$/.test(cardExp.value)) ok = setError(cardExp, "ММ/ГГ") && ok;
    else { const mm = +cardExp.value.slice(0, 2); if (mm < 1 || mm > 12) ok = setError(cardExp, "Неверный месяц") && ok; else setError(cardExp, ""); }
    if (cardCvc.value.length < 3) ok = setError(cardCvc, "3 цифры") && ok; else setError(cardCvc, "");
    if ($("#cardName").value.trim().length < 3) ok = setError($("#cardName"), "Имя на карте") && ok; else setError($("#cardName"), "");

    if (!ok) { toast("⚠ Проверьте выделенные поля"); return; }

    /* ── Build order summary and actually send it ── */
    const orderData = {
      name: $("#payName").value.trim(),
      phone: payPhone.value,
      addr: $("#payAddr").value.trim(),
      window: $("#payWindow").value,
      plan: $("#paySummaryPlan").textContent,
      period: $("#paySummaryPeriod").textContent,
      amount: $("#paySummaryAmount").textContent,
      card: "•••• " + num.slice(-4),
    };
    const summary = [
      "Новый заказ рациона · ЕМ.",
      "──────────────────────────────",
      "Тариф:    " + orderData.plan,
      "Период:   " + orderData.period,
      "К оплате: " + orderData.amount,
      "──────────────────────────────",
      "Имя:      " + orderData.name,
      "Телефон:  " + orderData.phone,
      "Адрес:    " + orderData.addr,
      "Окно:     " + orderData.window,
      "Карта:    " + orderData.card,
      "──────────────────────────────",
      "Заявка отправлена с em.food",
    ].join("\n");

    const subject = "Заказ · " + orderData.plan + " · " + orderData.amount;
    const mailto = "mailto:hi@em.food" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(summary);

    /* clipboard backup */
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }
    /* localStorage log (last 30 orders) */
    try {
      const log = JSON.parse(localStorage.getItem("em_orders") || "[]");
      log.push({ at: new Date().toISOString(), ...orderData });
      localStorage.setItem("em_orders", JSON.stringify(log.slice(-30)));
    } catch (_) {}

    const btn = $("#payBtn");
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = "Обработка платежа…";
    setTimeout(() => {
      /* open mail client with prefilled order */
      const a = document.createElement("a");
      a.href = mailto;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();

      payForm.hidden = true;
      paySuccess.hidden = false;
      btn.disabled = false;
      btn.innerHTML = original;
    }, 900);
  });

  $$("#payForm input, #payForm select").forEach((inp) =>
    inp.addEventListener("input", () => inp.closest(".field").classList.remove("invalid")));

  /* ============================================================
     HERO reveal + FX
     ============================================================ */
  const hero = $("#hero");
  if (hero) {
    requestAnimationFrame(() => hero.classList.add("is-in"));
    setTimeout(() => hero.classList.add("is-in"), 140);
  }

  const progress = $("#scrollProgress");
  if (progress) {
    const upd = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
  }

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (fine && !reduce) {
    /* magnetic + tilt cursor-follow disabled — buttons/cards stay put
       (CSS hover lift + shimmer continues to apply) */
    /*
    $$(".magnetic").forEach((el) => {
      const strength = 0.3;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * strength}px, ${(e.clientY - (r.top + r.height / 2)) * strength}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
    $$(".tilt").forEach((el) => {
      const max = 6;
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateZ(4px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
    */
  }

  /* ============================================================
     LIGHTUP-STAGE — hero carousel + rails (центральный блок)
     ============================================================ */
  const cTrack = $("#cTrack");
  if (cTrack) {
    const ORBS = [
      { skin: "orb--smoked", icon: "ic-fish",    name: "Боул с лососем",   tag: "обед · 480 ккал" },
      { skin: "orb--milk",   icon: "ic-granola", name: "Гранола · йогурт", tag: "завтрак · 290 ккал" },
      { skin: "orb--mint",   icon: "ic-leaf",    name: "Detox bowl",       tag: "перекус · 220 ккал" },
      { skin: "orb--rose",   icon: "ic-fish",    name: "Поке с тунцом",    tag: "ужин · 410 ккал" },
      { skin: "orb--amber",  icon: "ic-shrimp",  name: "Том-ям · креветка",tag: "обед · 360 ккал" },
    ];
    let offset = 0;
    const render = () => {
      // visible window of 3 starting from offset
      const out = [];
      for (let i = 0; i < 3; i++) {
        const o = ORBS[(offset + i) % ORBS.length];
        out.push(`<div class="dish-orb">
          <span class="dish-orb__wire"></span>
          <span class="dish-orb__ball ${o.skin}"><svg class="ic ic--orb"><use href="#${o.icon}"/></svg></span>
          <span class="dish-orb__label"><b>${o.name}</b><small>${o.tag}</small></span>
        </div>`);
      }
      cTrack.style.transform = "translateX(-30px)";
      cTrack.style.opacity = "0";
      setTimeout(() => {
        cTrack.innerHTML = out.join("");
        cTrack.style.transform = "translateX(0)";
        cTrack.style.opacity = "1";
      }, 260);
    };
    render();
    $("#cPrev").addEventListener("click", () => {
      offset = (offset - 1 + ORBS.length) % ORBS.length;
      cTrack.style.transition = "transform .35s var(--ease), opacity .25s";
      cTrack.style.transform = "translateX(40px)";
      cTrack.style.opacity = "0";
      setTimeout(render, 220);
    });
    $("#cNext").addEventListener("click", () => {
      offset = (offset + 1) % ORBS.length;
      cTrack.style.transition = "transform .35s var(--ease), opacity .25s";
      cTrack.style.transform = "translateX(-40px)";
      cTrack.style.opacity = "0";
      setTimeout(render, 220);
    });

    /* left rail — category bounce + scroll into menu */
    $$(".rail-l__btn[data-cat]").forEach((b) => b.addEventListener("click", () => {
      $$(".rail-l__btn[data-cat]").forEach((x) => x.classList.remove("is-on"));
      b.classList.add("is-on");
      const cat = b.dataset.cat;
      const filterBtn = $$("#menuFilters button").find((x) => x.dataset.cat === cat);
      if (filterBtn) {
        $$("#menuFilters button").forEach((x) => x.classList.remove("is-active"));
        filterBtn.classList.add("is-active");
        filterBtn.click();
      }
    }));
    const dn = $("#heroScrollDown");
    if (dn) dn.addEventListener("click", () => document.getElementById("goal").scrollIntoView({ behavior: "smooth" }));

    /* right rail — preference chips → builder */
    $$(".filt[data-pref]").forEach((b) => b.addEventListener("click", () => {
      $$(".filt[data-pref]").forEach((x) => x.classList.remove("is-on"));
      b.classList.add("is-on");
      const pref = b.dataset.pref;
      const prefBtn = $$("#ctrlPref button").find((x) => x.dataset.pref === pref);
      if (prefBtn && !prefBtn.classList.contains("is-active")) prefBtn.click();
    }));
  }
})();

/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   ═══════ POLISH v2 ═══════
   Live-feedback observers, stagger reveals, calendar pulse,
   bonus progress fill, goal-panel swap, refer-copy feedback.
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */
(function () {
  "use strict";
  const $  = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Stagger reveal delays on grids ── */
  $$(".steps__grid, .plans__grid, .menu__grid, .reviews__grid, .footer__cols, .tiers, .goal__cards, .gp__metrics, .cab-grid")
    .forEach((grid) => {
      Array.from(grid.children).forEach((child, idx) => {
        child.style.setProperty("--rev-delay", (idx * 0.06) + "s");
      });
    });

  /* ── Constructor: pulse total when value changes ── */
  const totalEl = $("#sumWeek");
  const totalWrap = totalEl && totalEl.closest(".summary__total");
  if (totalEl && totalWrap && !reduce){
    let lastVal = totalEl.textContent;
    let tmr;
    const mo = new MutationObserver(() => {
      const cur = totalEl.textContent;
      if (cur === lastVal) return;
      lastVal = cur;
      totalWrap.classList.remove("is-pulse");
      void totalWrap.offsetWidth;
      totalWrap.classList.add("is-pulse");
      clearTimeout(tmr);
      tmr = setTimeout(() => totalWrap.classList.remove("is-pulse"), 600);
    });
    mo.observe(totalEl, { childList: true, characterData: true, subtree: true });
  }

  /* ── Constructor: pulse KBJU ring when calorie count changes ── */
  const kcalEl = $("#sumKcal");
  const ring = $("#kbjuRing");
  if (kcalEl && ring && !reduce){
    let lastKcal = kcalEl.textContent;
    let tmr2;
    const mo2 = new MutationObserver(() => {
      const cur = kcalEl.textContent;
      if (cur === lastKcal) return;
      lastKcal = cur;
      ring.classList.remove("is-pulse");
      void ring.offsetWidth;
      ring.classList.add("is-pulse");
      clearTimeout(tmr2);
      tmr2 = setTimeout(() => ring.classList.remove("is-pulse"), 600);
    });
    mo2.observe(kcalEl, { childList: true, characterData: true, subtree: true });
  }

  /* ── Goal panel: smooth swap animation when goal changes ── */
  const goalPanel = $("#goalPanel");
  if (goalPanel && !reduce){
    let tmr3;
    const mo3 = new MutationObserver(() => {
      goalPanel.classList.remove("is-swap");
      void goalPanel.offsetWidth;
      goalPanel.classList.add("is-swap");
      clearTimeout(tmr3);
      tmr3 = setTimeout(() => goalPanel.classList.remove("is-swap"), 600);
    });
    mo3.observe(goalPanel, { childList: true });
  }

  /* ── Calendar: brief pulse on cell click ── */
  const calGrid = $("#calGrid");
  if (calGrid && !reduce){
    calGrid.addEventListener("click", (e) => {
      const cell = e.target.closest(".cal__cell");
      if (!cell) return;
      cell.classList.remove("is-flash");
      void cell.offsetWidth;
      cell.classList.add("is-flash");
      setTimeout(() => cell.classList.remove("is-flash"), 500);
    });
  }

  /* ── Bonus card: animate tier-progress bar from 0 → 64% when in view ── */
  const bonusCard = document.querySelector(".bonus__card");
  if (bonusCard){
    const bio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting){
          setTimeout(() => bonusCard.classList.add("is-progress"), 200);
          bio.unobserve(en.target);
        }
      });
    }, { threshold: 0.3 });
    bio.observe(bonusCard);
  }

  /* ── Refer-code copy: success state feedback ── */
  const copyRef = $("#copyRef");
  const refCode = $("#refCode");
  if (copyRef && refCode){
    copyRef.addEventListener("click", () => {
      const code = refCode.textContent.trim();
      const finish = () => {
        const original = copyRef.textContent;
        copyRef.textContent = "Скопировано ✓";
        copyRef.classList.add("is-copied");
        setTimeout(() => {
          copyRef.textContent = original;
          copyRef.classList.remove("is-copied");
        }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(code).then(finish).catch(finish);
      } else {
        finish();
      }
    });
  }

  /* ── Scroll-margin offset for sticky nav ── */
  $$("section[id], main [id]").forEach((s) => {
    if (!s.style.scrollMarginTop) s.style.scrollMarginTop = "90px";
  });
})();
