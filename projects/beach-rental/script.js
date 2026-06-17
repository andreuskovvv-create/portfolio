/* ============================================================
   WAVE — прокат снаряжения · интерактив
   ============================================================ */
const DATA = {
  surf: {
    title: 'Сёрф-доска Pro 6\'2"',
    tag: 'surf',
    desc: 'Лёгкий шортборд для уверенных линий. Идёт с лишем и воском в подарок.',
    feats: ['188 см', '3.4 кг', 'FCS II'],
    priceOld: '1 200 ₽',
    priceNow: '900 ₽<em>/час</em>',
    label: 'Сёрф'
  },
  jet: {
    title: 'Гидроцикл Yamaha VX',
    tag: 'jet ski',
    desc: 'Трёхместный, 110 л.с. — стабильный на волне, быстрый старт.',
    feats: ['110 л.с.', '3 места', 'с инструктором'],
    priceOld: '7 500 ₽',
    priceNow: '5 900 ₽<em>/30 мин</em>',
    label: 'Гидроцикл'
  },
  sup: {
    title: 'SUP-доска Glide 11\'0"',
    tag: 'sup',
    desc: 'Устойчивая надувная доска для прогулок по бухте на закате.',
    feats: ['335 см', 'до 130 кг', 'насос + весло'],
    priceOld: '900 ₽',
    priceNow: '600 ₽<em>/час</em>',
    label: 'SUP'
  },
  kite: {
    title: 'Кайт-комплект Core XR7',
    tag: 'kite',
    desc: 'Универсальный кайт 9 м² с трапецией и доской. Только при ветре 12+ узлов.',
    feats: ['9 м²', 'трапеция', 'твин-тип'],
    priceOld: '4 200 ₽',
    priceNow: '3 200 ₽<em>/час</em>',
    label: 'Кайт'
  }
};

const ORDER = ['surf', 'jet', 'sup', 'kite'];
let current = 'surf';
document.body.dataset.mode = current;

const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

const els = {
  title: $('#pcTitle'),
  tag: $('#pcTag'),
  desc: $('#pcDesc'),
  feats: [$('#feat1'), $('#feat2'), $('#feat3')],
  priceOld: $('#priceOld'),
  priceNow: $('#priceNow'),
  card: $('#productCard'),
  bars: $$('.mini-bars i'),
  modalIllo: $('#modalIllo')
};

function setMode(key) {
  if (key === current) return;
  current = key;
  document.body.dataset.mode = key;

  // switcher rail
  $$('.sw').forEach((b) => {
    const on = b.dataset.key === key;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', String(on));
  });

  // gear scene crossfade
  $$('.pc-visual .gear-layer').forEach((l) => l.classList.toggle('active', l.dataset.key === key));

  // sync modal illustration to the same scene
  if (els.modalIllo) {
    const src = document.querySelector(`.pc-visual .gear-layer[data-key="${key}"] svg`);
    if (src) els.modalIllo.innerHTML = src.outerHTML;
  }

  // sync modal chips
  const chip = document.querySelector(`.chip input[value="${key}"]`);
  if (chip) chip.checked = true;

  // rotating headline word
  $$('.title-accent .rot').forEach((r) => r.classList.toggle('active', r.dataset.key === key));

  // card data with a small lift
  const d = DATA[key];
  if (!reduce) {
    els.card.animate(
      [{ transform: 'translateY(0)', opacity: 1 }, { transform: 'translateY(-6px)', opacity: .65 }, { transform: 'translateY(0)', opacity: 1 }],
      { duration: 500, easing: 'cubic-bezier(.7,0,.2,1)' }
    );
  }
  setTimeout(() => {
    els.title.textContent = d.title;
    els.tag.textContent = d.tag;
    els.desc.textContent = d.desc;
    d.feats.forEach((f, i) => { if (els.feats[i]) els.feats[i].textContent = f; });
    els.priceOld.textContent = d.priceOld;
    els.priceNow.innerHTML = d.priceNow;
  }, reduce ? 0 : 180);

  // randomize the weather bars
  els.bars.forEach((b) => {
    const h = 30 + Math.round(Math.random() * 60);
    b.style.setProperty('--h', h + '%');
  });
}

// switcher: click
const swButtons = $$('.sw');
swButtons.forEach((b) => b.addEventListener('click', () => { setMode(b.dataset.key); pauseAuto(); }));

