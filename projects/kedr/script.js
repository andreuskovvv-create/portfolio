/* ===========================================================
   КЕДР — interactions
   =========================================================== */
(function () {
  "use strict";

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const ruNum = (n) => Math.round(n).toLocaleString("ru-RU");

  /* ---------- nav: scrolled state + progress + FAB ---------- */
  const nav = $("#nav");
  const progress = $("#scrollProgress");
  const fab = $("#fab");

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("scrolled", y > 30);
    fab.classList.toggle("show", y > 700);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  function toggleMenu(open) {
    const isOpen = open ?? !menu.classList.contains("open");
    menu.classList.toggle("open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
    menu.setAttribute("aria-hidden", String(!isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  }
  burger.addEventListener("click", () => toggleMenu());
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- stat counters ---------- */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    const dur = 1400;
    let start = null;
    function step(t) {
      if (!start) start = t;
      const p = Math.min((t - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ru-RU") + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  const counterIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          animateCount(e.target);
          counterIO.unobserve(e.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  $$("[data-count]").forEach((el) => counterIO.observe(el));

  /* ---------- catalog filters ---------- */
  const filters = $$(".filter");
  const projects = $$(".proj");
  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      const f = btn.dataset.filter;
      projects.forEach((p) => {
        const show = f === "all" || p.dataset.cat === f;
        p.classList.toggle("hide", !show);
      });
    });
  });

  /* ===========================================================
     CALCULATOR
     =========================================================== */
  const calc = {
    type: $("#calcType"),
    material: $("#calcMaterial"),
    area: $("#calcArea"),
    areaOut: $("#calcAreaOut"),
    pkg: $("#calcPackage"),
    opts: $("#calcOpts"),
    total: $("#calcTotal"),
    perM: $("#calcPerM"),
    term: $("#calcTerm"),
    monthly: $("#calcMonthly"),
    breakdown: $("#calcBreakdown"),
  };

  // generic segmented / chip group: single active toggle
  function bindGroup(container, selector, onChange) {
    $$(selector, container).forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(selector, container).forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
        onChange();
      });
    });
  }

  function rangeFill() {
    const min = +calc.area.min, max = +calc.area.max, val = +calc.area.value;
    const p = ((val - min) / (max - min)) * 100;
    calc.area.style.setProperty("--p", p + "%");
  }

  function termText(area, pkgMult, type) {
    let m = area / 55 + 2 + (pkgMult - 1) * 2;
    if (type === "bath") m *= 0.7;
    const lo = Math.max(2, Math.round(m));
    const hi = lo + 1 + (area > 200 ? 1 : 0);
    return lo + "–" + hi + " мес";
  }

  function recalc() {
    const type = $(".seg__btn.is-active", calc.type).dataset.val;
    const matBtn = $(".cs.is-active", calc.material);
    const rate = +matBtn.dataset.rate;
    const matName = matBtn.textContent.trim();
    const area = +calc.area.value;
    const pkgBtn = $(".seg__btn.is-active", calc.pkg);
    const pkgMult = +pkgBtn.dataset.val;
    const pkgName = pkgBtn.dataset.name;

    const boxCost = area * rate * pkgMult;
    let total = boxCost;

    // build breakdown
    const rows = [
      { label: matName + ", «" + pkgName + "»", val: boxCost },
    ];

    $$('input[type="checkbox"]', calc.opts).forEach((cb) => {
      if (!cb.checked) return;
      const label = cb.parentElement.querySelector("span").textContent;
      let cost = 0;
      if (cb.dataset.add) cost = +cb.dataset.add;
      else if (cb.dataset.rateAdd) cost = +cb.dataset.rateAdd * area;
      total += cost;
      rows.push({ label, val: cost });
    });

    // output
    calc.areaOut.textContent = area + " м²";
    calc.total.textContent = ruNum(total);
    calc.perM.textContent = ruNum(total / area);
    calc.term.textContent = termText(area, pkgMult, type);
    calc.monthly.textContent = ruNum(Math.round(total / 24 / 1000) * 1000) + " ₽/мес";

    calc.breakdown.innerHTML = rows
      .map((r) => `<li><span>${r.label}</span><b>${ruNum(r.val)} ₽</b></li>`)
      .join("");

    rangeFill();
  }

  if (calc.area) {
    bindGroup(calc.type, ".seg__btn", () => {
      // switching to baths nudges a smaller default area for realism
      const type = $(".seg__btn.is-active", calc.type).dataset.val;
      if (type === "bath" && +calc.area.value > 120) calc.area.value = 48;
      if (type === "house" && +calc.area.value < 60) calc.area.value = 120;
      recalc();
    });
    bindGroup(calc.material, ".cs", recalc);
    bindGroup(calc.pkg, ".seg__btn", recalc);
    calc.area.addEventListener("input", recalc);
    calc.opts.addEventListener("change", recalc);
    recalc();
  }

  // calc -> prefill lead form
  const calcToLead = $("#calcToLead");
  if (calcToLead) {
    calcToLead.addEventListener("click", () => {
      const type = $(".seg__btn.is-active", calc.type).dataset.val;
      const fType = $("#fType");
      const fArea = $("#fArea");
      if (fArea) fArea.value = calc.area.value;
      if (fType) fType.value = type === "bath" ? "Баня" : "Дом";
    });
  }

  /* ===========================================================
     VIDEO MODAL
     =========================================================== */
  const vmodal = $("#vmodal");
  const vImg = $("#vmodalImg");
  const vTitle = $("#vmodalTitle");
  let lastFocus = null;

  function openVideo(btn) {
    lastFocus = btn;
    vImg.src = btn.dataset.poster;
    vImg.alt = btn.dataset.title || "Видео объекта";
    vTitle.textContent = btn.dataset.title || "Видео объекта";
    vmodal.classList.add("open");
    vmodal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeVideo() {
    vmodal.classList.remove("open");
    vmodal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }
  $$("[data-video]").forEach((b) => b.addEventListener("click", () => openVideo(b)));
  $$("[data-close]", vmodal).forEach((el) => el.addEventListener("click", closeVideo));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && vmodal.classList.contains("open")) closeVideo();
  });

  /* ===========================================================
     FORM: phone mask + validation
     =========================================================== */
  const form = $("#leadForm");
  const phone = $("#fPhone");

  if (phone) {
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
  }

  function setErr(id, msg) {
    const field = $("#" + id).closest(".field");
    const err = $('[data-err="' + id + '"]');
    field.classList.toggle("invalid", !!msg);
    if (err) err.textContent = msg || "";
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let ok = true;

      const name = $("#fName");
      if (name.value.trim().length < 2) {
        setErr("fName", "Укажите имя");
        ok = false;
      } else setErr("fName", "");

      const digits = phone.value.replace(/\D/g, "");
      if (digits.length < 11) {
        setErr("fPhone", "Введите телефон полностью");
        ok = false;
      } else setErr("fPhone", "");

      const agree = $("#fAgree");
      if (!agree.checked) {
        agree.closest(".agree").style.color = "#c0392b";
        ok = false;
      } else {
        agree.closest(".agree").style.color = "";
      }

      if (!ok) return;

      const success = $("#formSuccess");
      success.hidden = false;
      requestAnimationFrame(() => (success.style.opacity = "1"));
      form.reset();
      if (phone) phone.value = "";
    });
  }

  /* ---------- active nav link ---------- */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__links a");
  const navIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = e.target.id;
          navLinks.forEach((a) =>
            a.classList.toggle("active", a.getAttribute("href") === "#" + id)
          );
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navIO.observe(s));
})();
