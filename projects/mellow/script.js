/* ░░░░░ MELLOW — interactions ░░░░░ */
(function () {
  "use strict";
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── NAV scroll state ── */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ── Mobile menu ── */
  const burger = $("#burger");
  const menu = $("#mobileMenu");
  const toggleMenu = (open) => {
    burger.classList.toggle("is-open", open);
    menu.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-hidden", String(!open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => toggleMenu(!burger.classList.contains("is-open")));
  $$("#mobileMenu a").forEach((a) => a.addEventListener("click", () => toggleMenu(false)));

  /* ── Reveal on scroll ── */
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
    }),
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );
  $$(".reveal").forEach((el) => io.observe(el));

  /* ── Animated counters ── */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || "";
      const dur = 1500, start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : "");
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((c) => cio.observe(c));

  /* ── Menu category tabs ── */
  const menuTabs = $$(".menu-tab");
  const menuPanes = $$(".menu-pane");
  menuTabs.forEach((tab) => tab.addEventListener("click", () => {
    const cat = tab.dataset.cat;
    menuTabs.forEach((t) => t.classList.toggle("is-active", t === tab));
    menuPanes.forEach((p) => { p.hidden = p.dataset.pane !== cat; });
  }));

  /* ── Beans: разово / подписка ── */
  const subBtns = $$("#subToggle .toggle__btn");
  const subPill = $("#subToggle .toggle__pill");
  const subNote = $("#subNote");
  const prices = $$(".bean__price");
  const fmt = (n) => n.toLocaleString("ru-RU");
  const applyMode = (mode) => {
    const sub = mode === "sub";
    subBtns.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
    subPill.classList.toggle("right", sub);
    subNote.hidden = !sub;
    prices.forEach((p) => {
      const base = +p.dataset.base;
      const val = sub ? Math.round(base * 0.85 / 10) * 10 : base;
      const strong = $("strong", p);
      strong.textContent = fmt(val) + " ₽";
    });
  };
  subBtns.forEach((b) => b.addEventListener("click", () => applyMode(b.dataset.mode)));

  /* prefill reserve message when a bean is chosen */
  const msgField = $("#r-msg");
  $$("[data-bean]").forEach((b) => b.addEventListener("click", () => {
    if (msgField && !msgField.value) {
      const mode = $("#subToggle .is-active").dataset.mode === "sub" ? " (подписка)" : "";
      msgField.value = `Хочу зёрна «${b.dataset.bean}»${mode} с собой`;
    }
  }));

  /* ── Vinyl: weekly schedule ── */
  const SCHEDULE = {
    thu: { now: ["Bill Evans — Waltz for Debby", "джаз-вечер · четверг"], list: [
      { t: "19:00", title: "Jazz & Coffee", sub: "винил, мягкий свет, без громкой музыки" },
      { t: "20:30", title: "Сет от резидента", sub: "Blue Note, Coltrane, Evans" },
      { t: "до 23:00", title: "Свободный микрофон у бара", sub: "приносите свои пластинки" },
    ]},
    fri: { now: ["Fleetwood Mac — Rumours", "соул & фанк · пятница"], list: [
      { t: "19:00", title: "Funk & Soul Night", sub: "70-е во всей красе" },
      { t: "21:00", title: "Натуральное вино + сыр", sub: "сет от сомелье" },
      { t: "до 00:00", title: "Танцпол у окна", sub: "по настроению гостей" },
    ]},
    sat: { now: ["Tania Maria — Come With Me", "босанова · суббота"], list: [
      { t: "12:00", title: "Утренний бранч", sub: "лёгкая босанова, фильтр-кофе" },
      { t: "18:00", title: "Vinyl Market", sub: "обмен и продажа пластинок" },
      { t: "20:00", title: "Латина-вечер", sub: "босанова, самба, кашаса" },
    ]},
    sun: { now: ["Erik Satie — Gymnopédies", "тихое воскресенье"], list: [
      { t: "11:00", title: "Тихое утро", sub: "классика, газеты, фильтр" },
      { t: "16:00", title: "Книжный клуб", sub: "обсуждаем за какао" },
      { t: "—", title: "Вечером закрыто", sub: "отдыхаем и слушаем сами", off: true },
    ]},
  };
  const schedDays = $$("#schedDays .day-btn");
  const schedBody = $("#schedBody");
  const nowTitle = $("#nowTitle");
  const nowSub = $("#nowSub");
  const renderDay = (day) => {
    const data = SCHEDULE[day];
    nowTitle.textContent = data.now[0];
    nowSub.textContent = data.now[1];
    schedBody.innerHTML = data.list.map((e) => `
      <div class="event${e.off ? " event--off" : ""}">
        <span class="event__time">${e.t}</span>
        <div>
          <div class="event__title">${e.title}</div>
          <div class="event__sub">${e.sub}</div>
        </div>
      </div>`).join("");
  };
  schedDays.forEach((btn) => btn.addEventListener("click", () => {
    schedDays.forEach((b) => b.classList.toggle("is-active", b === btn));
    renderDay(btn.dataset.day);
  }));
  renderDay("thu");

  /* ── Reviews carousel ── */
  const track = $("#revTrack");
  const reviews = $$(".review", track);
  let idx = 0;
  const perView = () => (window.innerWidth <= 900 ? 1 : 2);
  const maxIdx = () => Math.max(0, reviews.length - perView());
  const go = (n) => {
    idx = Math.min(Math.max(n, 0), maxIdx());
    const step = reviews[0].offsetWidth + 20;
    track.style.transform = `translateX(${-idx * step}px)`;
  };
  $("#revNext").addEventListener("click", () => go(idx + 1));
  $("#revPrev").addEventListener("click", () => go(idx - 1));
  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => go(idx), 150); });
  if (!reduced) {
    let auto = setInterval(() => go(idx >= maxIdx() ? 0 : idx + 1), 5000);
    [track, $("#revPrev"), $("#revNext")].forEach((el) =>
      el.addEventListener("pointerenter", () => clearInterval(auto)));
  }

  /* ── Opening hours + open/closed status ── */
  // [openHour, closeHour] in 24h; null = closed. Mon..Sun
  const HOURS = {
    1: [8, 22], 2: [8, 22], 3: [8, 22], 4: [8, 23],
    5: [8, 24], 6: [9, 24], 0: [9, 18],
  };
  const DAY_NAMES = ["Воскресенье", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
  const ORDER = [1, 2, 3, 4, 5, 6, 0];
  const fmtH = (h) => (h === 24 ? "00:00" : String(h).padStart(2, "0") + ":00");
  const hoursList = $("#hoursList");
  const now = new Date();
  const todayDow = now.getDay();
  hoursList.innerHTML = ORDER.map((d) => {
    const h = HOURS[d];
    const range = h ? `${fmtH(h[0])} – ${fmtH(h[1])}` : "выходной";
    return `<li class="${d === todayDow ? "is-today" : ""}"><span>${DAY_NAMES[d]}</span><span>${range}</span></li>`;
  }).join("");

  const statusEl = $("#visitStatus");
  const statusText = $("#statusText");
  const th = HOURS[todayDow];
  const curHour = now.getHours() + now.getMinutes() / 60;
  if (th && curHour >= th[0] && curHour < th[1]) {
    statusEl.classList.add("is-open");
    statusText.textContent = `Открыто · до ${fmtH(th[1])}`;
  } else {
    statusEl.classList.add("is-closed");
    // find next opening
    let nextOpen = null;
    for (let i = 0; i < 7; i++) {
      const d = (todayDow + i) % 7;
      const h = HOURS[d];
      if (!h) continue;
      if (i === 0 && curHour < h[0]) { nextOpen = `сегодня в ${fmtH(h[0])}`; break; }
      if (i > 0) { nextOpen = `${DAY_NAMES[d].toLowerCase()} в ${fmtH(h[0])}`; break; }
    }
    statusText.textContent = nextOpen ? `Закрыто · откроемся ${nextOpen}` : "Закрыто";
  }

  /* ── Phone mask +7 (___) ___-__-__ ── */
  const phoneInput = $("#r-phone");
  phoneInput.addEventListener("input", () => {
    let digits = phoneInput.value.replace(/\D/g, "");
    if (digits.startsWith("8")) digits = "7" + digits.slice(1);
    if (!digits.startsWith("7")) digits = "7" + digits;
    digits = digits.slice(0, 11);
    let out = "+7";
    if (digits.length > 1) out += " (" + digits.slice(1, 4);
    if (digits.length >= 4) out += ") " + digits.slice(4, 7);
    if (digits.length >= 7) out += "-" + digits.slice(7, 9);
    if (digits.length >= 9) out += "-" + digits.slice(9, 11);
    phoneInput.value = out;
  });
  phoneInput.addEventListener("focus", () => {
    if (!phoneInput.value) phoneInput.value = "+7";
  });

  /* ── Reserve form validation ── */
  const form = $("#reserveForm");
  const success = $("#reserveSuccess");
  const setErr = (name, msg) => {
    const field = form.querySelector(`[name="${name}"]`).closest(".field");
    field.classList.toggle("has-error", !!msg);
    const slot = field.querySelector(`[data-err="${name}"]`);
    if (slot) slot.textContent = msg || "";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    let ok = true;

    const phoneDigits = (data.phone || "").replace(/\D/g, "");
    if (phoneDigits.length < 11) { setErr("phone", "Введите номер полностью"); ok = false; }
    else setErr("phone", "");

    const email = (data.email || "").trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setErr("email", "Введите корректную почту"); ok = false; }
    else setErr("email", "");

    if (!data.time) { setErr("time", "Выберите время"); ok = false; }
    else setErr("time", "");

    if (!data.table) { setErr("table", "Выберите столик"); ok = false; }
    else setErr("table", "");

    if (!ok) {
      const firstErr = form.querySelector(".has-error");
      if (firstErr) firstErr.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
      return;
    }

    /* ── Build booking summary and actually send it ── */
    const summary = [
      "Новая бронь столика в MELLOW",
      "─────────────────────────────",
      "Телефон: " + data.phone,
      "Почта:   " + email,
      "Когда:   " + data.time,
      "Столик:  " + data.table,
      "─────────────────────────────",
      "Заявка отправлена с сайта mellow.coffee",
    ].join("\n");

    const subject = "Бронь столика · " + data.time;
    const mailto = "mailto:hello@mellow.coffee" +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(summary);

    /* Copy summary to clipboard as a backup (fail silently) */
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(summary).catch(() => {});
    }

    /* Save to localStorage so the shop can retrieve a log */
    try {
      const log = JSON.parse(localStorage.getItem("mellow_bookings") || "[]");
      log.push({ at: new Date().toISOString(), ...data, email });
      localStorage.setItem("mellow_bookings", JSON.stringify(log.slice(-50)));
    } catch (_) {}

    /* Open the user's email client with everything pre-filled.
       Use a brief delay so the success state can render first. */
    setTimeout(() => {
      const a = document.createElement("a");
      a.href = mailto;
      a.rel = "noopener";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }, 350);

    success.hidden = false;
  });

  ["phone", "email", "time", "table"].forEach((n) => {
    const el = form.querySelector(`[name="${n}"]`);
    el && el.addEventListener("input", () => setErr(n, ""));
    el && el.addEventListener("change", () => setErr(n, ""));
  });
})();