// switcher: keyboard arrow navigation (vertical tablist)
const switcher = document.querySelector('.switcher');
if (switcher) {
  switcher.addEventListener('keydown', (e) => {
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
    if (!keys.includes(e.key)) return;
    e.preventDefault();
    let idx = ORDER.indexOf(current);
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') idx = (idx - 1 + ORDER.length) % ORDER.length;
    else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') idx = (idx + 1) % ORDER.length;
    else if (e.key === 'Home') idx = 0;
    else if (e.key === 'End') idx = ORDER.length - 1;
    setMode(ORDER[idx]);
    pauseAuto();
    const btn = document.querySelector(`.sw[data-key="${ORDER[idx]}"]`);
    if (btn) btn.focus();
  });
}

// auto-rotate, pauses on interaction or hover
let autoTimer = setInterval(autoNext, 4600);
function autoNext() {
  const next = ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
  setMode(next);
}
function pauseAuto() { clearInterval(autoTimer); autoTimer = null; }
const heroRight = document.querySelector('.hero-right');
if (heroRight) heroRight.addEventListener('mouseenter', pauseAuto);

// favorite toggle
const fav = document.querySelector('.pc-fav');
if (fav) fav.addEventListener('click', () => {
  const on = fav.getAttribute('aria-pressed') === 'true';
  fav.setAttribute('aria-pressed', String(!on));
});

// sticky nav shadow
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// subtle parallax on aurora
if (!reduce) {
  const aurora = document.querySelector('.aurora');
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - .5) * 20;
    const y = (e.clientY / window.innerHeight - .5) * 20;
    aurora.style.transform = `translate(${x}px, ${y}px)`;
  });
}

// when user picks a different gear via the chip-row inside the modal,
// sync the side illustration AND the main product card to that gear
$$('.chip input[name="kind"]').forEach((inp) => {
  inp.addEventListener('change', () => {
    if (inp.checked) {
      setMode(inp.value);
      pauseAuto();
    }
  });
});

/* ============================================================
   BOOKING MODAL — real validation + mailto + localStorage
   ============================================================ */
const modal = $('#bookModal');
const form = $('#bookForm');
const done = $('#modalDone');

function openModal() {
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('no-scroll');
  // preselect current gear
  const chip = document.querySelector(`.chip input[value="${current}"]`);
  if (chip) chip.checked = true;
  // sync modal illustration
  if (els.modalIllo) {
    const src = document.querySelector(`.pc-visual .gear-layer[data-key="${current}"] svg`);
    if (src) els.modalIllo.innerHTML = src.outerHTML;
  }
  // default date = tomorrow
  const d = new Date(); d.setDate(d.getDate() + 1);
  const iso = d.toISOString().slice(0, 10);
  const dateInput = form.querySelector('input[name="when"]');
  if (dateInput) { dateInput.min = new Date().toISOString().slice(0, 10); if (!dateInput.value) dateInput.value = iso; }
  setTimeout(() => form.querySelector('input[name="name"]').focus(), 200);
}

function closeModal() {
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('no-scroll');
  setTimeout(() => {
    done.hidden = true;
    form.style.display = '';
    document.querySelector('.modal-side').style.display = '';
    form.reset();
    clearErrors();
  }, 300);
}

$$('[data-open-book]').forEach((b) => b.addEventListener('click', openModal));
$$('[data-close-book]').forEach((b) => b.addEventListener('click', closeModal));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

