/* =============================================================
   BACKROAD — קטלוג המוצרים
   -------------------------------------------------------------
   זהו הקובץ היחיד שצריך לערוך כדי לשנות מוצרים, מחירים וצבעים.
   אין צורך לגעת בשום קובץ אחר.

   שדות של מוצר:
     id          – מזהה ייחודי באנגלית. משמש גם כשם קובץ התמונה.
                   התמונה נטענת מ:  images/products/<id>.jpg
     name        – שם המוצר כפי שיוצג באתר
     category    – מזהה הקטגוריה (מתוך CATEGORIES למטה)
     group       – תת-קבוצה בתוך הקטגוריה (אופציונלי)
     price       – מחיר בשקלים. *** מחירים אלו הם מחירי הדגמה ***
     variants    – רשימת הגוונים/הסוגים הזמינים
     variantLabel– הכותרת שמעל בורר הגוונים ("צבע" / "סוג")
     desc        – תיאור קצר
     badge       – תווית אופציונלית שמופיעה על התמונה
============================================================= */

/* ---------- לוח הגוונים של העור ---------- */
const LEATHER = {
  black:   { name: 'שחור פחם',    hex: '#1b1917' },
  darkbr:  { name: 'חום כהה',     hex: '#4a2f21' },
  tan:     { name: 'טאן טבעי',    hex: '#8a5a34' },
  cognac:  { name: 'קוניאק',      hex: '#a9662f' },
  tobacco: { name: 'טבק',         hex: '#6b4423' },
  oxblood: { name: 'בורדו',       hex: '#5c2028' },
  sand:    { name: 'חול',         hex: '#c39a68' },
  charcoal:{ name: 'אפור אפר',    hex: '#3a3a38' }
};

/* סדר הגוונים – נלקחים ה-N הראשונים לפי מספר הצבעים שבאפיון */
const SHADE_ORDER = ['black','darkbr','tan','cognac','tobacco','oxblood','sand','charcoal'];

/** מחזיר את N הגוונים הראשונים מהלוח */
function shades(n) {
  return SHADE_ORDER.slice(0, n).map(k => ({ key: k, ...LEATHER[k] }));
}

/** יוצר N "סוגים" ממוספרים (למוצרים שבהם המספר אינו צבע אלא סוג) */
function types(n, prefix) {
  return Array.from({ length: n }, (_, i) => ({
    key: 't' + (i + 1),
    name: (prefix || 'סוג') + ' ' + (i + 1),
    hex: null
  }));
}

/* ---------- הקטגוריות ---------- */
const CATEGORIES = [
  { id: 'accessories', name: 'אביזרים',              tagline: 'הפרטים הקטנים שעושים את האופנוע' },
  { id: 'tank',        name: 'אביזרים למיכל דלק',    tagline: 'רצועות ופאדים בהתאמה לדגם' },
  { id: 'bars',        name: 'אביזרים לכידון',       tagline: 'עור שנכנס לידיים ולא יוצא' },
  { id: 'riding',      name: 'ציוד רכיבה',           tagline: 'הגנה שנראית טוב' },
  { id: 'bags',        name: 'תיקים',                tagline: 'תפורים לכביש הארוך' },
  { id: 'lifestyle',   name: 'LIFESTYLE',            tagline: 'הכביש ממשיך גם כשיורדים מהאופנוע' }
];

/* תתי-קבוצות בתוך קטגוריית התיקים */
const GROUPS = {
  'bags-side':    'תיקי צד ותיקי גב',
  'bags-duffle':  'תיקי דאפל',
  'bags-tank':    'תיקי מיכל דלק',
  'bags-small':   'תיקי צד קטנים',
  'bags-thigh':   'תיקי ירך',
  'bags-wing':    'תיקים לדפנות האופנוע'
};

