// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_ORDER = [
  'Produce','Bakery','Deli','Meat & Seafood','Dairy',
  'Frozen','Pantry & Snacks','Beverages','Paper & Cleaning',
  'Health & Beauty','Electronics','Appliances','Clothing',
  'Home & Garden','Auto','Other'
];

// ── Category auto-detection ────────────────────────────────────────────────────
const CATEGORY_KEYWORDS = {
  'Produce':          ['apple','orange','banana','grape','strawberry','blueberry','avocado','tomato','lettuce','spinach','kale','broccoli','cauliflower','carrot','celery','onion','garlic','pepper','mushroom','cucumber','zucchini','corn','lemon','lime','mango','pineapple','watermelon','melon','berry','salad','vegetable','veggie','fruit','herbs','cilantro','basil','parsley'],
  'Bakery':           ['bread','bagel','muffin','croissant','cake','pie','pastry','cookie','brownie','roll','bun','tortilla','wrap','pita','sourdough','brioche','donut','danish','baguette'],
  'Deli':             ['ham','deli','salami','pepperoni','prosciutto','pastrami','roast beef','swiss','manchego','hummus','dip'],
  'Meat & Seafood':   ['beef','steak','ground','pork','lamb','sausage','hot dog','bacon','chicken','ribs','brisket','salmon','tuna','shrimp','tilapia','cod','halibut','crab','lobster','fish','seafood','scallop','oyster','clam','meat','wings','drumstick','turkey'],
  'Dairy':            ['milk','butter','cream','yogurt','sour cream','cream cheese','cottage','egg','half and half','oat milk','almond milk','lactose','kefir','ghee'],
  'Frozen':           ['frozen','ice cream','pizza','burrito','nugget','waffle','edamame','stir fry','pot pie','smoothie pack'],
  'Pantry & Snacks':  ['oil','olive oil','rice','pasta','noodle','sauce','soup','broth','stock','canned','beans','lentil','flour','sugar','salt','spice','seasoning','ketchup','mustard','mayo','dressing','vinegar','syrup','honey','peanut butter','jam','jelly','cereal','oatmeal','granola','bar','chip','cracker','pretzel','popcorn','trail mix','nut','almond','cashew','walnut','peanut','chocolate','candy','snack'],
  'Beverages':        ['water','juice','soda','coffee','tea','energy drink','sports drink','wine','beer','sparkling','electrolyte','kombucha','lemonade','gatorade','bodyarmor','creamer'],
  'Paper & Cleaning': ['paper towel','toilet paper','tissue','napkin','trash bag','garbage bag','laundry','detergent','dish soap','dishwasher','wipe','sponge','bleach','cleaning','tide','downy','bounce','dryer','foil','plastic wrap','ziplock','ziploc'],
  'Health & Beauty':  ['vitamin','supplement','medicine','shampoo','conditioner','body wash','lotion','sunscreen','toothpaste','toothbrush','razor','deodorant','ibuprofen','tylenol','advil','allergy','melatonin','fish oil','protein','collagen','moisturizer','floss'],
  'Electronics':      ['tv','television','laptop','computer','tablet','ipad','phone','charger','cable','headphone','speaker','camera','printer','monitor','keyboard','mouse','battery','alexa','echo','smart'],
  'Appliances':       ['blender','mixer','air fryer','instant pot','coffee maker','toaster','microwave','vacuum','fan','heater','iron','waffle maker','juicer','food processor','espresso'],
  'Clothing':         ['shirt','pants','shorts','dress','jacket','coat','sweater','hoodie','sock','underwear','bra','legging','jeans','skirt','vest','shoes','boots','sneakers','sandals','hat','gloves'],
  'Home & Garden':    ['furniture','table','chair','shelf','storage','organizer','bin','basket','towel','sheet','pillow','blanket','comforter','mattress','plant','garden','hose','light','bulb','lamp','candle','frame','rug','curtain','shower','pot','pan','cookware'],
  'Auto':             ['tire','wiper','motor oil','windshield','floor mat','jump starter','air pump','automotive'],
};

