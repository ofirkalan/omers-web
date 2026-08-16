/* =============================================================
   BACKROAD — עמוד התשלום
   -------------------------------------------------------------
   *** חשוב לדעת ***
   אתר סטטי אינו יכול לחייב כרטיס אשראי בעצמו — חיוב אמיתי מחייב
   ספק סליקה חיצוני. הטופס כאן מבצע ולידציה מלאה ומייצר הזמנה,
   אבל *לא* מעביר כסף.

   כדי לחבר סליקה אמיתית — יש לשנות פונקציה אחת בלבד:
   processPayment() שבתחתית הקובץ. שם מופיעות הוראות מדויקות.
============================================================= */

/* ---------------- אמצעי תשלום ---------------- */
const PAY_METHODS = [
  { key: 'card',   label: 'כרטיס אשראי',            note: 'ויזה · מאסטרקארד · אמריקן אקספרס' },
  { key: 'bit',    label: 'ביט',                    note: 'תישלח בקשת תשלום לנייד' },
  { key: 'paypal', label: 'PayPal',                 note: 'מעבר לעמוד המאובטח של PayPal' },
  { key: 'pickup', label: 'תשלום באיסוף עצמי',      note: 'איסוף מהסדנה, ' + STORE.address }
];

/* ---------------- כלי ולידציה ---------------- */
const V = {
  required: v => v.trim().length > 0 || 'שדה חובה',
  name:     v => v.trim().length >= 2 || 'נא להזין שם מלא',
  email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'כתובת אימייל לא תקינה',
  phone:    v => /^0\d{8,9}$/.test(v.replace(/[\s\-()+]/g, '')) || 'מספר טלפון ישראלי לא תקין',
  zip:      v => v.trim() === '' || /^\d{5,7}$/.test(v.trim()) || 'מיקוד בן 5–7 ספרות',
  cardNo:   v => luhn(v.replace(/\D/g, '')) || 'מספר כרטיס לא תקין',
  expiry:   v => validExpiry(v) || 'תוקף לא תקין (MM/YY)',
  cvv:      v => /^\d{3,4}$/.test(v.trim()) || 'קוד אבטחה בן 3–4 ספרות',
  idNum:    v => /^\d{9}$/.test(v.trim()) || 'תעודת זהות בת 9 ספרות'
};

/** בדיקת ספרת ביקורת של מספר כרטיס (אלגוריתם לוהן) */
function luhn(num) {
  if (!/^\d{13,19}$/.test(num)) return false;
  let sum = 0, dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i];
    if (dbl) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

/** תוקף הכרטיס חייב להיות בפורמט MM/YY ובעתיד */
function validExpiry(v) {
  const m = v.trim().match(/^(\d{2})\s*\/\s*(\d{2})$/);
  if (!m) return false;
  const month = +m[1], year = 2000 + +m[2];
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const end = new Date(year, month, 0, 23, 59, 59);
  return end >= now;
}