// validation helpers
function setErr(name, msg) {
  const field = form.querySelector(`[name="${name}"]`).closest('.field');
  const err = form.querySelector(`.field-err[data-err="${name}"]`);
  field.classList.toggle('invalid', !!msg);
  if (err) err.textContent = msg || '';
  return !msg;
}
function clearErrors() {
  $$('.field').forEach((f) => f.classList.remove('invalid'));
  $$('.field-err').forEach((e) => e.textContent = '');
}
// clear error as the user types
form.addEventListener('input', (e) => {
  const f = e.target.closest('.field');
  if (f) { f.classList.remove('invalid'); const err = f.querySelector('.field-err'); if (err) err.textContent = ''; }
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  let ok = true;

  if (!data.name || data.name.trim().length < 2) ok = setErr('name', 'Введи имя') && ok; else setErr('name', '');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email || '')) ok = setErr('email', 'Проверь email') && ok; else setErr('email', '');
  if (!data.phone || data.phone.replace(/\D/g, '').length < 7) ok = setErr('phone', 'Введи телефон или Telegram') && ok; else setErr('phone', '');
  if (!data.when) ok = setErr('when', 'Выбери дату') && ok; else setErr('when', '');

  if (!ok) return;

  // build the order summary
  const gear = DATA[data.kind] || DATA.surf;
  const summary = [
    'Новая бронь · WAVE Bali',
    '────────────────────────',
    'Снаряжение: ' + gear.label + ' (' + gear.title + ')',
    'Дата:       ' + data.when,
    '────────────────────────',
    'Имя:        ' + data.name,
    'Email:      ' + data.email,
    'Телефон/TG: ' + data.phone,
    '────────────────────────',
    'Заявка с сайта wave-bali'
  ].join('\n');

  const subject = 'Бронь · ' + gear.label + ' · ' + data.when;
  const mailto = 'mailto:hello@wave-bali.com'
    + '?subject=' + encodeURIComponent(subject)
    + '&body=' + encodeURIComponent(summary);

  // clipboard backup
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(summary).catch(() => {});
  }
  // localStorage log (last 30)
  try {
    const log = JSON.parse(localStorage.getItem('wave_bookings') || '[]');
    log.push({ at: new Date().toISOString(), kind: data.kind, ...data });
    localStorage.setItem('wave_bookings', JSON.stringify(log.slice(-30)));
  } catch (_) {}

  const btn = form.querySelector('.modal-submit');
  btn.disabled = true;
  btn.innerHTML = 'Отправляем…';

  setTimeout(() => {
    // open mail client
    const a = document.createElement('a');
    a.href = mailto; a.rel = 'noopener'; a.style.display = 'none';
    document.body.appendChild(a); a.click(); a.remove();

    form.style.display = 'none';
    document.querySelector('.modal-side').style.display = 'none';
    done.hidden = false;
    const dm = $('#doneMsg');
    if (dm) dm.textContent = `Открыли почту с готовым письмом на hello@wave-bali.com — отправь его, и мы свяжемся в Telegram за 10 минут. Бронь на ${gear.label.toLowerCase()} (${data.when}) уже сохранена.`;
    btn.disabled = false;
    btn.innerHTML = 'Забронировать';
  }, 800);
});

/* ============================================================
   SECTION DATA · steps + prices per gear
   ============================================================ */
const STEPS = {
  surf: [
    { ico:'tap',    t:'Бронь',          d:'Жми кнопку — выбери дату, оставь Telegram. Подтвердим за 10 минут.',                time:'60 секунд' },
    { ico:'pin',    t:'На пирсе',       d:'Подъезжай к pier №3, спросишь Wave. Шкафчик и душ — на месте.',                    time:'10 минут' },
    { ico:'board',  t:'Подбор доски',   d:'Подгоним доску под рост и опыт. Лиш, воск и шапка от солнца — бесплатно.',          time:'5 минут' },
    { ico:'wave',   t:'Лови волну',     d:'Padang Padang в 5 минутах. Уплыл — твоё время пошло. Возврат до 21:00.',           time:'час за раз' }
  ],
  jet: [
    { ico:'tap',    t:'Бронь',          d:'Оставь время и количество водителей — мы заранее заправим бак.',                   time:'60 секунд' },
    { ico:'id',     t:'ID и брифинг',   d:'Покажи права (или загранник). 5 минут инструктаж — куда ехать, куда не лезть.',     time:'5 минут' },
    { ico:'pin',    t:'На пирсе',       d:'Жилет, ключ, GoPro в подарок. Контроль трезвости — обязательно.',                  time:'10 минут' },
    { ico:'speed',  t:'Поехали',        d:'30 минут или час — твой выбор. Канал 50 метров от берега размечен буями.',         time:'до 60 км/ч' }
  ],
  sup: [
    { ico:'tap',    t:'Бронь',          d:'Утро или закат — выбор за тобой. На закате тише, рассвет — гладкая вода.',          time:'60 секунд' },
    { ico:'pin',    t:'На пирсе',       d:'Подобрали доску — взял насос, весло, гермомешок. Сэлфи-палка опционально.',          time:'10 минут' },
    { ico:'board',  t:'Подгонка',       d:'Высота весла под рост, объясним как правильно вставать. С первого раза — не получится, и это норм.', time:'5 минут' },
    { ico:'sun',    t:'Закатный круг',  d:'Бухта Suluban спокойная — идеально для прогулки. Возвращайся до темноты.',          time:'час и больше' }
  ],
  kite: [
    { ico:'tap',    t:'Бронь',          d:'Сначала проверь прогноз — стабильный ветер 12+ узлов. Без него катать не пустим.', time:'60 секунд' },
    { ico:'wind',   t:'Проверка ветра', d:'Замер на пирсе. Если падает — переносим бесплатно. Без штрафов.',                  time:'на месте' },
    { ico:'id',     t:'Инструктор',     d:'Для всех уровней — для безопасности. Цена включена в курс. Минимум 1 час.',         time:'1 час минимум' },
    { ico:'wave',   t:'В небо',         d:'Зона запуска — северный пляж, дальше от сёрферов. Камера в шлеме включена.',       time:'до 3 часов' }
  ]
};