function detectCategory(name) {
  if (!name.trim()) return 'Other';
  const s = name.toLowerCase();
  const rules = [
    // Multi-word patterns first (most specific)
    [/paper\s*towel|toilet\s*paper|trash\s*bag|garbage\s*bag|dish\s*soap|plastic\s*wrap|paper\s*plate|dryer\s*sheet|laundry\s*detergent|fabric\s*softener|floor\s*mat/, 'Paper & Cleaning'],
    [/peanut\s*butter|cream\s*cheese|sour\s*cream|almond\s*milk|oat\s*milk|skim\s*milk|whole\s*milk|olive\s*oil|coconut\s*oil|fish\s*oil|motor\s*oil|energy\s*drink|sports\s*drink|body\s*wash|lip\s*balm|eye\s*drops|first\s*aid|protein\s*bar|granola\s*bar|trail\s*mix|ice\s*cream|iced\s*tea|sparkling\s*water/, 'multi'],
    [/air\s*fryer|instant\s*pot|coffee\s*maker|food\s*processor|waffle\s*maker|bread\s*maker|rice\s*cooker|slow\s*cooker|stand\s*mixer/, 'Appliances'],
    [/ground\s*beef|ground\s*turkey|ground\s*pork|hot\s*dog|pot\s*pie|stir\s*fry|fried\s*rice/, 'multi-meat'],
    [/roast\s*beef|corned\s*beef|short\s*rib|rack\s*of\s*lamb|leg\s*of\s*lamb|whole\s*chicken|rotisserie\s*chicken/, 'Meat & Seafood'],
    [/jump\s*starter|windshield\s*wiper|motor\s*oil|car\s*wash|wiper\s*blade/, 'Auto'],

    // Single-word — ordered so ambiguous words resolve correctly
    // Produce
    [/\bapples?\b|\boranges?\b|\bbananas?\b|\bgrapes?\b|strawberr|blueberr|raspberr|blackberr|cranberr|avocados?\b|tomatos?\b|tomatoes|lettuce|spinach|arugula|\bkale\b|broccoli|cauliflower|carrots?\b|celery|\bonions?\b|\bgarlic\b|\bpeppers?\b|mushrooms?\b|cucumber|zucchini|squash|\bcorn\b|lemons?\b|limes?\b|mangos?\b|mangoes|pineapple|watermelon|\bmelons?\b|\bberries\b|\bberrys?\b|salad|greens|vegetable|veggie|\bfruit\b|cilantro|\bbasil\b|parsley|asparagus|artichoke|\bpeas?\b|edamame\b|scallion|ginger|beet|radish|turnip|yam|sweet\s*potato|butternut|cabbage|bok\s*choy|brussel|sprout|fennel|leek|shallot|fig|peach|plum|apricot|cherry|cherries|nectarine|pomegranate|papaya|guava|passion/, 'Produce'],
    // Bakery
    [/\bbreads?\b|bagels?\b|muffins?\b|croissants?\b|\bcakes?\b|\bpies?\b|pastry|pastries|cookies?\b|brownies?\b|\brolls?\b|\bbuns?\b|tortillas?\b|pita|sourdough|brioche|donuts?\b|danish|baguette|pretzel\s*bread|flatbread|lavash|naan|challah|focaccia|scone|biscuit|cornbread/, 'Bakery'],
    // Deli — word-bounded to avoid "shampoo" matching ham
    [/\bhams?\b|salami|pepperoni|prosciutto|pastrami|hummus|\bdeli\b|manchego|charcuterie|mortadella|chorizo|coppa|bresaola|genoa|capicola|pancetta|\bbrie\b|camembert|gouda|gruyere|manchego|havarti|provolone|muenster/, 'Deli'],
    // Meat & Seafood
    [/\bbeef\b|steaks?\b|\bpork\b|pork\s*chop|\blamb\b|sausages?\b|bacons?\b|chick[eo]ns?\b|chikins?\b|chikens?\b|brisket|short\s*rib|\bribs?\b|salmon|salman|samon|\btunas?\b|shrimps?\b|shrimp|tilapia|\bcod\b|halibut|\bcrabs?\b|lobster|seafood|scallops?\b|oysters?\b|clams?\b|\bmeats?\b|\bwings?\b|drumstick|turkeys?\b|\bfishs?\b|\bfish\b|ground|flank|sirloin|tenderloin|chuck|brisket|mahi|trout|sardine|anchov|sword|bass|perch|pike|herring|calamari|squid|mussel|prawn|langostino|venison|bison|elk|duck|quail|veal|oxtail|osso/, 'Meat & Seafood'],
    // Dairy
    [/\bmilks?\b|\bbutter\b|\bcream\b|yogurts?\b|greek\s*yogurt|\beggs?\b|kefir|\bghee\b|lactose|cheeses?\b|cheddar|mozzarella|parmesan|feta|colby|ricotta|cottage\s*cheese|cream\s*cheese|swiss\s*cheese|string\s*cheese|whipped\s*cream|half\s*and\s*half|heavy\s*cream|whipping\s*cream|dairy/, 'Dairy'],
    // Frozen
    [/frozen|\bpizza\b|pizzas?\b|burritos?\b|nuggets?\b|waffles?\b|pot\s*pie|edamame|dumplings?\b|gyoza|wontons?\b|eggroll|spring\s*roll|lasagna|enchilada|tamale|empanada|taquito|chimichanga|fish\s*stick|tater\s*tot|hash\s*brown|corn\s*dog/, 'Frozen'],
    // Pantry & Snacks
    [/\boil\b|\brice\b|\bpasta\b|noodles?\b|ramen|udon|soba|orzo|\bsauce\b|sauces|\bsoups?\b|\bbroth\b|\bstock\b|canned|beans|lentils?|chickpeas?|\bflour\b|sugars?|\bsalt\b|spices?|seasonings?|ketchup|mustard|\bmayo\b|mayonnaise|dressing|vinegar|syrups?|honey|jams?\b|jelly|jellies|\bcereal\b|oatmeal|granola|chips?\b|crackers?\b|pretzels?\b|popcorn|almonds?|cashews?|walnuts?|pecans?|pistachios?|peanuts?|macadamia|chocolates?|candies?\b|candy|snacks?\b|olives?|pickles?|relish|salsa|guacamole|hummus|tahini|miso|soy\s*sauce|teriyaki|hoisin|sriracha|tabasco|worcestershire|bouillon|coconut\s*milk|tomato\s*paste|tomato\s*sauce|marinara|alfredo|pesto|balsamic|maple\s*syrup|agave|stevia|splenda|protein\s*powder|collagen\s*powder|chia|flaxseed|quinoa|farro|barley|lentil|split\s*pea/, 'Pantry & Snacks'],
    // Beverages
    [/\bwaters?\b|juices?\b|\bsoda\b|sodas|coffees?\b|espresso|\bteas?\b|\bwines?\b|\bbeers?\b|sparkling|kombucha|lemonade|gatorade|bodyarmor|creamer|electrolyte|beverages?|drinks?\b|smoothie|protein\s*shake|collagen\s*drink|coconut\s*water|aloe\s*drink|matcha|cider|sake|whiskey|bourbon|vodka|rum|tequila|gin|liquor|spirits?|champagne|prosecco|sangria/, 'Beverages'],
    // Paper & Cleaning
    [/laundry|detergents?\b|dishwasher|\bwipes?\b|sponges?\b|bleach|cleaning|cleaners?|\btide\b|downy|\bbounce\b|dryer|aluminum\s*foil|\bfoils?\b|ziplock|ziploc|tissues?\b|napkins?\b|lysol|clorox|febreze|fabuloso|pine\s*sol|comet|ajax|method|seventh\s*generation|mr\s*clean|dawn\s*dish|palmolive|cascade|finish\s*dish|affresh|rug\s*cleaner|floor\s*cleaner|toilet\s*bowl|bathroom\s*cleaner|kitchen\s*cleaner|all\s*purpose|disinfect|antibacterial|hand\s*soap|bar\s*soap/, 'Paper & Cleaning'],
    // Health & Beauty
    [/vitamins?\b|supplements?\b|\bmedicines?\b|shampoos?\b|conditioners?\b|lotion|sunscreen|toothpaste|toothbrush|\brazors?\b|deodorant|ibuprofen|tylenol|\badvil\b|aleve|aspirin|allerg|melatonin|collagen|moisturizer|\bfloss\b|mouthwash|listerine|contacts|eye\s*drops|band\s*aid|bandage|antiseptic|neosporin|thermometer|blood\s*pressure|glucosamine|probiotic|omega|zinc|magnesium|calcium|vitamin\s*[a-z]|multivitamin|prenatal|biotin|turmeric|elderberry|echinacea|melatonin|fiber|stool|laxative|antacid|pepto|tums|gas\s*x|zyrtec|claritin|flonase|sudafed|nyquil|dayquil|mucinex|robitussin|cough|cold\s*medicine|pain\s*reliever|nail\s*clipper|tweezer|curling|flat\s*iron|hair\s*dryer|hair\s*color|mascara|lipstick|foundation|concealer|eyeliner|blush|bronzer|primer|setting\s*spray|makeup|perfume|cologne|body\s*spray|aftershave|electric\s*razor|nail\s*polish|cotton\s*ball|q\s*tips?|feminine|tampon|pad\s*feminine|condom|pregnancy|test\s*kit/, 'Health & Beauty'],
    // Electronics
    [/\btv\b|televisions?\b|laptops?\b|computers?\b|tablets?\b|\bipad\b|\biphone\b|\bphone\b|chargers?\b|cables?\b|headphones?\b|earphones?\b|earbuds?\b|speakers?\b|cameras?\b|printers?\b|monitors?\b|keyboards?\b|\bmouse\b|mice|batteries?\b|alexa|\becho\b|smart\s*home|router|modem|surge\s*protector|extension\s*cord|hdmi|usb|flash\s*drive|hard\s*drive|ssd|memory\s*card|sd\s*card|webcam|microphone|gaming|controller|playstation|xbox|nintendo|switch|airpods?|beats|bose|sonos|ring\s*doorbell|nest|smart\s*bulb|smart\s*plug|solar\s*panel|power\s*bank|wireless/, 'Electronics'],
    // Appliances
    [/blenders?\b|mixers?\b|toasters?\b|microwaves?\b|vacuums?\b|\bfans?\b|juicers?\b|dehumidifier|air\s*purifier|humidifier|space\s*heater|electric\s*kettle|panini|griddle|grill|smoker|pressure\s*cooker|sous\s*vide|mandoline|salad\s*spinner|can\s*opener|wine\s*opener|corkscrew|dishwasher|washing\s*machine|dryer\s*machine|refrigerator|freezer|chest\s*freezer/, 'Appliances'],
    // Clothing
    [/\bshirts?\b|\bpants?\b|\bshorts?\b|\bdresses?\b|jackets?\b|\bcoats?\b|sweaters?\b|hoodies?\b|\bsocks?\b|underwear|\bbras?\b|leggings?\b|\bjeans?\b|skirts?\b|\bvests?\b|\bshoes?\b|\bboots?\b|sneakers?\b|sandals?\b|\bhats?\b|gloves?\b|clothing|apparel|tights|stockings|pajamas|pjs|swimsuit|bikini|board\s*shorts|rash\s*guard|sports\s*bra|athletic|workout|running\s*shoe|slippers?|flip\s*flops?|loafers?|oxfords?|heels?|pumps?|wedges?|moccasins?|crocs?|ugg|north\s*face|columbia|patagonia|carhartt|polo|khaki|chino|cargo\s*pants|trousers?|blazer|suit\s*jacket|cardigan|pullover|turtleneck|tank\s*top|crop\s*top|romper|jumpsuit|overalls?|parka|windbreaker|rain\s*jacket|fleece|thermal|base\s*layer|robe|scarf|beanie|cap|visor|belt|wallet/, 'Clothing'],
    // Home & Garden
    [/furniture|\btables?\b|\bchairs?\b|\bshelves?\b|shelving|storage|organizer|\bbins?\b|baskets?\b|\btowels?\b|bedsheets?|\bsheets?\b|pillows?\b|blankets?\b|comforters?\b|mattress|mattresses|\bplants?\b|garden|\bhose\b|light\s*bulb|\bbulbs?\b|\blamps?\b|candles?\b|\brugs?\b|curtains?\b|\bpots?\b|\bpans?\b|cookware|bakeware|frying\s*pan|cast\s*iron|dutch\s*oven|baking\s*sheet|muffin\s*tin|cutting\s*board|knife|knives|spatula|ladle|whisk|tongs|colander|strainer|mixing\s*bowl|measuring\s*cup|glass\s*container|storage\s*container|tupperware|zip\s*lock|reusable\s*bag|trash\s*can|hamper|laundry\s*basket|shower\s*curtain|bath\s*mat|bath\s*rug|toilet\s*seat|plunger|toilet\s*brush|picture\s*frame|\bframes?\b|mirror|clock|vase|artificial\s*flower|fake\s*plant|succulent|patio|outdoor\s*furniture|umbrella\s*patio|fire\s*pit|lawn\s*mower|weed\s*eater|leaf\s*blower|pressure\s*washer|garden\s*tool|shovel|rake|hoe|wheelbarrow|planter|potting\s*soil|fertilizer|mulch|bird\s*feeder|stepping\s*stone|string\s*light/, 'Home & Garden'],
    // Auto
    [/\btires?\b|wipers?\b|windshield|floor\s*mat|automotive|oil\s*change|brake|coolant|antifreeze|transmission|car\s*battery|jumper\s*cable|air\s*compressor|tire\s*inflator|car\s*cover|seat\s*cover|steering\s*wheel\s*cover|car\s*freshener|rain\s*x|wd\s*40|wd40/, 'Auto'],
  ];

  for (const [rx, cat] of rules) {
    if (cat === 'multi' || cat === 'multi-meat') {
      if (rx.test(s)) return cat === 'multi-meat' ? 'Meat & Seafood' : 'Pantry & Snacks';
    } else if (rx.test(s)) {
      return cat;
    }
  }
  return 'Other';
}