/* ---------------- תצוגת העמוד ---------------- */
function renderCheckout() {
  const { rows, subtotal, shipping, total } = Cart.detailed();

  if (!rows.length) {
    $('#checkout-root').innerHTML = `
      <div class="empty-state">
        <h3>אין מה לשלם עליו</h3>
        <p>העגלה ריקה.</p>
        <a class="btn" href="shop.html">לחנות</a>
      </div>`;
    return;
  }

  $('#checkout-root').innerHTML = `
    <div class="checkout-layout">
      <form id="checkout-form" novalidate>

        <div class="demo-note">
          <strong>מצב הדגמה.</strong>
          הטופס בודק את כל הפרטים ומייצר הזמנה, אך אינו מחייב כרטיס אשראי בפועל.
          לחיבור סליקה אמיתית יש לערוך את הפונקציה <code>processPayment()</code>
          בקובץ <code>js/checkout.js</code>.
        </div>

        <!-- 1. פרטי לקוח -->
        <div class="form-card">
          <h3><span class="step">1</span> פרטי הלקוח</h3>
          <div class="grid-2">
            <div>
              <label for="fullname">שם מלא</label>
              <input class="input" id="fullname" name="fullname" data-rule="name" autocomplete="name">
              <span class="err"></span>
            </div>
            <div>
              <label for="phone">טלפון</label>
              <input class="input" id="phone" name="phone" data-rule="phone" inputmode="tel" autocomplete="tel" placeholder="050-0000000">
              <span class="err"></span>
            </div>
          </div>
          <div>
            <label for="email">אימייל</label>
            <input class="input" id="email" name="email" data-rule="email" inputmode="email" autocomplete="email">
            <span class="err"></span>
          </div>
        </div>

        <!-- 2. משלוח -->
        <div class="form-card">
          <h3><span class="step">2</span> כתובת למשלוח</h3>
          <div class="grid-2">
            <div>
              <label for="city">עיר</label>
              <input class="input" id="city" name="city" data-rule="required" autocomplete="address-level2">
              <span class="err"></span>
            </div>
            <div>
              <label for="street">רחוב ומספר</label>
              <input class="input" id="street" name="street" data-rule="required" autocomplete="street-address">
              <span class="err"></span>
            </div>
            <div>
              <label for="zip">מיקוד <span style="opacity:.6">(לא חובה)</span></label>
              <input class="input" id="zip" name="zip" data-rule="zip" inputmode="numeric" autocomplete="postal-code">
              <span class="err"></span>
            </div>
            <div>
              <label for="notes">הערות לשליח</label>
              <input class="input" id="notes" name="notes">
              <span class="err"></span>
            </div>
          </div>
        </div>

        <!-- 3. תשלום -->
        <div class="form-card">
          <h3><span class="step">3</span> אמצעי תשלום</h3>
          <div class="pay-methods">
            ${PAY_METHODS.map((m, i) => `
              <label class="pay-opt">
                <input type="radio" name="pay" value="${m.key}" ${i === 0 ? 'checked' : ''}>
                <span>
                  <strong>${esc(m.label)}</strong>
                  <span style="display:block;font-size:.84rem;color:var(--tx-dark-mute)">${esc(m.note)}</span>
                </span>
              </label>`).join('')}
          </div>

          <!-- שדות כרטיס אשראי — מוצגים רק כשנבחר "כרטיס אשראי" -->
          <div id="card-fields">
            <div>
              <label for="cardno">מספר כרטיס</label>
              <input class="input" id="cardno" name="cardno" data-rule="cardNo" inputmode="numeric"
                     autocomplete="cc-number" placeholder="0000 0000 0000 0000" maxlength="23">
              <span class="err"></span>
            </div>
            <div class="grid-2">
              <div>
                <label for="expiry">תוקף</label>
                <input class="input" id="expiry" name="expiry" data-rule="expiry" inputmode="numeric"
                       autocomplete="cc-exp" placeholder="MM/YY" maxlength="5">
                <span class="err"></span>
              </div>
              <div>
                <label for="cvv">CVV</label>
                <input class="input" id="cvv" name="cvv" data-rule="cvv" inputmode="numeric"
                       autocomplete="cc-csc" placeholder="123" maxlength="4">
                <span class="err"></span>
              </div>
            </div>
            <div>
              <label for="idnum">ת״ז של בעל הכרטיס</label>
              <input class="input" id="idnum" name="idnum" data-rule="idNum" inputmode="numeric" maxlength="9">
              <span class="err"></span>
            </div>
          </div>

          <label class="pay-opt" style="border:0;padding:12px 0">
            <input type="checkbox" id="terms">
            <span>קראתי ואני מאשר/ת את תנאי השימוש ומדיניות ההחזרות</span>
          </label>
          <span class="err" id="terms-err"></span>

          <button class="btn brass block" type="submit" id="pay-btn" style="margin-top:12px">
            אישור ותשלום — ${money(total)}
          </button>
        </div>
      </form>

      <!-- סיכום -->
      <aside class="summary">
        <h3>ההזמנה שלכם</h3>
        ${rows.map(r => `
          <div class="line">
            <span>${esc(r.product.name)}<br>
              <span style="font-size:.8rem;opacity:.7">${esc(r.variant.name)} × ${r.qty}</span>
            </span>
            <span style="white-space:nowrap">${money(r.lineTotal)}</span>
          </div>`).join('')}
        <div class="line" style="border-top:1px solid var(--ink-line);margin-top:8px;padding-top:14px">
          <span>סכום ביניים</span><span>${money(subtotal)}</span>
        </div>
        <div class="line"><span>משלוח</span><span>${shipping ? money(shipping) : 'חינם'}</span></div>
        <div class="line total"><span>לתשלום</span><span>${money(total)}</span></div>
        <p class="note">המחירים כוללים מע״מ. זמן אספקה: 5–9 ימי עסקים.</p>
        <a href="cart.html" style="display:inline-block;margin-top:12px;font-size:.85rem;text-decoration:underline">
          חזרה לעגלה
        </a>
      </aside>
    </div>`;

  wireForm(total);
}