const PRICES = {
  surf: [
    { name:'час',     amount:900,   old:1200,  unit:'/час',     feats:['доска под рост','лиш + воск','шапка от солнца'],                pop:false },
    { name:'3 часа',  amount:2300,            unit:'/блок',    feats:['скидка 15%','смена доски бесплатно','wax-bar на пирсе'],         pop:true  },
    { name:'день',    amount:3900,            unit:'/06—21',   feats:['утро+обед+закат','шкаф и душ','возврат до 12:00 завтра'],         pop:false },
    { name:'неделя',  amount:19900,           unit:'/7 дней',  feats:['7 досок без лимита','персональный шкаф','фото-сет в подарок'],    pop:false }
  ],
  jet: [
    { name:'30 мин',  amount:5900,  old:7500,  unit:'/30 мин',  feats:['110 л.с.','инструктор + жилет','GoPro в подарок'],               pop:false },
    { name:'час',     amount:9900,            unit:'/час',     feats:['бак включён','до 2 водителей','маршрут размечен буями'],         pop:true  },
    { name:'5 часов', amount:32000,           unit:'/полдня',  feats:['топливо включено','обед на катере','фото-сет на закате'],         pop:false },
    { name:'неделя',  amount:99000,           unit:'/7 дней',  feats:['7 заездов в любое время','шеф-инструктор','индивидуальный шкаф'], pop:false }
  ],
  sup: [
    { name:'час',     amount:600,   old:900,   unit:'/час',     feats:['насос + весло','гермомешок','подгонка по росту'],                pop:false },
    { name:'3 часа',  amount:1500,            unit:'/блок',    feats:['скидка 17%','смена доски','wax-bar на пирсе'],                  pop:false },
    { name:'день',    amount:1900,            unit:'/06—21',   feats:['с утра до заката','шкафчик и душ','доступ к беседке'],            pop:true  },
    { name:'неделя',  amount:9900,            unit:'/7 дней',  feats:['без лимита часов','семейный тариф ×2','SUP-йога по средам'],     pop:false }
  ],
  kite: [
    { name:'час',     amount:3200,  old:4200,  unit:'/час',     feats:['9 м² + трапеция','твин-тип доска','страховка'],                 pop:false },
    { name:'2 часа',  amount:5500,            unit:'/блок',    feats:['с инструктором','подбор размера кайта','спас-катер рядом'],     pop:false },
    { name:'день',    amount:7800,            unit:'/06—21',   feats:['безлимит на день','смена комплекта','шкаф и душ'],                pop:true  },
    { name:'курс',    amount:18000,           unit:'/3 дня',   feats:['обучение с нуля','инструктор персональный','сертификат IKO 1'],   pop:false }
  ]
};

const ICONS = {
  tap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11V6a3 3 0 116 0v8"/><path d="M9 14l-3 3v2a2 2 0 002 2h6a2 2 0 002-2v-2l-3-3"/><circle cx="12" cy="10" r="1"/></svg>',
  pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s-7-7-7-13a7 7 0 1114 0c0 6-7 13-7 13z"/><circle cx="12" cy="9" r="2.5"/></svg>',
  board:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="6"/><path d="M12 5v14"/></svg>',
  wave:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12c2 0 2-3 5-3s3 3 5 3 2-3 5-3 3 3 5 3"/><path d="M2 17c2 0 2-3 5-3s3 3 5 3 2-3 5-3 3 3 5 3"/></svg>',
  id:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="12" r="2.5"/><path d="M14 10h4M14 14h3"/></svg>',
  speed:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 15a7 7 0 1114 0"/><path d="M12 15l4-4"/><circle cx="12" cy="15" r="1.4" fill="currentColor"/></svg>',
  sun:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/></svg>',
  wind:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h11a3 3 0 100-6"/><path d="M3 14h15a3 3 0 110 6"/><path d="M3 11h6"/></svg>'
};

/* ============================================================
   RENDER · steps grid + price grid (per gear)
   ============================================================ */