// ── State ──────────────────────────────────────────────────────────────────────
const pathParts = window.location.pathname.split('/');
const listCode = (pathParts[pathParts.indexOf('list') + 1] || '').toUpperCase();

let listData = null;
let items = [];
let lastUpdatedAt = null;
let pollTimer = null;
let editingItemId = null;
let selectMode = false;
let selectedIds = new Set();

// ── DOM refs ───────────────────────────────────────────────────────────────────
const loadingState    = document.getElementById('loading-state');
const errorState      = document.getElementById('error-state');
const mainState       = document.getElementById('main-state');
const itemsContainer  = document.getElementById('items-container');
const fab             = document.getElementById('fab');
const addForm         = document.getElementById('add-form-container');
const addName         = document.getElementById('add-name');
const addQty          = document.getElementById('add-qty');
const addPrice        = document.getElementById('add-price');
const addNotes        = document.getElementById('add-notes');
const addItemNumber   = document.getElementById('add-item-number');
const addCategory     = document.getElementById('add-category');
const addError        = document.getElementById('add-error');
const addSubmitBtn    = document.getElementById('add-submit-btn');
const addCancelBtn    = document.getElementById('add-cancel-btn');
const statusBar       = document.getElementById('status-bar');
const shareBtn        = document.getElementById('share-btn');
const shareOverlay    = document.getElementById('share-overlay');
const listNameHeader  = document.getElementById('list-name-header');
const codeBadge       = document.getElementById('code-badge');
const clearCheckedBtn = document.getElementById('clear-checked-btn');
const selectModeBtn   = document.getElementById('select-mode-btn');
const deleteSelectedBar  = document.getElementById('delete-selected-bar');
const deleteSelectedBtn  = document.getElementById('delete-selected-btn');
const deleteSelectedLabel = document.getElementById('delete-selected-label');
const cancelSelectBtn = document.getElementById('cancel-select-btn');
const subtotalBar     = document.getElementById('subtotal-bar');

