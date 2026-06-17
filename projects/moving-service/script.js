/* ============================================================
   ТОЧКА Б — интерактив переезда
   Калькулятор · квиз по вещам · онлайн-заказ
   ============================================================ */
(function () {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const fmt = (n) => Math.round(n).toLocaleString("ru-RU");

  const TRUCK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="6" width="15" height="12" rx="1"/><path d="M16 10h4l3 4v4h-7V10z"/><circle cx="7" cy="20" r="2"/><circle cx="20" cy="20" r="2"/></svg>`;
  const VAN_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="17" height="12" rx="2"/><path d="M19 10h2l2 3v5h-4v-8z"/><circle cx="7" cy="20" r="2"/><circle cx="19" cy="20" r="2"/></svg>`;
  const FURA_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="1" y="4" width="16" height="14" rx="1"/><path d="M17 8h4l3 5v5h-7V8z"/><circle cx="7" cy="20" r="2"/><circle cx="21" cy="20" r="2"/><line x1="1" y1="10" x2="17" y2="10"/></svg>`;

  const HOUSE_ICONS = {
    studio: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M2 11l10-8 10 8"/></svg>`,
    "1k": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M2 11l10-8 10 8"/><line x1="10" y1="21" x2="10" y2="15"/></svg>`,
    "2k": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="11" width="18" height="10" rx="1"/><path d="M2 11l10-8 10 8"/><line x1="9" y1="21" x2="9" y2="15"/><line x1="15" y1="21" x2="15" y2="15"/></svg>`,
    "3k": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="10" width="20" height="11" rx="1"/><path d="M1 10l11-8 11 8"/><line x1="8" y1="21" x2="8" y2="14"/><line x1="12" y1="21" x2="12" y2="14"/><line x1="16" y1="21" x2="16" y2="14"/></svg>`,
    house: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 10l9-7 9 7v10a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"/><path d="M9 21V14h6v7"/></svg>`,
    office: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="2" width="16" height="20" rx="1"/><line x1="9" y1="6" x2="9" y2="6.01"/><line x1="15" y1="6" x2="15" y2="6.01"/><line x1="9" y1="10" x2="9" y2="10.01"/><line x1="15" y1="10" x2="15" y2="10.01"/><line x1="9" y1="14" x2="9" y2="14.01"/><line x1="15" y1="14" x2="15" y2="14.01"/><rect x="9" y="18" width="6" height="4"/></svg>`,
  };

  /* ---------- Toast ---------- */
  const toastEl = $("#toast");
  let toastTimer;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  /* ---------- Sticky nav + scroll progress ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 16);
    const h = document.documentElement;
    const max = h.scrollHeight - h.clientHeight;
    progress.style.transform = `scaleX(${max > 0 ? h.scrollTop / max : 0})`;
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  function toggleMenu(force) {
    const open = force ?? !menu.classList.contains("open");
    menu.classList.toggle("open", open);
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => toggleMenu());
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ---------- Reveal ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Counters ---------- */
  const cio = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const dec = +(el.dataset.decimals || 0);
        const suffix = el.dataset.suffix || "";
        const fin = () => (dec ? target.toFixed(dec).replace(".", ",") : Math.round(target).toLocaleString("ru-RU")) + suffix;
        if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          el.textContent = fin(); cio.unobserve(el); return;
        }
        const dur = 1500, start = performance.now();
        function tick(now) {
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const v = target * eased;
          el.textContent = (dec ? v.toFixed(dec).replace(".", ",") : Math.round(v).toLocaleString("ru-RU")) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => cio.observe(el));

  /* ============================================================
     TRUCK helper
     ============================================================ */
  function pickTruck(vol) {
    if (vol <= 9) return { name: "Газель", cap: 9, svg: VAN_SVG, base: 2500, perFloor: 200, loaders: 1 };
    if (vol <= 22) return { name: "Грузовик 5 т", cap: 22, svg: TRUCK_SVG, base: 4200, perFloor: 300, loaders: 2 };
    return { name: "Фура 10 т", cap: 40, svg: FURA_SVG, base: 6500, perFloor: 450, loaders: 3 };
  }

  /* ============================================================
     CALCULATOR
     ============================================================ */
  const state = {
    type: "apartment",
    rooms: 10,
    area: 60,
    ivol: 4,
    dist: "city",
    km: 12,
    floorFrom: 3, floorTo: 5,
    elevFrom: true, elevTo: false,
    loaders: 2,
    packing: false, assembly: false, trash: false, insurance: true,
  };
  const KM_PRESET = { city: { min: 1, max: 80, step: 1, def: 12 }, intercity: { min: 10, max: 1500, step: 10, def: 300 } };

  function setRangeFill(el) {
    const min = +el.min, max = +el.max;
    el.style.setProperty("--p", ((el.value - min) / (max - min)) * 100 + "%");
  }

  function getVolume() {
    if (state.type === "office") return state.area * 0.4;
    if (state.type === "items") return state.ivol;
    return state.rooms;
  }

  let shownTotal = 0;
  const totalEl = $("#totalPrice");
  function animateTotal(to) {
    if (document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      totalEl.textContent = fmt(to); shownTotal = to; return;
    }
    const from = shownTotal, dur = 600, start = performance.now();
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      totalEl.textContent = fmt(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick); else shownTotal = to;
    }
    requestAnimationFrame(tick);
  }

  const breakdownEl = $("#breakdown");
  let lastTotal = 0;

  function computeCalc() {
    const vol = getVolume();
    const truck = pickTruck(vol);
    const lines = [];

    lines.push({ l: `Машина «${truck.name}»`, v: truck.base });

    let distCost = 0;
    if (state.dist === "city") {
      const billable = Math.max(0, state.km - 15);
      distCost = billable * 40;
      lines.push(billable === 0
        ? { l: `Подача и ${state.km} км по городу`, v: 0, free: true }
        : { l: `Перевозка ${state.km} км по городу`, v: distCost });
    } else {
      distCost = state.km * 30;
      lines.push({ l: `Межгород ${state.km} км`, v: distCost });
    }

    const loadersCost = state.loaders * 1900;
    if (state.loaders > 0) lines.push({ l: `Грузчики · ${state.loaders} чел.`, v: loadersCost });

    const cFrom = state.elevFrom ? 0 : Math.max(0, state.floorFrom - 1);
    const cTo = state.elevTo ? 0 : Math.max(0, state.floorTo - 1);
    const floors = cFrom + cTo;
    const floorCost = floors * truck.perFloor;
    if (floorCost > 0) lines.push({ l: `Подъём без лифта · ${floors} эт.`, v: floorCost });

    const packingCost = state.packing ? Math.round(vol * 150) : 0;
    if (state.packing) lines.push({ l: "Упаковка материалами", v: packingCost });
    const assemblyCost = state.assembly ? 3000 : 0;
    if (state.assembly) lines.push({ l: "Сборка / разборка мебели", v: assemblyCost });
    const trashCost = state.trash ? 1500 : 0;
    if (state.trash) lines.push({ l: "Вывоз мусора", v: trashCost });
    const insCost = state.insurance ? 990 : 0;
    if (state.insurance) lines.push({ l: "Страхование груза", v: insCost });

    const total = truck.base + distCost + loadersCost + floorCost + packingCost + assemblyCost + trashCost + insCost;
    return { truck, vol, lines, total };
  }

  function renderCalc() {
    const r = computeCalc();
    $("#truckIcon").innerHTML = r.truck.svg;
    $("#truckName").textContent = r.truck.name;
    $("#truckVol").textContent = `до ${r.truck.cap} м³ · ваш объём ≈ ${r.vol.toFixed(1).replace(".0", "").replace(".", ",")} м³`;

    breakdownEl.innerHTML = r.lines.map((x) =>
      `<li class="${x.free ? "is-free" : ""}"><span>${x.l}</span><b>${x.free ? "включено" : fmt(x.v) + " ₽"}</b></li>`
    ).join("");

    animateTotal(r.total);
    lastTotal = r.total;
  }

  /* segmented controls */
  $$("[data-calc]").forEach((group) => {
    const key = group.dataset.calc;
    $$(".seg", group).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".seg", group).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        if (key === "type") {
          state.type = btn.dataset.val;
          $$("[data-show]").forEach((b) => { b.hidden = b.dataset.show !== state.type; });
        } else if (key === "rooms") {
          state.rooms = +btn.dataset.vol;
        } else if (key === "dist") {
          state.dist = btn.dataset.val;
          const p = KM_PRESET[state.dist];
          km.min = p.min; km.max = p.max; km.step = p.step; km.value = p.def;
          state.km = p.def;
          $("#kmMax").textContent = p.max + " км";
          $('[data-out="km"]').textContent = p.def;
          setRangeFill(km);
        }
        renderCalc();
      });
    });
  });

  /* ranges */
  const km = $("#kmRange"), area = $("#areaRange"), ivol = $("#ivolRange");
  km.addEventListener("input", () => { state.km = +km.value; $('[data-out="km"]').textContent = km.value; setRangeFill(km); renderCalc(); });
  area.addEventListener("input", () => { state.area = +area.value; $('[data-out="area"]').textContent = area.value; setRangeFill(area); renderCalc(); });
  ivol.addEventListener("input", () => { state.ivol = +ivol.value; $('[data-out="ivol"]').textContent = ivol.value; setRangeFill(ivol); renderCalc(); });
  [km, area, ivol].forEach(setRangeFill);

  /* steppers */
  $$(".stepper[data-step]").forEach((st) => {
    const key = st.dataset.step, min = +st.dataset.min, max = +st.dataset.max;
    const valEl = $(".stepper__val", st);
    $$("button", st).forEach((b) =>
      b.addEventListener("click", () => {
        let v = +valEl.textContent + +b.dataset.dir;
        v = Math.max(min, Math.min(max, v));
        valEl.textContent = v;
        state[key] = v;
        renderCalc();
      })
    );
  });

  /* elevator checkboxes */
  $("#elevFrom").addEventListener("change", (e) => { state.elevFrom = e.target.checked; renderCalc(); });
  $("#elevTo").addEventListener("change", (e) => { state.elevTo = e.target.checked; renderCalc(); });

  /* extras */
  $$("[data-extra]").forEach((cb) =>
    cb.addEventListener("change", () => { state[cb.dataset.extra] = cb.checked; renderCalc(); })
  );

  renderCalc();

  /* ============================================================
     QUIZ
     ============================================================ */
  const ROOMS = [
    { room: "Гостиная", items: [
      { id: "sofa", name: "Диван", v: 1.8 }, { id: "armchair", name: "Кресло", v: 0.5 },
      { id: "wall", name: "Стенка / горка", v: 2.2 }, { id: "tvstand", name: "ТВ-тумба", v: 0.5 },
      { id: "tv", name: "Телевизор", v: 0.3 }, { id: "coffee", name: "Журнальный столик", v: 0.3 },
      { id: "carpet", name: "Ковёр", v: 0.2 },
    ]},
    { room: "Кухня", items: [
      { id: "fridge", name: "Холодильник", v: 0.9 }, { id: "stove", name: "Плита", v: 0.5 },
      { id: "kitchen", name: "Кух. гарнитур", v: 1.6 }, { id: "ktable", name: "Обеденный стол", v: 0.6 },
      { id: "chairs", name: "Стулья (4)", v: 0.5 }, { id: "micro", name: "Микроволновка", v: 0.1 },
      { id: "dishwasher", name: "Посудомойка", v: 0.4 },
    ]},
    { room: "Спальня", items: [
      { id: "bed", name: "Кровать", v: 1.6 }, { id: "mattress", name: "Матрас", v: 0.6 },
      { id: "closet", name: "Шкаф-купе", v: 2.4 }, { id: "dresser", name: "Комод", v: 0.7 },
      { id: "nightstand", name: "Тумбочки", v: 0.3 }, { id: "vanity", name: "Туал. столик", v: 0.4 },
    ]},
    { room: "Детская", items: [
      { id: "kidbed", name: "Детская кровать", v: 1.0 }, { id: "desk", name: "Письменный стол", v: 0.6 },
      { id: "kidwardrobe", name: "Детский шкаф", v: 1.2 }, { id: "shelf", name: "Стеллаж", v: 0.6 },
      { id: "toys", name: "Игрушки (коробки)", v: 0.5 },
    ]},
    { room: "Прихожая и ванная", items: [
      { id: "washer", name: "Стиральная машина", v: 0.5 }, { id: "hallway", name: "Шкаф в прихожую", v: 1.0 },
      { id: "mirror", name: "Зеркало", v: 0.2 }, { id: "shoerack", name: "Обувница", v: 0.3 },
    ]},
    { room: "Офис", items: [
      { id: "odesk", name: "Рабочее место", v: 0.8 }, { id: "ochair", name: "Кресло офисное", v: 0.4 },
      { id: "ocab", name: "Шкаф / стеллаж", v: 1.4 }, { id: "meet", name: "Стол переговоров", v: 1.4 },
      { id: "safe2", name: "Сейф", v: 0.4 }, { id: "tech", name: "Оргтехника", v: 0.5 },
    ]},
    { room: "Разное", items: [
      { id: "boxes", name: "Коробки (×10)", v: 1.5 }, { id: "bike", name: "Велосипед", v: 0.4 },
      { id: "sport", name: "Спортинвентарь", v: 0.4 }, { id: "plants", name: "Растения", v: 0.3 },
    ]},
  ];
  const ITEM_BY_ID = {};
  ROOMS.forEach((r) => r.items.forEach((it) => (ITEM_BY_ID[it.id] = it)));

  const HOUSES = [
    { id: "studio", name: "Студия", vol: "~6 м³",
      preset: { sofa: 1, fridge: 1, stove: 1, micro: 1, bed: 1, closet: 1, washer: 1, tv: 1, boxes: 1 } },
    { id: "1k", name: "1-комнатная", vol: "~10 м³",
      preset: { sofa: 1, wall: 1, tv: 1, fridge: 1, kitchen: 1, ktable: 1, chairs: 1, bed: 1, closet: 1, dresser: 1, washer: 1, hallway: 1, boxes: 1 } },
    { id: "2k", name: "2-комнатная", vol: "~16 м³",
      preset: { sofa: 1, wall: 1, tv: 1, armchair: 2, fridge: 1, kitchen: 1, ktable: 1, chairs: 1, dishwasher: 1, bed: 1, closet: 1, dresser: 1, kidbed: 1, desk: 1, kidwardrobe: 1, washer: 1, hallway: 1, mirror: 1, boxes: 2 } },
    { id: "3k", name: "3-комнатная", vol: "~24 м³",
      preset: { sofa: 1, wall: 1, tv: 2, armchair: 2, fridge: 1, kitchen: 1, ktable: 1, chairs: 1, dishwasher: 1, bed: 2, closet: 2, dresser: 1, kidbed: 1, desk: 1, kidwardrobe: 1, shelf: 1, washer: 1, hallway: 1, mirror: 1, carpet: 1, boxes: 3 } },
    { id: "house", name: "Дом / коттедж", vol: "~34 м³",
      preset: { sofa: 2, wall: 1, tv: 2, armchair: 2, fridge: 1, kitchen: 1, ktable: 1, chairs: 1, dishwasher: 1, bed: 2, closet: 2, dresser: 2, kidbed: 1, desk: 1, kidwardrobe: 1, washer: 1, hallway: 1, mirror: 1, shoerack: 1, carpet: 1, bike: 1, sport: 1, plants: 1, boxes: 4 } },
    { id: "office", name: "Офис", vol: "~20 м³",
      preset: { odesk: 6, ochair: 6, ocab: 3, meet: 1, safe2: 1, tech: 3, fridge: 1, boxes: 3 } },
  ];

  const quiz = { step: 0, house: null, qty: {} };
  const mount = $("#quizMount");
  const bar = $("#quizBar");
  const stepNum = $("#quizStepNum");
  const stepName = $("#quizStepName");
  const STEP_NAMES = ["Тип жилья", "Что везём", "Результат"];

  function quizVolume() {
    let v = 0;
    for (const id in quiz.qty) v += (ITEM_BY_ID[id]?.v || 0) * quiz.qty[id];
    return v;
  }

  function renderQuiz() {
    bar.style.width = ((quiz.step + 1) / 3) * 100 + "%";
    stepNum.textContent = quiz.step + 1;
    stepName.textContent = STEP_NAMES[quiz.step];

    if (quiz.step === 0) renderStep1();
    else if (quiz.step === 1) renderStep2();
    else renderStep3();
  }

  function renderStep1() {
    mount.innerHTML = `
      <div class="qstep">
        <h3 class="qstep__title">Откуда переезжаем?</h3>
        <p class="qstep__hint">Выберите тип жилья — мы заранее отметим типичный набор вещей, а вы поправите.</p>
        <div class="house-grid">
          ${HOUSES.map((h) => `
            <button type="button" class="house ${quiz.house === h.id ? "is-active" : ""}" data-house="${h.id}">
              <span class="house__icon">${HOUSE_ICONS[h.id] || HOUSE_ICONS.studio}</span>
              <span class="house__name">${h.name}</span>
              <span class="house__vol">${h.vol}</span>
            </button>`).join("")}
        </div>
        <div class="quiz__nav">
          <button class="quiz__back" hidden>← Назад</button>
          <button class="btn btn--primary" id="quizNext" ${quiz.house ? "" : "disabled style=opacity:.5;pointer-events:none"}>Дальше →</button>
        </div>
      </div>`;
    $$(".house", mount).forEach((b) =>
      b.addEventListener("click", () => {
        quiz.house = b.dataset.house;
        const preset = HOUSES.find((h) => h.id === quiz.house).preset;
        quiz.qty = Object.assign({}, preset);
        renderStep1();
      })
    );
    const next = $("#quizNext", mount);
    if (next) next.addEventListener("click", () => { if (quiz.house) { quiz.step = 1; renderQuiz(); } });
  }

  function renderStep2() {
    mount.innerHTML = `
      <div class="qstep">
        <h3 class="qstep__title">Отметьте, что везём</h3>
        <p class="qstep__hint">Нажмите на вещь, чтобы добавить или убрать. Количество регулируется кнопками.</p>
        ${ROOMS.map((r) => `
          <div class="qroom">
            <div class="qroom__name">${r.room}</div>
            <div class="qitems">
              ${r.items.map((it) => {
                const q = quiz.qty[it.id] || 0;
                return `
                <div class="qitem ${q > 0 ? "is-on" : ""}" data-item="${it.id}">
                  <span class="qitem__label">${it.name}</span>
                  <span class="qitem__qty">
                    <button type="button" data-q="-1" aria-label="меньше">–</button>
                    <b>${q}</b>
                    <button type="button" data-q="1" aria-label="больше">+</button>
                  </span>
                </div>`;
              }).join("")}
            </div>
          </div>`).join("")}
        <div class="qstep__total" style="font-family:var(--font-d);font-weight:600;margin-top:6px;color:var(--ink-soft)">
          Сейчас в списке: <b style="color:var(--brand-2)" id="qVolNow">0</b> м³
        </div>
        <div class="quiz__nav">
          <button class="quiz__back">← Назад</button>
          <button class="btn btn--primary" id="quizNext">Посчитать объём →</button>
        </div>
      </div>`;

    const updateVol = () => { $("#qVolNow").textContent = quizVolume().toFixed(1).replace(".", ","); };
    updateVol();

    $$(".qitem", mount).forEach((chip) => {
      const id = chip.dataset.item;
      const bEl = $("b", chip);
      const label = $(".qitem__label", chip);
      label.addEventListener("click", () => {
        if ((quiz.qty[id] || 0) > 0) { quiz.qty[id] = 0; chip.classList.remove("is-on"); }
        else { quiz.qty[id] = 1; chip.classList.add("is-on"); }
        bEl.textContent = quiz.qty[id] || 0;
        updateVol();
      });
      $$(".qitem__qty button", chip).forEach((btn) =>
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          let q = (quiz.qty[id] || 0) + +btn.dataset.q;
          q = Math.max(0, Math.min(20, q));
          quiz.qty[id] = q;
          bEl.textContent = q;
          chip.classList.toggle("is-on", q > 0);
          updateVol();
        })
      );
    });

    $(".quiz__back", mount).addEventListener("click", () => { quiz.step = 0; renderQuiz(); });
    $("#quizNext", mount).addEventListener("click", () => {
      if (quizVolume() < 0.5) { toast("Отметьте хотя бы несколько вещей"); return; }
      quiz.step = 2; renderQuiz();
    });
  }

  function renderStep3() {
    const vol = quizVolume();
    const truck = pickTruck(vol);
    const loaders = vol > 18 ? truck.loaders + 1 : truck.loaders;
    const estLow = Math.round((truck.base + vol * 260 + loaders * 1900) / 100) * 100;
    const estHigh = Math.round((estLow * 1.4) / 100) * 100;

    mount.innerHTML = `
      <div class="qstep">
        <h3 class="qstep__title">Готово! Вот что получилось</h3>
        <p class="qstep__hint">Предварительная оценка по вашему списку. Точную цену зафиксируем после бесплатного замера.</p>
        <div class="qresult">
          <div class="qres-main">
            <div class="qres-main__truck">${truck.svg}</div>
            <div>
              <h4>Рекомендуем</h4>
              <strong>${truck.name}</strong>
              <em>вместимость до ${truck.cap} м³</em>
            </div>
          </div>
          <div class="qres-cell"><span>Объём вещей</span><strong><b>${vol.toFixed(1).replace(".", ",")}</b> м³</strong></div>
          <div class="qres-cell"><span>Нужно грузчиков</span><strong><b>${loaders}</b> чел.</strong></div>
          <div class="qres-cell"><span>Ориентир по цене</span><strong>${fmt(estLow)}–${fmt(estHigh)} ₽</strong></div>
          <div class="qres-cell"><span>Время переезда</span><strong>≈ <b>${Math.max(3, Math.round(vol / 4))}</b> ч</strong></div>
        </div>
        <div class="quiz__nav">
          <button class="quiz__back">← Изменить список</button>
          <button class="btn btn--primary" id="quizOrder"
            data-order="Квиз по вещам"
            data-summary="${fmt(estLow)}–${fmt(estHigh)} ₽"
            data-source="Квиз: ${truck.name}, ${vol.toFixed(1).replace(".", ",")} м³, ${loaders} грузчика(ов)">
            Оформить переезд →
          </button>
        </div>
      </div>`;

    $(".quiz__back", mount).addEventListener("click", () => { quiz.step = 1; renderQuiz(); });
    bindOrderTrigger($("#quizOrder", mount));
  }

  renderQuiz();

  /* ============================================================
     PRICING toggle
     ============================================================ */
  const billingSwitch = $("#billingSwitch");
  const labApt = $("#labApt"), labOff = $("#labOff");
  let office = false;
  function updatePrices() {
    $$(".plan .amount").forEach((el) => {
      const val = +(office ? el.dataset.off : el.dataset.apt);
      el.style.opacity = "0";
      setTimeout(() => { el.textContent = val.toLocaleString("ru-RU"); el.style.opacity = "1"; }, 150);
    });
    labApt.classList.toggle("is-active", !office);
    labOff.classList.toggle("is-active", office);
  }
  billingSwitch.addEventListener("click", () => {
    office = !office;
    billingSwitch.classList.toggle("on", office);
    billingSwitch.setAttribute("aria-checked", String(office));
    updatePrices();
  });

  /* ============================================================
     MODAL + ORDER
     ============================================================ */
  const modal = $("#orderModal");
  const orderForm = $("#orderForm");
  const orderSuccess = $("#orderSuccess");
  const orderSource = $("#orderSource");
  const orderSummary = $("#orderSummary");
  const orderSummaryVal = $("#orderSummaryVal");
  let lastFocus = null;

  function openModal() {
    lastFocus = document.activeElement;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    orderForm.hidden = false;
    orderSuccess.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  $$("[data-close]", modal).forEach((el) => el.addEventListener("click", closeModal));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("open")) closeModal(); });

  function openOrder({ source, summary } = {}) {
    orderForm.hidden = false;
    orderSuccess.hidden = true;
    orderForm.reset();
    $$(".field", orderForm).forEach((f) => f.classList.remove("invalid"));
    $("#oAgree").checked = true;
    orderSource.textContent = source || "Перезвоним в течение 15 минут и подтвердим детали.";
    if (summary) { orderSummary.hidden = false; orderSummaryVal.textContent = summary; }
    else orderSummary.hidden = true;
    openModal();
  }

  function bindOrderTrigger(el) {
    if (!el) return;
    el.addEventListener("click", () => {
      const opts = { source: el.dataset.source };
      if (el.dataset.summary) opts.summary = el.dataset.summary;
      if (el.id === "calcOrder") opts.summary = fmt(lastTotal) + " ₽";
      if (el.dataset.order && !el.dataset.source) opts.source = "Заявка: " + el.dataset.order;
      openOrder(opts);
    });
  }
  $$("[data-order]").forEach(bindOrderTrigger);

  $$(".plan__buy").forEach((btn) =>
    btn.addEventListener("click", () => {
      const card = btn.closest(".plan");
      const amount = +(office ? $(".amount", card).dataset.off : $(".amount", card).dataset.apt);
      openOrder({ source: btn.dataset.plan + (office ? " · офис" : " · квартира"), summary: fmt(amount) + " ₽" });
    })
  );

  /* phone mask */
  const oPhone = $("#oPhone");
  oPhone.addEventListener("input", () => {
    let d = oPhone.value.replace(/\D/g, "");
    if (d.startsWith("8")) d = "7" + d.slice(1);
    if (!d.startsWith("7")) d = "7" + d;
    d = d.slice(0, 11);
    let out = "+7";
    if (d.length > 1) out += " (" + d.slice(1, 4);
    if (d.length >= 4) out += ") " + d.slice(4, 7);
    if (d.length >= 7) out += "-" + d.slice(7, 9);
    if (d.length >= 9) out += "-" + d.slice(9, 11);
    oPhone.value = out;
  });

  function setError(input, msg) {
    const field = input.closest(".field");
    const err = field.querySelector(".error");
    field.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg;
    return !msg;
  }
  function validateOrder() {
    let ok = true, first = null;
    const checks = [
      ["#oName", (v) => (v.trim().length >= 2 ? "" : "Укажите имя")],
      ["#oPhone", (v) => (v.replace(/\D/g, "").length >= 11 ? "" : "Введите телефон полностью")],
      ["#oFrom", (v) => (v.trim() ? "" : "Укажите адрес отправления")],
      ["#oTo", (v) => (v.trim() ? "" : "Укажите адрес назначения")],
      ["#oDate", (v) => (v ? "" : "Выберите дату")],
    ];
    checks.forEach(([sel, fn]) => {
      const inp = $(sel);
      const msg = fn(inp.value);
      if (!setError(inp, msg)) { ok = false; if (!first) first = inp; }
    });
    if (!$("#oAgree").checked) { ok = false; toast("Подтвердите согласие на обработку данных"); }
    if (first) first.focus();
    return ok;
  }
  $$("#orderForm input, #orderForm select").forEach((inp) =>
    inp.addEventListener("input", () => inp.closest(".field")?.classList.remove("invalid"))
  );

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateOrder()) return;
    const btn = $("#orderSubmit");
    const orig = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Отправляем…";
    setTimeout(() => {
      btn.disabled = false;
      btn.textContent = orig;
      const num = "#Б-" + String(Math.floor(1000 + Math.random() * 9000));
      $("#orderNumber").textContent = num;
      orderForm.hidden = true;
      orderSuccess.hidden = false;
      toast("Заявка отправлена! " + num);
    }, 1200);
  });

  /* ============================================================
     Modern FX
     ============================================================ */
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (fine && !reduce) {
    const glow = $("#cursorGlow");
    if (glow) {
      let gx = innerWidth / 2, gy = innerHeight / 2, tx = gx, ty = gy, running = false;
      function loop() {
        gx += (tx - gx) * 0.16; gy += (ty - gy) * 0.16;
        glow.style.transform = `translate(${gx}px,${gy}px) translate(-50%,-50%)`;
        if (Math.abs(tx - gx) > 0.5 || Math.abs(ty - gy) > 0.5) requestAnimationFrame(loop);
        else running = false;
      }
      addEventListener("mousemove", (e) => { tx = e.clientX; ty = e.clientY; if (!running) { running = true; requestAnimationFrame(loop); } }, { passive: true });
    }

    /* Magnetic floating effect disabled — buttons stay put.
       Hover lift + shimmer-sweep from CSS still apply. */
    /*
    $$(".magnetic").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.28}px,${(e.clientY - (r.top + r.height / 2)) * 0.28}px)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
    */

    $$(".tilt").forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 6}deg)`;
      });
      el.addEventListener("mouseleave", () => { el.style.transform = ""; });
    });
  }
})();