/* ---------- המוצרים ---------- */
const PRODUCTS = [
  /* ===== 1. אביזרים ===== */
  { id: 'leather-care-kit', name: 'ערכת ניקוי עור', category: 'accessories', price: 89,
    variants: [{ key: 'kit', name: 'ערכה אחת', hex: null }], variantLabel: 'ערכה',
    desc: 'סבון אוכף, קרם הזנה ומטלית כותנה. כל מה שצריך כדי שהעור יזדקן יפה במקום להיסדק.' },

  { id: 'engine-cover', name: 'מכסה למנוע', category: 'accessories', price: 249,
    variants: shades(1), variantLabel: 'צבע',
    desc: 'מכסה עור תפור ביד שמגן על דופן המנוע ומוסיף לו אופי.' },

  { id: 'oil-cap-cover', name: 'מכסה לשמן מנוע', category: 'accessories', price: 199,
    variants: shades(1), variantLabel: 'צבע',
    desc: 'עטיפת עור למכסה שמן המנוע. פרט קטן, הבדל גדול.' },

  { id: 'pouch-exclusive', name: "פאוץ' שימושי אקסקלוסיבי", category: 'accessories', price: 329,
    variants: shades(2), variantLabel: 'צבע', badge: 'אקסקלוסיבי',
    desc: "פאוץ' בעבודת יד מעור מלא, בגימור מוקפד ובכמות מוגבלת." },

  { id: 'pouch-classic', name: "פאוץ' שימושי", category: 'accessories', price: 259,
    variants: shades(4), variantLabel: 'צבע',
    desc: "פאוץ' יומיומי לכלים, מסמכים או מה שצריך להיות בהישג יד." },

  { id: 'headlight-straps', name: 'רצועות עור לפנס', category: 'accessories', price: 189,
    variants: shades(6), variantLabel: 'צבע',
    desc: 'זוג רצועות עור לפנס הקדמי. ההשלמה הקלאסית לכל אופנוע רטרו.' },

  { id: 'headlight-straps-perf', name: 'רצועות עור מחוררות לפנס', category: 'accessories', price: 199,
    variants: shades(6), variantLabel: 'צבע',
    desc: 'אותן רצועות, בגימור מחורר בסגנון כפפות המרוץ של פעם.' },

  { id: 'saddle-mounts', name: 'תושבות לאוכף', category: 'accessories', price: 279,
    variants: types(8, 'סוג'), variantLabel: 'סוג',
    desc: 'שמונה סוגי תושבות עור לאוכף — בחרו את זה שמתאים לשלדה שלכם.' },

  /* ===== 2. אביזרים למיכל דלק ===== */
  { id: 'tank-strap-interceptor', name: 'רצועה למיכל דלק — Interceptor / GT 650', category: 'tank', price: 269,
    variants: shades(1), variantLabel: 'צבע',
    desc: 'רצועת מיכל בהתאמה מדויקת ל-Royal Enfield Interceptor ו-Continental GT 650.' },

  { id: 'tank-strap-meteor', name: 'רצועה למיכל דלק — Super Meteor / Shotgun 650', category: 'tank', price: 269,
    variants: shades(1), variantLabel: 'צבע',
    desc: 'רצועת מיכל בהתאמה ל-Super Meteor 650 ול-Shotgun 650.' },

  { id: 'tank-strap-triumph', name: 'רצועה למיכל דלק — TRIUMPH', category: 'tank', price: 279,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'רצועת מיכל לדגמי טריומף המודרן-קלאסיק.' },

  { id: 'tank-strap-triumph400', name: 'רצועה למיכל דלק — TRIUMPH 400', category: 'tank', price: 259,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'רצועת מיכל בהתאמה ל-Triumph Speed 400 ו-Scrambler 400X.' },

  { id: 'tank-strap-center', name: 'רצועה למיכל דלק מרכזית', category: 'tank', price: 249,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'רצועה מרכזית לאורך המיכל — הקו הקלאסי ביותר.' },

  { id: 'tank-strap-right', name: 'רצועה למיכל דלק — צד ימין', category: 'tank', price: 249,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'רצועת צד אסימטרית שמדגישה את קימור המיכל.' },

  { id: 'tank-pad-diamond', name: 'פאד למיכל דלק — יהלום', category: 'tank', price: 269,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'פאד עור בתפר יהלום. מגן על הצבע מפני אבזם המעיל.' },

  { id: 'tank-pad-classic', name: 'פאד למיכל דלק — קלאסי', category: 'tank', price: 259,
    variants: shades(5), variantLabel: 'צבע',
    desc: 'פאד בתפר ישר ונקי, לאופנועים שלא צריכים לצעוק.' },

  { id: 'tank-pad-diamond-mini', name: 'פאד למיכל דלק — יהלום מיני', category: 'tank', price: 219,
    variants: shades(6), variantLabel: 'צבע',
    desc: 'גרסה מוקטנת של פאד היהלום, למיכלים קטנים או לניראות עדינה.' },

  { id: 'tank-pad-classic-mini', name: 'פאד למיכל דלק — קלאסי מיני', category: 'tank', price: 219,
    variants: shades(5), variantLabel: 'צבע',
    desc: 'הפאד הקלאסי במידה מוקטנת.' },

  /* ===== 3. אביזרים לכידון ===== */
  { id: 'grips-leather', name: 'גריפים מעור', category: 'bars', price: 299,
    variants: shades(7), variantLabel: 'צבע',
    desc: 'זוג גריפים עטופי עור בתפירה ידנית. אחיזה שמתרככת עם הקילומטרים.' },

  { id: 'grips-perforated', name: 'גריפים מעור מחורר', category: 'bars', price: 319,
    variants: shades(7), variantLabel: 'צבע',
    desc: 'גריפים בגימור מחורר — אוורור טוב יותר לרכיבות הקיץ.' },

  { id: 'cable-straps', name: 'רצועות עור לכבלים', category: 'bars', price: 129,
    variants: shades(6), variantLabel: 'צבע',
    desc: 'סט רצועות לאיסוף וסידור הכבלים סביב הכידון.' },

  /* ===== 4. ציוד רכיבה ===== */
  { id: 'shoe-guard', name: 'מגן עור לנעל', category: 'riding', price: 149,
    variants: shades(2), variantLabel: 'צבע',
    desc: 'מגן עור לנעל השמאלית — סוף לשריטות מדוושת ההילוכים.' },

  /* ===== 5. תיקים ===== */
  { id: 'backpack-eastwood', name: 'תיק גב Eastwood', category: 'bags', group: 'bags-side', price: 890,
    variants: shades(2), variantLabel: 'צבע', badge: 'רב מכר',
    desc: 'תיק גב מעור מלא עם רצועות מתכווננות ותא מרופד למחשב.' },

  { id: 'sidebag-outlaw', name: 'תיק צד Outlaw', category: 'bags', group: 'bags-side', price: 790,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'תיק צד קשיח עם אבזמי פליז, לרכיבות ארוכות.' },

  { id: 'backpack-rambler', name: 'תיק גב Rambler', category: 'bags', group: 'bags-side', price: 750,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'תיק גב בנפח בינוני עם דש עור וסגירה מהירה.' },

  { id: 'backpack-rolltop', name: 'תיק גב Roll Top', category: 'bags', group: 'bags-side', price: 820,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'סגירת גלילה אטומה — הנפח משתנה לפי מה שאתם סוחבים.' },

  { id: 'expedition-saddlebag', name: 'Expedition Saddlebag — ללא תושבות', category: 'bags', group: 'bags-side', price: 1190,
    variants: shades(2), variantLabel: 'צבע',
    desc: 'זוג תיקי אוכף לנסיעות ארוכות. נמכר ללא תושבות — ניתן להוסיף בנפרד.' },

  { id: 'duffle-outlaw', name: 'תיק דאפל Outlaw', category: 'bags', group: 'bags-duffle', price: 990,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'דאפל קלאסי לסופ״ש על הכביש. נקשר לאוכף האחורי או נישא ביד.' },

  { id: 'tank-and-tail', name: 'תיק Tank and Tail', category: 'bags', group: 'bags-tank', price: 690,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'תיק דו-שימושי — על המיכל בדרך החוצה, על הזנב בדרך חזרה.' },

  { id: 'tank-pouch', name: "תיק מיכל דלק — Pouch", category: 'bags', group: 'bags-tank', price: 390,
    variants: shades(4), variantLabel: 'צבע',
    desc: "פאוץ' מיכל קומפקטי לארנק, טלפון ומפתחות." },

  { id: 'navigator-pouch', name: 'Navigator Pouch', category: 'bags', group: 'bags-tank', price: 350,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'תיק ניווט עם חלון שקוף לטלפון — המסלול תמיד מול העיניים.' },

  { id: 'small-sidebag', name: 'תיק צד קטן מעור', category: 'bags', group: 'bags-small', price: 320,
    variants: shades(2), variantLabel: 'צבע',
    desc: 'תיק צד מינימלי לרכיבות עירוניות.' },

  { id: 'messenger-bag', name: 'Messenger Bag', category: 'bags', group: 'bags-small', price: 590,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'תיק שליחים מעור עם רצועת כתף רחבה ותא פנימי.' },

  { id: 'sidebag-classic', name: 'תיק צד קלאסי', category: 'bags', group: 'bags-small', price: 490,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'הצורה שלא השתנתה מאז שנות החמישים, כי לא היה צריך.' },

  { id: 'thigh-bag', name: 'תיק ירך', category: 'bags', group: 'bags-thigh', price: 390,
    variants: shades(4), variantLabel: 'צבע',
    desc: 'נקשר לירך ולחגורה — הכל בהישג יד גם תוך כדי רכיבה.' },

  { id: 'wingman-bag', name: 'תיק Wingman', category: 'bags', group: 'bags-wing', price: 450,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'תיק שנצמד לדופן האופנוע ולא זז — בדיוק כמו שותף טוב לדרך.' },

  /* ===== 6. LIFESTYLE ===== */
  { id: 'wallets', name: 'ארנקים', category: 'lifestyle', price: 199,
    variants: shades(3), variantLabel: 'צבע',
    desc: 'ארנק עור מלא בתפירה ידנית, מאותו עור שממנו נתפרים התיקים.' },

  { id: 'keychains', name: 'מחזיקי מפתחות', category: 'lifestyle', price: 79,
    variants: shades(8), variantLabel: 'צבע',
    desc: 'מחזיק מפתחות עור עם טבעת פליז מוצקה.' }
];

/* ---------- מוצרים מומלצים לעמוד הבית ---------- */
const FEATURED = ['backpack-eastwood', 'grips-leather', 'tank-pad-diamond', 'duffle-outlaw'];
