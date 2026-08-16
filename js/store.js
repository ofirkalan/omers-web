/* =============================================================
   BACKROAD — הלוגיקה המשותפת לכל העמודים
   כותרת ופוטר, עגלת קניות (localStorage), עזרי תצוגה.
============================================================= */

/* ---------------- הגדרות חנות ---------------- */
const STORE = {
  name: 'BACKROAD',
  tagline: 'HANDMADE LEATHER · MOTORCYCLE GOODS',
  phone: '050-000-0000',
  email: 'hello@backroad.co.il',
  address: 'הסדנה, תל אביב',
  freeShippingOver: 500,   // משלוח חינם מעל סכום זה
  shippingFlat: 39,        // עלות משלוח קבועה
  vatIncluded: true
};

const CART_KEY = 'backroad_cart_v1';

/* ---------------- עזרים ---------------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** בורח מתווים מיוחדים כדי שלא ישברו את ה-HTML */
function esc(str) {
  return String(str).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** מעצב סכום כמחיר בשקלים */
function money(n) {
  return '₪' + Number(n).toLocaleString('he-IL');
}

/** מוצא מוצר לפי מזהה */
function getProduct(id) { return PRODUCTS.find(p => p.id === id); }

/** מוצא קטגוריה לפי מזהה */
function getCategory(id) { return CATEGORIES.find(c => c.id === id); }

/** פרמטר מתוך כתובת ה-URL */
function param(key) { return new URLSearchParams(location.search).get(key); }

/**
 * מחזיר HTML של תמונת מוצר.
 * התמונה נטענת מ- images/products/<id>.jpg
 * כל עוד הקובץ לא הועלה — המסגרת נשארת ריקה (ללא מציין-מקום).
 */
function productImage(p) {
  return `<img src="images/products/${p.id}.jpg" alt="${esc(p.name)}" loading="lazy"
               onerror="this.remove()">`;
}

/** מחזיר HTML של כרטיס מוצר לרשת המוצרים */
function productCard(p) {
  const dots = p.variants.filter(v => v.hex).slice(0, 5)
    .map(v => `<span class="swatch-dot" style="background:${v.hex}" title="${esc(v.name)}"></span>`).join('');
  const extra = p.variants.length > 5 ? `<span class="swatch-more">+${p.variants.length - 5}</span>` : '';
  // מוצרים ללא גוונים (למשל "8 סוגי תושבות") — מציגים את מספר האפשרויות במילים
  const swatches = dots
    ? `<span class="swatches">${dots}${extra}</span>`
    : p.variants.length > 1
      ? `<span class="swatch-more">${p.variants.length} ${esc(p.variantLabel)}ים</span>`
      : '';

  return `
    <a class="card" href="product.html?id=${p.id}">
      <div class="card-media">
        ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ''}
        ${productImage(p)}
      </div>
      <div class="card-body">
        <span class="card-cat">${esc(getCategory(p.category).name)}</span>
        <span class="card-name">${esc(p.name)}</span>
        <div class="card-foot">
          <span class="price">${money(p.price)}</span>
          ${swatches}
        </div>
      </div>
    </a>`;
}

/* =============================================================
   עגלת קניות
============================================================= */
const Cart = {
  read() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch { return []; }
  },
  write(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    Cart.paintCount();
    document.dispatchEvent(new CustomEvent('cart:change'));
  },
  /** מוסיף פריט. אותו מוצר באותו גוון מצטבר לשורה אחת. */
  add(id, variantKey, qty = 1) {
    const items = Cart.read();
    const row = items.find(i => i.id === id && i.variant === variantKey);
    if (row) row.qty += qty;
    else items.push({ id, variant: variantKey, qty });
    Cart.write(items);
  },
  setQty(index, qty) {
    const items = Cart.read();
    if (!items[index]) return;
    items[index].qty = Math.max(1, Math.min(99, qty));
    Cart.write(items);
  },
  remove(index) {
    const items = Cart.read();
    items.splice(index, 1);
    Cart.write(items);
  },
  clear() { Cart.write([]); },
  count() { return Cart.read().reduce((s, i) => s + i.qty, 0); },
  /** מחזיר את שורות העגלה מועשרות בנתוני המוצר, ואת הסיכומים */
  detailed() {
    const rows = Cart.read().map((i, index) => {
      const p = getProduct(i.id);
      if (!p) return null;
      const variant = p.variants.find(v => v.key === i.variant) || p.variants[0];
      return { index, product: p, variant, qty: i.qty, lineTotal: p.price * i.qty };
    }).filter(Boolean);

    const subtotal = rows.reduce((s, r) => s + r.lineTotal, 0);
    const shipping = rows.length === 0 || subtotal >= STORE.freeShippingOver ? 0 : STORE.shippingFlat;
    return { rows, subtotal, shipping, total: subtotal + shipping };
  },
  paintCount() {
    const n = Cart.count();
    $$('.cart-count').forEach(el => {
      el.textContent = n;
      el.dataset.empty = n === 0;
    });
  }
};