/* ---------------- התנהגות הטופס ---------------- */
function wireForm(total) {
  const form = $('#checkout-form');
  const cardFields = $('#card-fields');

  /* הצגה/הסתרה של שדות הכרטיס לפי אמצעי התשלום */
  const payMethod = () => form.querySelector('input[name="pay"]:checked').value;
  const syncCardFields = () => { cardFields.hidden = payMethod() !== 'card'; };
  $$('input[name="pay"]', form).forEach(r => r.addEventListener('change', syncCardFields));
  syncCardFields();

  /* עיצוב אוטומטי של מספר הכרטיס והתוקף תוך כדי הקלדה */
  $('#cardno').addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 19).replace(/(.{4})/g, '$1 ').trim();
  });
  $('#expiry').addEventListener('input', e => {
    const d = e.target.value.replace(/\D/g, '').slice(0, 4);
    e.target.value = d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  });

  /** בודק שדה יחיד ומציג שגיאה מתחתיו */
  function checkField(input) {
    const rule = input.dataset.rule;
    if (!rule) return true;
    // שדות כרטיס אינם נבדקים כשהם מוסתרים
    if (cardFields.contains(input) && cardFields.hidden) return true;

    const result = V[rule](input.value);
    const box = input.parentElement.querySelector('.err');
    if (result === true) {
      input.removeAttribute('aria-invalid');
      box.textContent = '';
      return true;
    }
    input.setAttribute('aria-invalid', 'true');
    box.textContent = result;
    return false;
  }

  $$('[data-rule]', form).forEach(input => {
    input.addEventListener('blur', () => checkField(input));
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid')) checkField(input);
    });
  });

  /* ---------- שליחה ---------- */
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const fields = $$('[data-rule]', form);
    const allOk = fields.map(checkField).every(Boolean);

    const terms = $('#terms');
    $('#terms-err').textContent = terms.checked ? '' : 'יש לאשר את התנאים';

    if (!allOk || !terms.checked) {
      const firstBad = form.querySelector('[aria-invalid="true"]') || (!terms.checked ? terms : null);
      firstBad?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      firstBad?.focus({ preventScroll: true });
      toast('חלק מהפרטים חסרים או שגויים');
      return;
    }

    const btn = $('#pay-btn');
    btn.disabled = true;
    btn.textContent = 'מעבד תשלום…';

    const order = {
      items: Cart.detailed().rows.map(r => ({
        id: r.product.id, name: r.product.name,
        variant: r.variant.name, qty: r.qty, price: r.product.price
      })),
      total,
      method: payMethod(),
      customer: Object.fromEntries(new FormData(form))
    };
    delete order.customer.cardno;   // לעולם לא שומרים פרטי כרטיס
    delete order.customer.cvv;
    delete order.customer.idnum;

    const result = await processPayment(order);

    if (result.ok) {
      Cart.clear();
      showReceipt(result.orderNo, order);
    } else {
      btn.disabled = false;
      btn.textContent = 'אישור ותשלום — ' + money(total);
      toast(result.message || 'התשלום נכשל. נסו שוב.');
    }
  });
}