/* ============================================================
   POLISH v2 — enhancements
   word-split hero · pulse on total change · stagger reveals
   ============================================================ */
(function () {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Split hero title into word spans for staggered reveal --- */
  const heroTitle = document.querySelector(".hero__title");
  if (heroTitle && !reduce) {
    // Only walk text nodes whose parent isn't already a .word/.hero__b inner already
    const walker = document.createTreeWalker(heroTitle, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    let node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue && node.nodeValue.trim().length) textNodes.push(node);
    }
    let wordIndex = 0;
    textNodes.forEach((tn) => {
      // Split on regular whitespace only; preserve nbsp as part of the word
      const parts = tn.nodeValue.split(/([ \t\n\r]+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p) => {
        if (!p) return;
        if (/^[ \t\n\r]+$/.test(p)) {
          frag.appendChild(document.createTextNode(p));
        } else {
          const s = document.createElement("span");
          s.className = "word";
          s.textContent = p;
          s.style.animationDelay = (0.08 + wordIndex * 0.06) + "s";
          wordIndex++;
          frag.appendChild(s);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  /* --- Pulse total price on calc change --- */
  const totalEl = document.querySelector("#totalPrice");
  const priceWrap = totalEl ? totalEl.closest(".summary__price") : null;
  if (totalEl && priceWrap && !reduce) {
    let pulseTimer;
    const mo = new MutationObserver(() => {
      priceWrap.classList.remove("is-pulse");
      void priceWrap.offsetWidth; // reflow to restart animation
      priceWrap.classList.add("is-pulse");
      clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => priceWrap.classList.remove("is-pulse"), 600);
    });
    mo.observe(totalEl, { childList: true, characterData: true, subtree: true });
  }

  /* --- Stagger reveal delays across grids --- */
  document.querySelectorAll(
    ".svc-grid, .steps, .plans, .rev-grid, .ins-cards, .acc, .house-grid"
  ).forEach((grid) => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.setProperty("--rev-delay", (i * 0.07) + "s");
    });
  });

  /* --- Animate truck icon swap when calculator recommends a different vehicle --- */
  (function () {
    const icon = document.querySelector("#truckIcon");
    const name = document.querySelector("#truckName");
    if (!icon || !name || reduce) return;
    const wrap = icon.closest(".summary__truck");
    let last = name.textContent.trim();
    let timer;
    const tmo = new MutationObserver(() => {
      const cur = name.textContent.trim();
      if (cur === last) return;
      last = cur;
      icon.classList.remove("is-swap");
      if (wrap) wrap.classList.remove("is-swap-pulse");
      void icon.offsetWidth;
      icon.classList.add("is-swap");
      if (wrap) wrap.classList.add("is-swap-pulse");
      clearTimeout(timer);
      timer = setTimeout(() => {
        icon.classList.remove("is-swap");
        if (wrap) wrap.classList.remove("is-swap-pulse");
      }, 600);
    });
    tmo.observe(name, { childList: true, characterData: true, subtree: true });
  })();

  /* --- Scroll-margin offset so anchor links don't hide behind sticky nav --- */
  document.querySelectorAll("section[id], main [id]").forEach((s) => {
    s.style.scrollMarginTop = "84px";
  });
})();