function renderSteps(key) {
  const grid = document.getElementById('stepsGrid');
  if (!grid) return;
  const steps = STEPS[key] || STEPS.surf;
  grid.innerHTML = steps.map((s, i) => `
    <article class="step" data-step="${i+1}">
      <span class="step__no">${String(i+1).padStart(2,'0')}</span>
      <div class="step__ico">${ICONS[s.ico] || ICONS.tap}</div>
      <h3 class="step__t">${s.t}</h3>
      <p class="step__d">${s.d}</p>
      <span class="step__time">${s.time}</span>
    </article>
  `).join('');
}

function renderPrices(key) {
  const grid = document.getElementById('priceGrid');
  if (!grid) return;
  const tiers = PRICES[key] || PRICES.surf;
  const fmt = (n) => n.toLocaleString('ru-RU').replace(/,/g, ' ');
  grid.innerHTML = tiers.map((t) => `
    <article class="price-tier${t.pop ? ' price-tier--pop' : ''}">
      ${t.pop ? '<span class="price-tier__badge">популярно</span>' : ''}
      <span class="price-tier__name">${t.name}</span>
      <div class="price-tier__amount">
        <b>${fmt(t.amount)} ₽</b>
        <em>${t.unit}</em>
      </div>
      ${t.old ? `<span class="price-tier__old">${fmt(t.old)} ₽</span>` : '<span class="price-tier__old" style="visibility:hidden">.</span>'}
      <ul class="price-tier__feats">
        ${t.feats.map((f) => `<li>${f}</li>`).join('')}
      </ul>
      <button class="price-tier__cta" data-open-book data-pick-gear="${key}">Забронировать</button>
    </article>
  `).join('');
}

function updateSectionUI(key) {
  // rotating words inside section-h em (.rh)
  $$('.section-h em .rh').forEach((r) => r.classList.toggle('active', r.dataset.key === key));
  // quick-book CTA gear name
  const qb = document.getElementById('qbGearName');
  if (qb) qb.textContent = DATA[key] ? DATA[key].label : '';
  renderSteps(key);
  renderPrices(key);
}

/* ============================================================
   HOOK INTO setMode · monkey-patch to extend without losing logic
   ============================================================ */
const _origSetMode = setMode;
setMode = function (key) {
  const was = current;
  _origSetMode(key);
  if (was !== key) updateSectionUI(key);
};

/* ============================================================
   Footer "snaryazhenie" deep-links + price tier CTA preselect
   ============================================================ */
document.addEventListener('click', (e) => {
  const jump = e.target.closest('[data-jump-gear]');
  if (jump) {
    e.preventDefault();
    const k = jump.dataset.jumpGear;
    if (DATA[k]) {
      setMode(k);
      // in deck mode, jump to hero slide (instead of scrollIntoView)
      if (typeof goToSlide === 'function') goToSlide(0);
    }
    return;
  }
  const pick = e.target.closest('[data-pick-gear]');
  if (pick) {
    const k = pick.dataset.pickGear;
    if (DATA[k]) setMode(k);
  }
});

/* ============================================================
   ░░░ CAROUSEL DECK NAVIGATION ░░░
   4 slides switch horizontally; tab/arrow/dot/swipe/key drive it.
   ============================================================ */
const SLIDES = ['hero', 'how', 'prices', 'contact'];
const HASH_OF = { hero: '', how: 'how', prices: 'prices', contact: 'contact' };
let slideIdx = 0;

const deck = document.getElementById('deck');
const track = document.getElementById('deckTrack');
const slideEls = $$('.slide');
const dots = $$('.deck-dots .dd');
const prevBtn = document.getElementById('deckPrev');
const nextBtn = document.getElementById('deckNext');

function setActiveTab(name) {
  $$('.nav-links a').forEach((a) => {
    const href = a.getAttribute('href');
    const tab = !href || href === '#' || href === '#top' ? 'hero' : href.slice(1);
    a.classList.toggle('active', tab === name);
  });
}