// ── Dark mode ──────────────────────────────────────────────────────────────────
const darkToggle = document.getElementById('dark-toggle');
function applyTheme(dark) {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
  darkToggle.textContent = dark ? '☀️' : '🌙';
}
let isDark = localStorage.getItem('shop119_dark') === '1';
applyTheme(isDark);
darkToggle.addEventListener('click', () => {
  isDark = !isDark;
  localStorage.setItem('shop119_dark', isDark ? '1' : '0');
  applyTheme(isDark);
});

// ── Populate category selects ──────────────────────────────────────────────────
function buildCategoryOptions(selectEl, selected) {
  selectEl.innerHTML = CATEGORY_ORDER.map(c =>
    `<option value="${c}"${c === (selected || 'Other') ? ' selected' : ''}>${c}</option>`
  ).join('');
}
buildCategoryOptions(addCategory, 'Other');

// ── Init ───────────────────────────────────────────────────────────────────────
if (!listCode || listCode.length !== 6) {
  window.location.href = '/';
} else {
  loadList(true);
  pollTimer = setInterval(() => loadList(false), 3500);
}

// ── API helpers ────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadList(initial) {
  try {
    const data = await api('GET', `/api/lists/${listCode}`);
    if (initial || data.updated_at !== lastUpdatedAt) {
      lastUpdatedAt = data.updated_at;
      listData = data;
      items = data.items || [];
      if (initial) showMain(data);
      renderItems();
      updateSubtotal();
      updateClearCheckedBtn();
    }
    setStatus('');
  } catch (err) {
    if (initial) {
      loadingState.style.display = 'none';
      errorState.style.display = 'block';
      clearInterval(pollTimer);
    } else {
      setStatus('Connection issue — retrying…');
    }
  }
}