/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   POLISH v2 — non-intrusive enhancements
   word-split hero · reveal stagger · review dots
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */
(function(){
  "use strict";
  const $  = (s,c)=>(c||document).querySelector(s);
  const $$ = (s,c)=>Array.from((c||document).querySelectorAll(s));
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Split hero title into word-spans (preserve nbsp + inner spans) ── */
  const heroTitle = $(".hero__title");
  if (heroTitle && !reduced){
    const walker = document.createTreeWalker(heroTitle, NodeFilter.SHOW_TEXT);
    const nodes = [];
    let n; while ((n = walker.nextNode())) if (n.nodeValue && n.nodeValue.trim()) nodes.push(n);
    let i = 0;
    nodes.forEach((tn)=>{
      const parts = tn.nodeValue.split(/([ \t\n\r]+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((p)=>{
        if (!p) return;
        if (/^[ \t\n\r]+$/.test(p)) frag.appendChild(document.createTextNode(p));
        else {
          const s = document.createElement("span");
          s.className = "word";
          s.textContent = p;
          s.style.animationDelay = (0.08 + i*0.07) + "s";
          i++;
          frag.appendChild(s);
        }
      });
      tn.parentNode.replaceChild(frag, tn);
    });
  }

  /* ── Stagger reveal delays on grids ── */
  $$(".beans-grid, .reviews__track, .menu-pane, .footer__cols, .reserve__perks, .hours")
    .forEach((grid)=>{
      Array.from(grid.children).forEach((child, idx)=>{
        child.style.setProperty("--rev-delay", (idx * 0.06) + "s");
      });
    });

  /* ── Review dots: read-only position indicators ── */
  const revTrack = $("#revTrack");
  const reviews = revTrack ? $$(".review", revTrack) : [];
  const viewport = revTrack ? revTrack.parentElement : null;
  if (revTrack && reviews.length && viewport){
    const dotsWrap = document.createElement("div");
    dotsWrap.className = "reviews__dots";
    dotsWrap.setAttribute("role","tablist");
    dotsWrap.setAttribute("aria-label","Положение в отзывах");
    viewport.parentElement.insertBefore(dotsWrap, viewport.nextSibling);

    const perView = ()=> window.innerWidth <= 900 ? 1 : 2;
    let dots = [];

    const buildDots = ()=>{
      const max = Math.max(0, reviews.length - perView());
      dotsWrap.innerHTML = "";
      dots = [];
      for (let k=0;k<=max;k++){
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Отзыв " + (k+1));
        dotsWrap.appendChild(b);
        dots.push(b);
      }
      syncDots();
    };

    const syncDots = ()=>{
      if (!dots.length || !reviews[0]) return;
      const mat = new DOMMatrixReadOnly(getComputedStyle(revTrack).transform);
      const x = -mat.m41;
      const step = reviews[0].offsetWidth + 20;
      const cur = Math.max(0, Math.round(x / step));
      dots.forEach((d,k)=> d.classList.toggle("is-on", k === cur));
    };

    buildDots();

    // observe transform changes
    const mo = new MutationObserver(syncDots);
    mo.observe(revTrack, { attributes:true, attributeFilter:["style"] });

    // rebuild on resize
    let rt;
    window.addEventListener("resize", ()=>{
      clearTimeout(rt);
      rt = setTimeout(()=>{ buildDots(); syncDots(); }, 180);
    });

    // dot click → step prev/next as many times as the diff
    dotsWrap.addEventListener("click", (e)=>{
      const target = e.target.closest("button");
      if (!target) return;
      const idx = dots.indexOf(target);
      const cur = dots.findIndex(d => d.classList.contains("is-on"));
      if (idx < 0 || idx === cur) return;
      const diff = idx - cur;
      const btn = diff > 0 ? $("#revNext") : $("#revPrev");
      for (let k=0;k<Math.abs(diff);k++) btn.click();
    });
  }

  /* ── Anchor scroll-margin so sections don't hide under fixed nav ── */
  $$("section[id], main [id]").forEach((s)=>{ s.style.scrollMarginTop = "90px"; });
})();