function goToSlide(i, { fromHash = false } = {}) {
  i = Math.max(0, Math.min(SLIDES.length - 1, i));
  if (i === slideIdx && slideEls[i]?.classList.contains('is-active')) return;
  slideIdx = i;

  // shift the track horizontally
  track.style.transform = `translateX(-${i * 100}vw)`;

  // mark active slide
  slideEls.forEach((s, k) => s.classList.toggle('is-active', k === i));

  // dots
  dots.forEach((d, k) => {
    d.classList.toggle('active', k === i);
    d.setAttribute('aria-selected', String(k === i));
  });

  // arrows visibility
  if (prevBtn) prevBtn.hidden = i === 0;
  if (nextBtn) nextBtn.hidden = i === SLIDES.length - 1;

  // nav link active state
  setActiveTab(SLIDES[i]);

  // update URL hash (no jump)
  if (!fromHash) {
    const h = HASH_OF[SLIDES[i]];
    const newHash = h ? '#' + h : ' ';
    history.replaceState(null, '', newHash === ' ' ? location.pathname : newHash);
  }

  // reset slide's vertical scroll on enter
  if (slideEls[i]) slideEls[i].scrollTop = 0;
}

// click on nav-link
$$('.nav-links a').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    const tab = !href || href === '#' || href === '#top' ? 'hero' : href.slice(1);
    const idx = SLIDES.indexOf(tab);
    if (idx >= 0) {
      e.preventDefault();
      goToSlide(idx);
    }
  });
});

// arrows
if (prevBtn) prevBtn.addEventListener('click', () => goToSlide(slideIdx - 1));
if (nextBtn) nextBtn.addEventListener('click', () => goToSlide(slideIdx + 1));

// dots
dots.forEach((d) => d.addEventListener('click', () => goToSlide(parseInt(d.dataset.slide, 10))));

// keyboard — only when nothing focused inside a form field
document.addEventListener('keydown', (e) => {
  if (!modal.hidden) return;                          // modal handles its own keys
  const t = e.target;
  if (t && t.matches && t.matches('input, textarea, select, [contenteditable="true"]')) return;
  if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); goToSlide(slideIdx + 1); }
  else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); goToSlide(slideIdx - 1); }
  else if (e.key === 'Home') { e.preventDefault(); goToSlide(0); }
  else if (e.key === 'End') { e.preventDefault(); goToSlide(SLIDES.length - 1); }
});

// touch swipe
let tStartX = 0, tStartY = 0, tStartTime = 0;
deck.addEventListener('touchstart', (e) => {
  tStartX = e.touches[0].clientX;
  tStartY = e.touches[0].clientY;
  tStartTime = Date.now();
}, { passive: true });
deck.addEventListener('touchend', (e) => {
  const dx = e.changedTouches[0].clientX - tStartX;
  const dy = e.changedTouches[0].clientY - tStartY;
  const dt = Date.now() - tStartTime;
  // require horizontal-dominant swipe of meaningful distance + reasonable speed
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.3 && dt < 700) {
    goToSlide(slideIdx + (dx < 0 ? 1 : -1));
  }
}, { passive: true });

// hash sync (browser back/forward)
window.addEventListener('hashchange', () => {
  const h = location.hash.slice(1);
  const target = SLIDES.find((s) => HASH_OF[s] === h) || 'hero';
  const idx = SLIDES.indexOf(target);
  if (idx >= 0) goToSlide(idx, { fromHash: true });
});

// wheel: support trackpad horizontal swipe on desktop
let wheelLock = false;
deck.addEventListener('wheel', (e) => {
  // only respond to dominant horizontal wheel (trackpad two-finger horizontal)
  if (Math.abs(e.deltaX) < Math.abs(e.deltaY) * 1.5) return;
  if (wheelLock) return;
  if (Math.abs(e.deltaX) < 30) return;
  wheelLock = true;
  goToSlide(slideIdx + (e.deltaX > 0 ? 1 : -1));
  setTimeout(() => { wheelLock = false; }, 700);
}, { passive: true });

// init: check hash, jump-gear from footer no longer needs scroll
const initHash = location.hash.slice(1);
const initTarget = SLIDES.find((s) => HASH_OF[s] === initHash) || 'hero';
const initIdx = SLIDES.indexOf(initTarget);
slideIdx = initIdx;
// apply initial state without animation
track.style.transition = 'none';
track.style.transform = `translateX(-${initIdx * 100}vw)`;
slideEls.forEach((s, k) => s.classList.toggle('is-active', k === initIdx));
dots.forEach((d, k) => d.classList.toggle('active', k === initIdx));
setActiveTab(SLIDES[initIdx]);
if (prevBtn) prevBtn.hidden = initIdx === 0;
if (nextBtn) nextBtn.hidden = initIdx === SLIDES.length - 1;
// re-enable transition after a frame
requestAnimationFrame(() => { track.style.transition = ''; });

/* ============================================================
   Initial render
   ============================================================ */
updateSectionUI(current);