function showMain(data) {
  loadingState.style.display = 'none';
  mainState.style.display = 'block';
  fab.style.display = 'flex';
  document.title = `${data.name} — Shop119`;
  listNameHeader.textContent = data.name;
  listNameHeader.style.display = 'block';
  codeBadge.textContent = data.code;
  codeBadge.style.display = 'inline-block';
  shareBtn.style.display = 'inline-flex';
  selectModeBtn.style.display = 'inline-flex';
  document.getElementById('share-code-val').textContent = data.code;
  document.getElementById('share-url-val').textContent = window.location.href;

  // Save to Your lists on any visit — joined or created
  try {
    const key = 'shop119_mine';
    const lists = JSON.parse(localStorage.getItem(key) || '[]');
    const exists = lists.find(l => l.code === data.code);
    if (!exists) {
      lists.unshift({ code: data.code, name: data.name, createdAt: data.created_at });
      localStorage.setItem(key, JSON.stringify(lists.slice(0, 20)));
    }
  } catch {}
}

function setStatus(msg) { statusBar.textContent = msg; }

// ── Subtotal ───────────────────────────────────────────────────────────────────
function updateSubtotal() {
  const unchecked = items.filter(i => !i.checked && i.price != null);
  if (!unchecked.length) { subtotalBar.classList.remove('visible'); return; }
  let total = 0;
  unchecked.forEach(i => {
    const qty = parseFloat(i.quantity) || 1;
    total += (parseFloat(i.price) || 0) * qty;
  });
  subtotalBar.textContent = `Est. total: $${total.toFixed(2)}`;
  subtotalBar.classList.add('visible');
}

// ── Clear checked btn ──────────────────────────────────────────────────────────
function updateClearCheckedBtn() {
  const hasChecked = items.some(i => i.checked);
  clearCheckedBtn.style.display = hasChecked ? 'inline-flex' : 'none';
}

// ── Render items ───────────────────────────────────────────────────────────────
function renderItems() {
  const unchecked = items.filter(i => !i.checked);
  const checked   = items.filter(i => i.checked);

  // Group unchecked by category in CATEGORY_ORDER
  const byCategory = {};
  unchecked.forEach(item => {
    const cat = CATEGORY_ORDER.includes(item.category) ? item.category : 'Other';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(item);
  });

  const sorted = [];
  CATEGORY_ORDER.forEach(cat => {
    if (byCategory[cat] && byCategory[cat].length) {
      sorted.push({ type: 'header', label: cat });
      byCategory[cat]
        .sort((a, b) => a.position - b.position || new Date(a.created_at) - new Date(b.created_at))
        .forEach(item => sorted.push({ type: 'item', item }));
    }
  });

  // Checked items at bottom with their own header
  if (checked.length) {
    sorted.push({ type: 'header', label: '✓ In the cart' });
    checked
      .sort((a, b) => a.position - b.position || new Date(a.created_at) - new Date(b.created_at))
      .forEach(item => sorted.push({ type: 'item', item }));
  }

  if (!sorted.length) {
    itemsContainer.innerHTML = `
      <div class="empty-state">
        <div class="icon">🛒</div>
        <p>No items yet. Tap <strong>+</strong> to add something.</p>
      </div>`;
    return;
  }

  // Remove empty state if present
  const emptyState = itemsContainer.querySelector('.empty-state');
  if (emptyState) emptyState.remove();

  // Rebuild DOM to match sorted list
  const existingItemMap = {};
  itemsContainer.querySelectorAll('[data-item-id]').forEach(el => {
    existingItemMap[el.dataset.itemId] = el;
  });

  // Clear and rebuild (simpler than keyed diff with headers interspersed)
  itemsContainer.innerHTML = '';
  sorted.forEach(entry => {
    if (entry.type === 'header') {
      const h = document.createElement('div');
      h.className = 'category-header';
      h.textContent = entry.label;
      itemsContainer.appendChild(h);
    } else {
      const { item } = entry;
      if (item.id === editingItemId) {
        const existing = existingItemMap[item.id];
        if (existing) { itemsContainer.appendChild(existing); return; }
      }
      itemsContainer.appendChild(buildItemNode(item));
    }
  });
}