/* =============================================================
   *** נקודת החיבור לסליקה ***
   -------------------------------------------------------------
   כרגע: מדמה תשלום מוצלח אחרי שנייה, ומחזיר מספר הזמנה.

   כדי לחבר ספק סליקה אמיתי, החליפו את גוף הפונקציה באחד מאלה:

   1) ספק ישראלי (טרנזילה / קארדקום / Grow) — הפניה לעמוד מאובטח:
      const url = `https://direct.tranzila.com/<TERMINAL>/?sum=${order.total}`
                + `&currency=1&cred_type=1&contact=${encodeURIComponent(order.customer.fullname)}`;
      location.href = url;
      return { ok: false, message: 'מעביר לעמוד התשלום…' };

   2) Stripe Checkout — דורש קריאה לשרת קטן שיוצר session:
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST', headers: {'Content-Type':'application/json'},
        body: JSON.stringify(order)
      });
      const { url } = await res.json();
      location.href = url;
      return { ok: false };

   3) PayPal — הטמעת כפתורי PayPal SDK במקום הכפתור הרגיל.

   בכל המקרים: אין לשלוח מספרי כרטיס אשראי מהדפדפן לשרת משלכם.
   הספק חייב לקבל אותם ישירות (עמוד מאובטח / iframe / SDK).
============================================================= */
async function processPayment(order) {
  await new Promise(r => setTimeout(r, 1000));

  const orderNo = 'BR-' +
    new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' +
    Math.floor(1000 + Math.random() * 9000);

  // שמירה מקומית כדי שאפשר יהיה לראות שההזמנה נקלטה (הדגמה בלבד)
  try {
    const past = JSON.parse(localStorage.getItem('backroad_orders') || '[]');
    past.push({ orderNo, ...order });
    localStorage.setItem('backroad_orders', JSON.stringify(past));
  } catch { /* אין מקום באחסון — לא קריטי */ }

  return { ok: true, orderNo };
}

/* ---------------- מסך אישור ---------------- */
function showReceipt(orderNo, order) {
  const methodLabel = (PAY_METHODS.find(m => m.key === order.method) || {}).label || '';
  $('#checkout-root').innerHTML = `
    <div class="receipt">
      <p class="eyebrow center">Order Confirmed</p>
      <h2>קיבלנו את ההזמנה</h2>
      <p class="lead" style="margin-inline:auto">
        תודה, ${esc(order.customer.fullname.split(' ')[0])}. שלחנו אישור לכתובת
        ${esc(order.customer.email)}.
      </p>
      <div class="order-no latin">${orderNo}</div>
      <div class="spec-list" style="text-align:start">
        <div><span class="k">סכום</span><span>${money(order.total)}</span></div>
        <div><span class="k">אמצעי תשלום</span><span>${esc(methodLabel)}</span></div>
        <div><span class="k">משלוח אל</span><span>${esc(order.customer.street)}, ${esc(order.customer.city)}</span></div>
        <div><span class="k">פריטים</span><span>${order.items.reduce((s, i) => s + i.qty, 0)}</span></div>
      </div>
      <p style="font-size:.82rem;color:var(--tx-dark-mute);margin-top:24px">
        זוהי הזמנת הדגמה — לא בוצע חיוב בפועל.
      </p>
      <a class="btn" href="shop.html" style="margin-top:18px">חזרה לחנות</a>
    </div>`;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', renderCheckout);
