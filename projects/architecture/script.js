/* ФОРМА — архитектурное бюро · interactions (refined) */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const ruNum = (n) => Math.round(n).toLocaleString("ru-RU");
  const plural = (n, f) => {
    const a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return f[2];
    if (b > 1 && b < 5) return f[1];
    if (b === 1) return f[0];
    return f[2];
  };

  /* ---------- NAV: scroll + mobile ---------- */
  const nav = $("#nav");
  let lastScroll = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 8);
    lastScroll = y;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const burger = $("#burger"), menu = $("#mobileMenu");
  const setMenu = (open) => {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  /* ---------- SECTION LINE — signature draw animation ---------- */
  const sectionPath = $("#sectionPath");
  if (sectionPath && "IntersectionObserver" in window) {
    const pathLen = sectionPath.getTotalLength();
    sectionPath.style.strokeDasharray = pathLen;
    sectionPath.style.strokeDashoffset = pathLen;

    const pio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          requestAnimationFrame(() => {
            sectionPath.classList.add("drawn");
          });
          pio.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    pio.observe(sectionPath.closest(".section-line"));
  }

  /* ---------- REVEAL on scroll ---------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  /* ---------- COUNTERS ---------- */
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target, target = +el.dataset.count, suffix = el.dataset.suffix || "";
        const dur = 1200, t0 = performance.now();
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        const tick = (now) => {
          const p = Math.min(1, (now - t0) / dur);
          const v = Math.round(target * easeOutCubic(p));
          el.textContent = v.toLocaleString("ru-RU") + (p === 1 ? suffix : "");
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach((c) => cio.observe(c));
  }

  /* ---------- CATALOG filters ---------- */
  const filters = $$("#filters .filter"), houses = $$("#catGrid .house"), catEmpty = $("#catEmpty");
  filters.forEach((btn) => btn.addEventListener("click", () => {
    filters.forEach((b) => { b.classList.remove("is-active"); b.setAttribute("aria-selected", "false"); });
    btn.classList.add("is-active"); btn.setAttribute("aria-selected", "true");
    const f = btn.dataset.filter; let shown = 0;
    houses.forEach((h) => {
      const ok = f === "all" || h.dataset.cat === f;
      h.classList.toggle("hide", !ok);
      if (ok) shown++;
    });
    catEmpty.hidden = shown > 0;
  }));

  /* ---------- CALCULATOR ---------- */
  const calc = (() => {
    const area = $("#area"), areaOut = $("#areaOut");
    if (!area) return;
    const RATE = { standard: 450, custom: 1200 };
    const BUILD = { standard: [55000, 72000], premium: [82000, 110000] };
    const state = { type: "custom", floorsK: 1, classK: 1, cls: "standard", eng: true, viz: false, sup: false };

    const segPick = (wrap, attr, cb) => {
      $$(".seg__btn", wrap).forEach((b) => b.addEventListener("click", () => {
        $$(".seg__btn", wrap).forEach((x) => { x.classList.remove("is-active"); x.setAttribute("aria-checked", "false"); });
        b.classList.add("is-active"); b.setAttribute("aria-checked", "true");
        cb(b); render();
      }));
    };
    segPick($("#segType"), "type", (b) => { state.type = b.dataset.type; });
    segPick($("#segFloors"), "floors", (b) => { state.floorsK = +b.dataset.k; });
    segPick($("#segClass"), "class", (b) => { state.classK = +b.dataset.k; state.cls = b.dataset.class; });

    $("#optEng").addEventListener("change", (e) => { state.eng = e.target.checked; render(); });
    $("#optViz").addEventListener("change", (e) => { state.viz = e.target.checked; render(); });
    $("#optSup").addEventListener("change", (e) => { state.sup = e.target.checked; render(); });

    const els = {
      price: $("#rPrice"), rate: $("#rRate"), term: $("#rTerm"),
      docs: $("#rDocs"), build: $("#rBuild"), bar: $("#rBar"), hint: $("#rHint"),
    };

    function render() {
      const a = +area.value;
      area.style.setProperty("--p", ((a - 60) / (400 - 60) * 100) + "%");
      areaOut.textContent = a + " м²";

      // price
      let price = a * RATE[state.type] * state.floorsK * state.classK;
      if (state.eng) price *= 1.2;
      if (state.sup) price *= 1.08;
      if (state.viz) price += 45000;
      price = Math.round(price / 1000) * 1000;
      els.price.textContent = ruNum(price) + " ₽";
      els.rate.textContent = "≈ " + ruNum(price / a) + " ₽/м²";

      // term
      let weeks = state.type === "standard"
        ? 1 + Math.round(a / 200)
        : 6 + Math.round((a - 80) / 45);
      if (state.eng) weeks += 1;
      if (state.floorsK > 1) weeks += 1;
      weeks = Math.max(1, Math.min(16, weeks));
      els.term.textContent = weeks + " " + plural(weeks, ["неделя", "недели", "недель"]);

      // docs
      const docs = state.eng ? 6 : 3;
      els.docs.textContent = docs + " " + plural(docs, ["раздел", "раздела", "разделов"]);

      // build cost range
      const [lo, hi] = BUILD[state.cls];
      const bl = a * lo / 1e6, bh = a * hi / 1e6;
      els.build.textContent = bl.toFixed(1).replace(".", ",") + " — " + bh.toFixed(1).replace(".", ",") + " млн ₽";

      // bar + hint
      els.bar.style.width = ((a - 60) / (400 - 60) * 100) + "%";
      els.hint.textContent =
        a < 100 ? "Компактный дом для пары или дачи выходного дня." :
        a < 160 ? "Оптимальный метраж для семьи 3–4 человека." :
        a < 240 ? "Просторный дом с кабинетом и гостевой зоной." :
                  "Большой дом представительского класса.";
    }

    area.addEventListener("input", render);
    render();
    return render;
  })();

  /* ---------- PLANS ---------- */
  const planData = {
    p1: {
      name: "«Контур 92»", tag: "Одноэтажный компакт для пары или молодой семьи.",
      stats: [["Площадь", "92 м²"], ["Спальни", "2"], ["Санузлы", "1"], ["Габарит", "9 × 9 м"]],
      rooms: ["Кухня-гостиная", "2 спальни", "Санузел", "Прихожая", "Терраса"],
    },
    p2: {
      name: "«Меридиан 148»", tag: "Одноэтажный дом с гаражом и тремя спальнями.",
      stats: [["Площадь", "148 м²"], ["Спальни", "3"], ["Санузлы", "2"], ["Габарит", "11 × 12 м"]],
      rooms: ["Кухня-гостиная", "3 спальни", "Гардероб", "Гараж", "Котельная", "2 санузла"],
    },
    p3: {
      name: "«Грань 184»", tag: "Двухэтажный дом для большой семьи. Переключайте этажи кнопками выше.",
      stats: [["Площадь", "184 м²"], ["Этажи", "2"], ["Спальни", "4"], ["Габарит", "11 × 11 м"]],
      rooms: ["Гостиная-столовая", "Кухня", "Гостевая", "3 спальни", "Гардероб", "2 санузла"],
    },
  };
  const planTabs = $$("#planTabs .ptab"), planSvgs = $$(".planSvg"), legend = $("#planLegend");
  const floorSw = $("#floorSw");
  let p3floor = "p3";

  function showPlan(id) {
    planTabs.forEach((t) => {
      const on = t.dataset.plan === id;
      t.classList.toggle("is-active", on); t.setAttribute("aria-selected", String(on));
    });
    const svgId = id === "p3" ? p3floor : id;
    planSvgs.forEach((s) => s.classList.toggle("is-active", s.id === svgId));
    if (floorSw) floorSw.hidden = id !== "p3";
    const d = planData[id];
    legend.innerHTML =
      '<div class="pl-name">' + d.name + '</div>' +
      '<p class="pl-tagline">' + d.tag + '</p>' +
      d.stats.map((s) => '<div class="pl-stat"><span>' + s[0] + '</span><b>' + s[1] + '</b></div>').join("") +
      '<div class="pl-rooms">' + d.rooms.map((r) => '<span class="pl-room">' + r + '</span>').join("") + '</div>';
  }

  if (floorSw) {
    $$(".floor-btn", floorSw).forEach((btn) => btn.addEventListener("click", () => {
      p3floor = btn.dataset.floor;
      $$(".floor-btn", floorSw).forEach((b) => b.classList.toggle("is-active", b === btn));
      planSvgs.forEach((s) => s.classList.toggle("is-active", s.id === p3floor));
    }));
  }

  planTabs.forEach((t) => t.addEventListener("click", () => showPlan(t.dataset.plan)));
  showPlan("p1");

  /* ---------- ACCORDION ---------- */
  const accItems = $$("#acc .acc__item");
  accItems.forEach((item) => {
    const head = $(".acc__head", item), body = $(".acc__body", item);
    const setOpen = (open) => {
      item.classList.toggle("is-open", open);
      head.setAttribute("aria-expanded", String(open));
      body.style.height = open ? body.firstElementChild.scrollHeight + "px" : "0px";
    };
    if (item.classList.contains("is-open")) requestAnimationFrame(() => setOpen(true));
    head.addEventListener("click", () => {
      const willOpen = !item.classList.contains("is-open");
      accItems.forEach((o) => { if (o !== item) {
        o.classList.remove("is-open");
        $(".acc__head", o).setAttribute("aria-expanded", "false");
        $(".acc__body", o).style.height = "0px";
      }});
      setOpen(willOpen);
    });
  });
  window.addEventListener("resize", () => {
    const open = $("#acc .acc__item.is-open .acc__body");
    if (open) open.style.height = open.firstElementChild.scrollHeight + "px";
  }, { passive: true });

  /* ---------- LEAD FORM ---------- */
  const form = $("#leadForm");
  if (form) {
    const phone = $("#lphone"), name = $("#lname");

    phone.addEventListener("input", () => {
      let d = phone.value.replace(/\D/g, "");
      if (d.startsWith("8")) d = "7" + d.slice(1);
      if (!d.startsWith("7")) d = "7" + d;
      d = d.slice(0, 11);
      let out = "+7";
      if (d.length > 1) out += " (" + d.slice(1, 4);
      if (d.length >= 4) out += ") " + d.slice(4, 7);
      if (d.length >= 7) out += "-" + d.slice(7, 9);
      if (d.length >= 9) out += "-" + d.slice(9, 11);
      phone.value = out;
    });

    const field = (input) => input.closest(".cf");
    const fail = (input, bad) => {
      input.classList.toggle("invalid", bad);
      field(input).classList.toggle("show-err", bad);
      return !bad;
    };

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const okName = fail(name, name.value.trim().length < 2);
      const digits = phone.value.replace(/\D/g, "");
      const okPhone = fail(phone, digits.length !== 11);
      if (!okName || !okPhone) {
        field(okName ? phone : name).querySelector("input").focus();
        return;
      }
      $("#leadOk").hidden = false;
    });

    [name, phone].forEach((i) => i.addEventListener("input", () => {
      if (i.classList.contains("invalid")) {
        i.classList.remove("invalid");
        field(i).classList.remove("show-err");
      }
    }));
  }

  /* ---------- smooth-scroll offset for sticky nav ---------- */
  $$('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (id.length < 2) return;
    const t = document.querySelector(id);
    if (!t) return;
    e.preventDefault();
    const y = t.getBoundingClientRect().top + window.scrollY - (nav.offsetHeight + 16);
    window.scrollTo({ top: y, behavior: "smooth" });
  }));
})();