function buildItemNode(item) {
  const div = document.createElement('div');
  div.className = `item-card${item.checked ? ' checked' : ''}${selectMode ? ' selectable' : ''}${selectedIds.has(item.id) ? ' selected' : ''}`;
  div.dataset.itemId = item.id;
  div.dataset.updatedAt = item.updated_at;
  div.dataset.checked = String(item.checked);

  if (selectMode) {
    const selCheck = document.createElement('div');
    selCheck.className = 'select-check';
    div.appendChild(selCheck);
    div.addEventListener('click', () => toggleSelect(item.id, div));
  } else {
    const checkEl = document.createElement('div');
    checkEl.className = `item-check${item.checked ? ' checked' : ''}`;
    checkEl.title = item.checked ? 'Mark as needed' : 'Mark as got it';
    checkEl.addEventListener('click', e => { e.stopPropagation(); toggleCheck(item); });
    div.appendChild(checkEl);
  }

  const body = document.createElement('div');
  body.className = 'item-body';

  let metaHtml = '';
  if (item.quantity && item.quantity !== '1') metaHtml += `<span class="qty-badge">× ${escHtml(item.quantity)}</span>`;
  else metaHtml += `<span class="qty-badge">× 1</span>`;
  if (item.price != null) metaHtml += `<span class="item-price">$${parseFloat(item.price).toFixed(2)}</span>`;
  if (item.item_number) metaHtml += `<span class="item-number-badge">#${escHtml(item.item_number)}</span>`;
  if (item.notes) metaHtml += `<span class="item-notes">${escHtml(item.notes)}</span>`;

  body.innerHTML = `
    <div class="item-name">${escHtml(item.name)}</div>
    <div class="item-meta">${metaHtml}</div>`;
  div.appendChild(body);

  if (!selectMode) {
    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon';
    editBtn.title = 'Edit';
    editBtn.textContent = '✏️';
    editBtn.addEventListener('click', e => { e.stopPropagation(); startEdit(item, div); });

    const delBtn = document.createElement('button');
    delBtn.className = 'btn-icon';
    delBtn.title = 'Delete';
    delBtn.textContent = '🗑️';
    delBtn.addEventListener('click', e => { e.stopPropagation(); deleteItem(item, div); });

    actions.append(editBtn, delBtn);
    div.appendChild(actions);
  }

  return div;
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Toggle check ───────────────────────────────────────────────────────────────
async function toggleCheck(item) {
  const newChecked = !item.checked;
  item.checked = newChecked;
  renderItems();
  updateSubtotal();
  updateClearCheckedBtn();
  try {
    const updated = await api('PATCH', `/api/lists/${listCode}/items/update`, { itemId: item.id, checked: newChecked });
    Object.assign(item, updated);
    lastUpdatedAt = null;
  } catch {
    item.checked = !newChecked;
    renderItems();
    updateSubtotal();
    updateClearCheckedBtn();
    setStatus('Could not update item. Try again.');
  }
}

// ── Delete item ────────────────────────────────────────────────────────────────
async function deleteItem(item, node) {
  if (!confirm(`Delete "${item.name}"?`)) return;
  node.style.opacity = '0.4';
  try {
    await api('DELETE', `/api/lists/${listCode}/items/delete`, { itemId: item.id });
    items = items.filter(i => i.id !== item.id);
    renderItems();
    updateSubtotal();
    updateClearCheckedBtn();
    lastUpdatedAt = null;
  } catch {
    node.style.opacity = '';
    setStatus('Could not delete item. Try again.');
  }
}

// ── Clear checked ──────────────────────────────────────────────────────────────
clearCheckedBtn.addEventListener('click', async () => {
  const n = items.filter(i => i.checked).length;
  if (!confirm(`Remove ${n} checked item${n !== 1 ? 's' : ''}?`)) return;
  clearCheckedBtn.disabled = true;
  try {
    await api('DELETE', `/api/lists/${listCode}/items/clear-checked`);
    items = items.filter(i => !i.checked);
    renderItems();
    updateSubtotal();
    updateClearCheckedBtn();
    lastUpdatedAt = null;
  } catch {
    setStatus('Could not clear items. Try again.');
  } finally {
    clearCheckedBtn.disabled = false;
  }
});

// ── Select mode ────────────────────────────────────────────────────────────────
selectModeBtn.addEventListener('click', enterSelectMode);
cancelSelectBtn.addEventListener('click', exitSelectMode);

function enterSelectMode() {
  selectMode = true;
  selectedIds.clear();
  selectModeBtn.style.display = 'none';
  deleteSelectedBar.classList.add('visible');
  updateDeleteSelectedLabel();
  renderItems();
  closeAddForm();
  fab.style.display = 'none';
}

function exitSelectMode() {
  selectMode = false;
  selectedIds.clear();
  selectModeBtn.style.display = 'inline-flex';
  deleteSelectedBar.classList.remove('visible');
  fab.style.display = 'flex';
  renderItems();
}

function toggleSelect(id, node) {
  if (selectedIds.has(id)) { selectedIds.delete(id); node.classList.remove('selected'); }
  else { selectedIds.add(id); node.classList.add('selected'); }
  updateDeleteSelectedLabel();
}

function updateDeleteSelectedLabel() {
  const n = selectedIds.size;
  deleteSelectedLabel.textContent = `${n} selected`;
  deleteSelectedBtn.textContent = n ? `Delete selected (${n})` : 'Delete selected';
  deleteSelectedBtn.style.opacity = n ? '1' : '0.5';
}

deleteSelectedBtn.addEventListener('click', async () => {
  if (!selectedIds.size) return;
  const n = selectedIds.size;
  if (!confirm(`Delete ${n} item${n !== 1 ? 's' : ''}?`)) return;
  deleteSelectedBtn.disabled = true;
  const ids = [...selectedIds];
  try {
    await Promise.all(ids.map(id => api('DELETE', `/api/lists/${listCode}/items/delete`, { itemId: id })));
    items = items.filter(i => !ids.includes(i.id));
    exitSelectMode();
    updateSubtotal();
    updateClearCheckedBtn();
    lastUpdatedAt = null;
  } catch {
    setStatus('Some items could not be deleted.');
    deleteSelectedBtn.disabled = false;
  }
});

// ── Inline edit ────────────────────────────────────────────────────────────────
function startEdit(item, node) {
  if (editingItemId) cancelEdit();
  editingItemId = item.id;

  const form = document.createElement('div');
  form.className = 'item-edit-form';
  form.dataset.itemId = item.id;

  const catOptions = CATEGORY_ORDER.map(c =>
    `<option value="${c}"${c === (item.category || 'Other') ? ' selected' : ''}>${c}</option>`
  ).join('');

  form.innerHTML = `
    <div class="input-row">
      <input class="input" id="edit-name" value="${escHtml(item.name)}" placeholder="Item name" maxlength="200" style="flex:2;">
      <input class="input" id="edit-qty" value="${escHtml(item.quantity)}" placeholder="Qty" maxlength="30" style="flex:1; max-width:90px;">
    </div>
    <div class="input-row">
      <input class="input" id="edit-price" type="number" value="${item.price != null ? item.price : ''}" placeholder="Price $" min="0" step="0.01" style="flex:1;">
      <input class="input" id="edit-item-number" value="${escHtml(item.item_number || '')}" placeholder="Item #" maxlength="20" style="flex:1;">
    </div>
    <select class="input" id="edit-category">${catOptions}</select>
    <input class="input" id="edit-notes" value="${escHtml(item.notes || '')}" placeholder="Notes (optional)" maxlength="200">
    <div class="edit-actions">
      <button class="btn btn-sm" id="edit-cancel-btn" style="background:var(--bg);color:var(--text);">Cancel</button>
      <button class="btn btn-red btn-sm" id="edit-save-btn">Save</button>
    </div>
    <p class="error-msg" id="edit-error"></p>`;

  node.replaceWith(form);
  form.querySelector('#edit-cancel-btn').addEventListener('click', cancelEdit);
  form.querySelector('#edit-save-btn').addEventListener('click', () => saveEdit(item));

  let editCategoryUserSet = false;
  const editNameEl = form.querySelector('#edit-name');
  const editCatEl  = form.querySelector('#edit-category');
  editNameEl.addEventListener('input', () => {
    if (!editCategoryUserSet) editCatEl.value = detectCategory(editNameEl.value);
  });
  editCatEl.addEventListener('change', () => { editCategoryUserSet = true; });

  editNameEl.focus();
}

function cancelEdit() {
  editingItemId = null;
  renderItems();
}

async function saveEdit(item) {
  const name     = document.getElementById('edit-name').value.trim();
  const qty      = document.getElementById('edit-qty').value.trim() || '1';
  const price    = document.getElementById('edit-price').value;
  const itemNum  = document.getElementById('edit-item-number').value.trim();
  const category = document.getElementById('edit-category').value;
  const notes    = document.getElementById('edit-notes').value.trim();
  const errEl    = document.getElementById('edit-error');

  if (!name) { errEl.textContent = 'Name is required.'; return; }
  errEl.textContent = '';
  const saveBtn = document.getElementById('edit-save-btn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner"></span>';

  try {
    const updated = await api('PATCH', `/api/lists/${listCode}/items/update`, {
      itemId: item.id, name, quantity: qty,
      price: price !== '' ? parseFloat(price) : null,
      item_number: itemNum, category, notes,
    });
    Object.assign(item, updated);
    editingItemId = null;
    lastUpdatedAt = null;
    renderItems();
    updateSubtotal();
  } catch (err) {
    errEl.textContent = err.message;
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

// ── Add item ───────────────────────────────────────────────────────────────────
let addCategoryUserSet = false;

fab.addEventListener('click', () => {
  const isOpen = addForm.classList.toggle('open');
  fab.classList.toggle('open', isOpen);
  if (isOpen) {
    addName.focus();
    addName.value = ''; addQty.value = ''; addPrice.value = '';
    addNotes.value = ''; addItemNumber.value = '';
    addCategory.value = 'Other';
    addCategoryUserSet = false;
    addError.textContent = '';
  }
});

addName.addEventListener('input', () => {
  if (!addCategoryUserSet) addCategory.value = detectCategory(addName.value);
});
addCategory.addEventListener('change', () => { addCategoryUserSet = true; });

addCancelBtn.addEventListener('click', closeAddForm);
addSubmitBtn.addEventListener('click', submitAddItem);
addName.addEventListener('keydown', e => { if (e.key === 'Enter') addCategory.focus(); });

function closeAddForm() {
  addForm.classList.remove('open');
  fab.classList.remove('open');
}

async function submitAddItem() {
  const name     = addName.value.trim();
  const qty      = addQty.value.trim() || '1';
  const price    = addPrice.value;
  const notes    = addNotes.value.trim();
  const itemNum  = addItemNumber.value.trim();
  const category = addCategory.value;

  if (!name) { addError.textContent = 'Item name is required.'; return; }

  // Deduplicate: same name + same quantity already on list (unchecked)
  const normName = name.toLowerCase();
  const normQty  = qty.toLowerCase();
  const dup = items.find(i => !i.checked && i.name.toLowerCase() === normName && (i.quantity || '1').toLowerCase() === normQty);
  if (dup) {
    addError.textContent = `"${name}" ×${qty} is already on the list.`;
    return;
  }

  addError.textContent = '';
  addSubmitBtn.disabled = true;
  addSubmitBtn.innerHTML = '<span class="spinner"></span>';

  try {
    const item = await api('POST', `/api/lists/${listCode}/items/add`, {
      name, quantity: qty,
      price: price !== '' ? parseFloat(price) : undefined,
      notes, item_number: itemNum, category,
    });
    items.push(item);
    lastUpdatedAt = null;
    renderItems();
    updateSubtotal();
    updateClearCheckedBtn();
    closeAddForm();
  } catch (err) {
    addError.textContent = err.message;
  } finally {
    addSubmitBtn.disabled = false;
    addSubmitBtn.textContent = 'Add Item';
  }
}

// ── Share ──────────────────────────────────────────────────────────────────────
shareBtn.addEventListener('click', openShare);

function openShare() {
  if (navigator.share && /Mobi|Android/i.test(navigator.userAgent)) {
    navigator.share({ title: listData ? listData.name : 'Shop119', url: window.location.href }).catch(() => {});
  } else {
    shareOverlay.style.display = 'flex';
  }
}

function closeShare() { shareOverlay.style.display = 'none'; }
window.closeShare = closeShare;

window.copyText = function (type) {
  const text = type === 'code'
    ? document.getElementById('share-code-val').textContent
    : document.getElementById('share-url-val').textContent;
  navigator.clipboard.writeText(text).then(() => {
    setStatus('Copied!'); setTimeout(() => setStatus(''), 2000);
  }).catch(() => setStatus('Could not copy — please copy manually.'));
};

window.copyListFromShare = async function () {
  closeShare();
  try {
    const data = await api('POST', `/api/lists/${listCode}/copy`);
    const lists = JSON.parse(localStorage.getItem('shop119_mine') || '[]');
    lists.unshift({ code: data.code, name: data.name, createdAt: new Date().toISOString() });
    localStorage.setItem('shop119_mine', JSON.stringify(lists.slice(0, 20)));
    window.location.href = `/list/${data.code}`;
  } catch (err) {
    setStatus('Could not copy list: ' + err.message);
  }
};

window.archiveListFromShare = async function () {
  if (!confirm('Archive this list? It will no longer be accessible by code.')) return;
  closeShare();
  try {
    await api('PATCH', `/api/lists/${listCode}/archive`);
    const lists = JSON.parse(localStorage.getItem('shop119_mine') || '[]')
      .filter(l => l.code !== listCode);
    localStorage.setItem('shop119_mine', JSON.stringify(lists));
    window.location.href = '/';
  } catch (err) {
    setStatus('Could not archive list.');
  }
};

shareOverlay.addEventListener('click', e => { if (e.target === shareOverlay) closeShare(); });