/* =============================================================
   הודעה צפה
============================================================= */
let toastTimer;
function toast(msg) {
  let el = $('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    el.setAttribute('role', 'status');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3200);
}

/* =============================================================
   כותרת ופוטר — מוזרקים לכל עמוד כדי שיהיו במקום אחד בלבד
============================================================= */
const NAV_LINKS = [
  { href: 'index.html',   label: 'בית' },
  { href: 'shop.html',    label: 'החנות' },
  { href: 'story.html',   label: 'הסיפור' },
  { href: 'contact.html', label: 'צור קשר' }
];

function renderHeader() {
  const here = location.pathname.split('/').pop() || 'index.html';
  const host = $('#site-header');
  if (!host) return;

  host.innerHTML = `
    <div class="topbar">משלוח חינם בהזמנה מעל ${money(STORE.freeShippingOver)} · תפור ביד בישראל</div>
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="brand" href="index.html">
          <span class="brand-mark latin">${STORE.name}</span>
          <span class="brand-sub latin">Leather Goods</span>
        </a>
        <nav class="nav" id="main-nav">
          ${NAV_LINKS.map(l =>
            `<a href="${l.href}" class="${l.href === here ? 'active' : ''}">${l.label}</a>`).join('')}
        </nav>
        <div class="header-tools">
          <a class="cart-btn" href="cart.html">
            <span>עגלה</span>
            <span class="cart-count" data-empty="true">0</span>
          </a>
          <button class="burger" aria-label="תפריט" aria-expanded="false">☰</button>
        </div>
      </div>
    </header>`;

  const burger = $('.burger', host);
  const nav = $('#main-nav', host);
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
}

function renderFooter() {
  const host = $('#site-footer');
  if (!host) return;

  host.innerHTML = `
    <footer class="site-footer">
      <div class="wrap">
        <div class="footer-grid">
          <div>
            <span class="brand-mark latin" style="color:var(--paper)">${STORE.name}</span>
            <p style="margin-top:14px;max-width:34ch">
              אביזרי עור לאופנועים, תפורים ביד. אנחנו מייצרים דברים שנועדו להיסדק,
              להשתפשף ולהיראות טוב יותר אחרי עשר שנים.
            </p>
          </div>
          <div>
            <h4>ניווט</h4>
            <ul>${NAV_LINKS.map(l => `<li><a href="${l.href}">${l.label}</a></li>`).join('')}</ul>
          </div>
          <div>
            <h4>קטגוריות</h4>
            <ul>${CATEGORIES.map(c =>
              `<li><a href="shop.html?cat=${c.id}">${esc(c.name)}</a></li>`).join('')}</ul>
          </div>
          <div>
            <h4>הישארו בקשר</h4>
            <ul>
              <li><a href="tel:${STORE.phone}">${STORE.phone}</a></li>
              <li><a href="mailto:${STORE.email}">${STORE.email}</a></li>
              <li>${STORE.address}</li>
            </ul>
            <form class="newsletter" id="newsletter">
              <input type="email" placeholder="אימייל" aria-label="אימייל לרשימת התפוצה" required>
              <button type="submit">הרשמה</button>
            </form>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} ${STORE.name}. כל הזכויות שמורות.</span>
          <span class="latin" style="font-size:.7rem">${STORE.tagline}</span>
        </div>
      </div>
    </footer>`;

  $('#newsletter', host).addEventListener('submit', e => {
    e.preventDefault();
    e.target.reset();
    toast('נרשמת לרשימת התפוצה. נעדכן כשיוצא משהו חדש.');
  });
}

/* ---------------- אתחול ---------------- */
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('grain');
  renderHeader();
  renderFooter();
  Cart.paintCount();
});
document.addEventListener('cart:change', Cart.paintCount);
