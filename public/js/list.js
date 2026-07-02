// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_ORDER = [
  'Produce','Bakery','Deli','Meat & Seafood','Dairy',
  'Frozen','Pantry & Snacks','Beverages','Paper & Cleaning',
  'Health & Beauty','Baby & Kids','Pet Supplies',
  'Electronics','Appliances','Clothing','Home & Garden',
  'Toys & Games','Office & School','Sporting Goods & Outdoors',
  'Seasonal & Party','Auto','Other'
];

// ── Category auto-detection ────────────────────────────────────────────────────
// Keyword/brand coverage modeled on typical Walmart/Target/Costco department
// and product taxonomies. Category-specific brand names are included where a
// brand reliably implies one department (e.g. "Tide" -> cleaning); multi-category
// store brands (Kirkland Signature, Great Value, Good & Gather, etc.) are
// intentionally omitted since they span every department and would misfire.
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
    [/baby\s*wipes?|wipes?\s*baby/, 'Baby & Kids'],
    [/printer\s*paper|copy\s*paper/, 'Office & School'],
    [/birthday\s*candles?|axe\s*(body|deodorant|spray)|shark\s*(vacuum|steam|navigator|robot)/, 'multi-disambiguate'],

    // Single-word — ordered so ambiguous words resolve correctly
    // Produce
    [/\bapples?\b|\boranges?\b|\bbananas?\b|\bgrapes?\b|strawberr|blueberr|raspberr|blackberr|cranberr|avocados?\b|tomatos?\b|tomatoes|lettuce|spinach|arugula|\bkale\b|broccoli|cauliflower|carrots?\b|celery|\bonions?\b|\bgarlic\b|\bpeppers?\b|mushrooms?\b|cucumber|zucchini|squash|\bcorn\b|lemons?\b|limes?\b|mangos?\b|mangoes|pineapple|watermelon|\bmelons?\b|\bberries\b|\bberrys?\b|salad|greens|vegetable|veggie|\bfruit\b|cilantro|\bbasil\b|parsley|asparagus|artichoke|\bpeas?\b|edamame\b|scallion|ginger|beet|radish|turnip|\byams?\b|sweet\s*potato|\bpotato(es)?\b|butternut|cabbage|bok\s*choy|brussel|sprout|fennel|leek|shallot|\bfigs?\b|peach|plum|apricot|cherry|cherries|nectarine|pomegranate|papaya|guava|passion|\bkiwis?\b|jicama|\bokra\b|eggplant|parsnip|\bchives?\b|\bdill\b|\bmint\b|rosemary|\bthyme\b|oregano|\bsage\b|microgreens?|\bdates?\b|\bcoconuts?\b/, 'Produce'],
    // Bakery
    [/\bbreads?\b|bagels?\b|muffins?\b|croissants?\b|\bcakes?\b|\bpies?\b|pastry|pastries|cookies?\b|brownies?\b|\brolls?\b|\bbuns?\b|tortillas?\b|pita|sourdough|brioche|donuts?\b|danish|baguette|pretzel\s*bread|flatbread|lavash|naan|challah|focaccia|scone|biscuit|cornbread|sara\s*lee|thomas'?s?\s*(bagel|english\s*muffin)?|dave'?s\s*killer\s*bread|king'?s\s*hawaiian|nature'?s\s*own|wonder\s*bread|entenmann'?s|hostess|pillsbury|little\s*debbie/, 'Bakery'],
    // Deli — word-bounded to avoid "shampoo" matching ham
    [/\bhams?\b|salami|pepperoni|prosciutto|pastrami|hummus|\bdeli\b|manchego|charcuterie|mortadella|chorizo|coppa|bresaola|genoa|capicola|pancetta|\bbrie\b|camembert|gouda|gruyere|manchego|havarti|provolone|muenster|boar'?s\s*head|oscar\s*mayer|hormel|applegate|land\s*o'?\s*frost|dietz\s*(&|and)\s*watson/, 'Deli'],
    // Meat & Seafood
    [/\bbeef\b|steaks?\b|\bpork\b|pork\s*chop|\blamb\b|sausages?\b|bacons?\b|chick[eo]ns?\b|chikins?\b|chikens?\b|brisket|short\s*rib|\bribs?\b|salmon|salman|samon|\btunas?\b|shrimps?\b|shrimp|tilapia|\bcod\b|halibut|\bcrabs?\b|lobster|seafood|scallops?\b|oysters?\b|clams?\b|\bmeats?\b|\bwings?\b|drumstick|turkeys?\b|\bfishs?\b|\bfish\b|ground|flank|sirloin|tenderloin|chuck|brisket|mahi|trout|sardine|anchov|sword|bass|perch|pike|herring|calamari|squid|mussel|prawn|langostino|venison|bison|elk|duck|quail|veal|oxtail|osso|\btyson\b|\bperdue\b|foster\s*farms|butterball|johnsonville|jimmy\s*dean|smithfield|omaha\s*steaks/, 'Meat & Seafood'],
    // Dairy
    [/\bmilks?\b|\bbutter\b|\bcream\b|yogurts?\b|greek\s*yogurt|\beggs?\b|kefir|\bghee\b|lactose|cheeses?\b|cheddar|mozzarella|parmesan|feta|colby|ricotta|cottage\s*cheese|cream\s*cheese|swiss\s*cheese|string\s*cheese|whipped\s*cream|half\s*and\s*half|heavy\s*cream|whipping\s*cream|dairy|chobani|yoplait|\bdannon\b|\bfage\b|land\s*o'?\s*lakes|horizon\s*organic|\bsilk\b|\boatly\b|philadelphia\s*cream|sargento|tillamook|activia|borden|breakstone/, 'Dairy'],
    // Frozen
    [/frozen|\bpizza\b|pizzas?\b|burritos?\b|nuggets?\b|waffles?\b|pot\s*pie|edamame|dumplings?\b|gyoza|wontons?\b|eggroll|spring\s*roll|lasagna|enchilada|tamale|empanada|taquito|chimichanga|fish\s*stick|tater\s*tot|hash\s*brown|corn\s*dog|ben\s*(&|and)\s*jerry'?s|ha?agen[\s-]?dazs|digiorno|red\s*baron|totino'?s|hot\s*pockets|stouffer'?s|lean\s*cuisine|marie\s*callender'?s|birds\s*eye|\beggo\b|van\s*de\s*kamp'?s|gorton'?s|amy'?s\s*(kitchen)?|breyers|talenti|blue\s*bell|edy'?s/, 'Frozen'],
    // Pantry & Snacks
    [/\boil\b|\brice\b|\bpasta\b|noodles?\b|ramen|udon|soba|orzo|\bsauce\b|sauces|\bsoups?\b|\bbroth\b|\bstock\b|canned|beans|lentils?|chickpeas?|\bflour\b|sugars?|\bsalt\b|spices?|seasonings?|ketchup|mustard|\bmayo\b|mayonnaise|dressing|vinegar|syrups?|honey|jams?\b|jelly|jellies|\bcereal\b|oatmeal|granola|chips?\b|crackers?\b|pretzels?\b|popcorn|almonds?|cashews?|walnuts?|pecans?|pistachios?|peanuts?|macadamia|chocolates?|candies?\b|candy|snacks?\b|olives?|pickles?|relish|salsa|guacamole|hummus|tahini|miso|soy\s*sauce|teriyaki|hoisin|sriracha|tabasco|worcestershire|bouillon|coconut\s*milk|tomato\s*paste|tomato\s*sauce|marinara|alfredo|pesto|balsamic|maple\s*syrup|agave|stevia|splenda|protein\s*powder|collagen\s*powder|chia|flaxseed|quinoa|farro|barley|lentil|split\s*pea|lay'?s|doritos|cheetos|ruffles|pringles|tostitos|fritos|goldfish\s*crackers?|cheez[\s-]?its?|\britz\b|triscuits?|wheat\s*thins?|\boreos?\b|chips\s*ahoy|nutter\s*butter|kellogg'?s|cheerios|frosted\s*flakes|cap'?n\s*crunch|lucky\s*charms?|nature\s*valley|clif\s*bar|kind\s*bar|quest\s*bar|barilla|ronzoni|mac\s*(and|&)\s*cheese|campbell'?s|progresso|chef\s*boyardee|hunt'?s|heinz|french'?s|nutella|skippy|\bjif\b|smucker'?s|m&ms?\b|hershey'?s|reese'?s|snickers|kit\s*kat|\btwix\b|ferrero\s*rocher|pop[\s-]?tarts?|rice\s*krispies|cracker\s*jack|\bcombos\b|slim\s*jim|beef\s*jerky|\bjerky\b/, 'Pantry & Snacks'],
    // Beverages
    [/\bwaters?\b|juices?\b|\bsoda\b|sodas|coffees?\b|espresso|\bteas?\b|\bwines?\b|\bbeers?\b|sparkling|kombucha|lemonade|gatorade|bodyarmor|creamer|electrolyte|beverages?|drinks?\b|smoothie|protein\s*shake|collagen\s*drink|coconut\s*water|aloe\s*drink|matcha|cider|sake|whiskey|bourbon|vodka|rum|tequila|gin|liquor|spirits?|champagne|prosecco|sangria|coca[\s-]?cola|\bcoke\b|\bpepsi\b|\bsprite\b|dr\.?\s*pepper|mountain\s*dew|\bfanta\b|powerade|red\s*bull|monster\s*energy|\bcelsius\b|starbucks|folgers|maxwell\s*house|\blipton\b|snapple|poland\s*spring|\bdasani\b|aquafina|la\s*croix|lacroix|perrier|san\s*pellegrino|simply\s*orange|tropicana|minute\s*maid|ocean\s*spray|capri\s*sun|kool[\s-]?aid/, 'Beverages'],
    // Paper & Cleaning
    [/laundry|detergents?\b|dishwasher|\bwipes?\b|sponges?\b|bleach|cleaning|cleaners?|\btide\b|downy|\bbounce\b|dryer|aluminum\s*foil|\bfoils?\b|ziplock|ziploc|tissues?\b|napkins?\b|lysol|clorox|febreze|fabuloso|pine\s*sol|comet|ajax|method|seventh\s*generation|mr\s*clean|dawn\s*dish|palmolive|cascade|finish\s*dish|affresh|rug\s*cleaner|floor\s*cleaner|toilet\s*bowl|bathroom\s*cleaner|kitchen\s*cleaner|all\s*purpose|disinfect|antibacterial|hand\s*soap|bar\s*soap|\bbounty\b|charmin|kleenex|cottonelle|\bpuffs\b|\bhefty\b|\bglad\b|windex|swiffer|arm\s*(&|and)\s*hammer|oxiclean|oxi\s*clean/, 'Paper & Cleaning'],
    // Health & Beauty
    [/vitamins?\b|supplements?\b|\bmedicines?\b|shampoos?\b|conditioners?\b|lotion|sunscreen|toothpaste|toothbrush|\brazors?\b|deodorant|ibuprofen|tylenol|\badvil\b|aleve|aspirin|allerg|melatonin|collagen|moisturizer|\bfloss\b|mouthwash|listerine|contacts|eye\s*drops|band[\s-]?aids?|bandage|antiseptic|neosporin|thermometer|blood\s*pressure|glucosamine|probiotic|omega|zinc|magnesium|calcium|vitamin\s*[a-z]|multivitamin|prenatal|biotin|turmeric|elderberry|echinacea|melatonin|fiber|stool|laxative|antacid|pepto|tums|gas\s*x|zyrtec|claritin|flonase|sudafed|nyquil|dayquil|mucinex|robitussin|cough|cold\s*medicine|pain\s*reliever|nail\s*clipper|tweezer|curling|flat\s*iron|hair\s*dryer|hair\s*color|mascara|lipstick|foundation|concealer|eyeliner|blush|bronzer|primer|setting\s*spray|makeup|perfume|cologne|body\s*spray|aftershave|electric\s*razor|nail\s*polish|cotton\s*ball|q\s*tips?|feminine|tampon|pad\s*feminine|condom|pregnancy|test\s*kit|neutrogena|cetaphil|cerave|aveeno|\bolay\b|nivea|colgate|\bcrest\b|oral[\s-]?b|gillette|schick|old\s*spice|head\s*(&|and)\s*shoulders|pantene|herbal\s*essences?|l'?oreal|maybelline|revlon/, 'Health & Beauty'],
    // Baby & Kids
    [/diapers?\b|baby\s*wipes?|wipes?\s*baby|\bformula\b|baby\s*food|pacifiers?\b|onesies?\b|\bstrollers?\b|car\s*seat|baby\s*monitor|\bbassinets?\b|\bcribs?\b|high\s*chair|teether|teething|\bbibs?\b|sippy\s*cup|playpen|baby\s*gate|pampers|huggies|\bluvs\b|enfamil|similac|\bgerber\b|baby\s*lotion|baby\s*shampoo|baby\s*wash|diaper\s*rash|baby\s*powder|baby\s*oil|nursing\s*pad|breast\s*pump/, 'Baby & Kids'],
    // Pet Supplies
    [/dog\s*food|cat\s*food|\bkibble\b|pet\s*treats?|cat\s*litter|litter\s*box|dog\s*leash|\bleash\b|dog\s*collar|cat\s*collar|dog\s*toys?|cat\s*toys?|fish\s*tank|\baquarium\b|\bpurina\b|pedigree|blue\s*buffalo|\biams\b|friskies|fancy\s*feast|whiskas|milk[\s-]?bone|greenies|\bkong\b|dog\s*bed|pet\s*bed|flea\s*(treatment|collar|medicine)?|tick\s*treatment|dog\s*treats?|cat\s*treats?|hairball|pet\s*shampoo|chew\s*toy/, 'Pet Supplies'],
    // Electronics
    [/\btv\b|televisions?\b|laptops?\b|computers?\b|tablets?\b|\bipad\b|\biphone\b|\bphone\b|chargers?\b|cables?\b|headphones?\b|earphones?\b|earbuds?\b|speakers?\b|cameras?\b|printers?\b|monitors?\b|keyboards?\b|\bmouse\b|mice|batteries?\b|alexa|\becho\b|smart\s*home|router|modem|surge\s*protector|extension\s*cord|hdmi|usb|flash\s*drive|hard\s*drive|ssd|memory\s*card|sd\s*card|webcam|microphone|gaming|controller|playstation|xbox|nintendo|switch|airpods?|beats|bose|sonos|ring\s*doorbell|nest|smart\s*bulb|smart\s*plug|solar\s*panel|power\s*bank|wireless|macbook|apple\s*watch|apple\s*tv|\bimac\b|samsung|\bsony\b|\broku\b|\bjbl\b|chromebook|google\s*home|fire\s*stick|firestick/, 'Electronics'],
    // Appliances
    [/blenders?\b|mixers?\b|toasters?\b|microwaves?\b|vacuums?\b|\bfans?\b|juicers?\b|dehumidifier|air\s*purifier|humidifier|space\s*heater|electric\s*kettle|panini|griddle|grill|smoker|pressure\s*cooker|sous\s*vide|mandoline|salad\s*spinner|can\s*opener|wine\s*opener|corkscrew|dishwasher|washing\s*machine|dryer\s*machine|refrigerator|freezer|chest\s*freezer|kitchenaid|\bninja\b|cuisinart|\bkeurig\b|nespresso|vitamix|crock[\s-]?pot|\bdyson\b|roomba|irobot|hamilton\s*beach|black\s*\+?\s*decker|george\s*foreman/, 'Appliances'],
    // Clothing
    [/\bshirts?\b|\bpants?\b|\bshorts?\b|\bdresses?\b|jackets?\b|\bcoats?\b|sweaters?\b|hoodies?\b|\bsocks?\b|underwear|\bbras?\b|leggings?\b|\bjeans?\b|skirts?\b|\bvests?\b|\bshoes?\b|\bboots?\b|sneakers?\b|sandals?\b|\bhats?\b|gloves?\b|clothing|apparel|tights|stockings|pajamas|pjs|swimsuit|bikini|board\s*shorts|rash\s*guard|sports\s*bra|athletic|workout|running\s*shoe|slippers?|flip\s*flops?|loafers?|oxfords?|heels?|pumps?|wedges?|moccasins?|crocs?|ugg|north\s*face|columbia|patagonia|carhartt|polo|khaki|chino|cargo\s*pants|trousers?|blazer|suit\s*jacket|cardigan|pullover|turtleneck|tank\s*top|crop\s*top|romper|jumpsuit|overalls?|parka|windbreaker|rain\s*jacket|fleece|thermal|base\s*layer|robe|scarf|beanie|cap|visor|belt|wallet|\bnike\b|adidas|under\s*armour|levi'?s|\bhanes\b|fruit\s*of\s*the\s*loom/, 'Clothing'],
    // Home & Garden
    [/furniture|\btables?\b|\bchairs?\b|\bshelves?\b|shelving|storage|organizer|\bbins?\b|baskets?\b|\btowels?\b|bedsheets?|\bsheets?\b|pillows?\b|blankets?\b|comforters?\b|mattress|mattresses|\bplants?\b|garden|\bhose\b|light\s*bulb|\bbulbs?\b|\blamps?\b|candles?\b|\brugs?\b|curtains?\b|\bpots?\b|\bpans?\b|cookware|bakeware|frying\s*pan|cast\s*iron|dutch\s*oven|baking\s*sheet|muffin\s*tin|cutting\s*board|knife|knives|spatula|ladle|whisk|tongs|colander|strainer|mixing\s*bowl|measuring\s*cup|glass\s*container|storage\s*container|tupperware|zip\s*lock|reusable\s*bag|trash\s*can|hamper|laundry\s*basket|shower\s*curtain|bath\s*mat|bath\s*rug|toilet\s*seat|plunger|toilet\s*brush|picture\s*frame|\bframes?\b|mirror|clock|vase|artificial\s*flower|fake\s*plant|succulent|patio|outdoor\s*furniture|umbrella\s*patio|fire\s*pit|lawn\s*mower|weed\s*eater|leaf\s*blower|pressure\s*washer|garden\s*tool|shovel|rake|hoe|wheelbarrow|planter|potting\s*soil|fertilizer|mulch|bird\s*feeder|stepping\s*stone|string\s*light/, 'Home & Garden'],
    // Toys & Games
    [/\btoys?\b|\blego\b|barbie|hot\s*wheels|action\s*figure|board\s*game|jigsaw\s*puzzle|\bpuzzles?\b|\bnerf\b|play[\s-]?doh|stuffed\s*animal|\bplush\b|\bdolls?\b|rc\s*car|remote\s*control\s*car|video\s*games?\b|card\s*game|building\s*blocks?|\bplayset\b|dollhouse|\buno\b|monopoly|\bjenga\b/, 'Toys & Games'],
    // Office & School
    [/\bpens?\b|\bpencils?\b|notebooks?\b|\bbinders?\b|\bfolders?\b|\bstaplers?\b|printer\s*paper|copy\s*paper|sticky\s*notes?|post[\s-]?it|highlighters?\b|\bmarkers?\b|crayons?\b|\bbackpacks?\b|\bscissors?\b|tape\s*dispenser|scotch\s*tape|glue\s*stick|\bglue\b|envelopes?\b|calculator|index\s*cards?|\bplanner\b|whiteboard|dry\s*erase/, 'Office & School'],
    // Sporting Goods & Outdoors
    [/basketballs?\b|footballs?\b|soccer\s*ball|baseballs?\b|tennis\s*racket|golf\s*(club|ball)s?|yoga\s*mat|dumbbells?\b|resistance\s*band|camping\s*tent|\btents?\b|sleeping\s*bag|\bcoolers?\b|fishing\s*rod|fishing\s*reel|bike\s*helmet|bicycles?\b|\bbikes?\b|skateboard|\bkayaks?\b|life\s*jacket|hiking\s*(boots|pack|backpack)|treadmill|exercise\s*bike|kettlebell|jump\s*rope/, 'Sporting Goods & Outdoors'],
    // Seasonal & Party
    [/christmas\s*tree|ornaments?\b|wrapping\s*paper|gift\s*wrap|gift\s*bags?\b|greeting\s*cards?\b|\bballoons?\b|party\s*favor|halloween\s*costumes?|\bcostumes?\b|easter\s*egg|egg\s*dye|valentine'?s?\s*card|\bfireworks?\b|\bconfetti\b|streamers?\b|party\s*hat|pi[nñ]ata|\btinsel\b/, 'Seasonal & Party'],
    // Auto
    [/\btires?\b|wipers?\b|windshield|floor\s*mat|automotive|oil\s*change|brake|coolant|antifreeze|transmission|car\s*battery|jumper\s*cable|air\s*compressor|tire\s*inflator|car\s*cover|seat\s*cover|steering\s*wheel\s*cover|car\s*freshener|rain\s*x|wd\s*40|wd40/, 'Auto'],
  ];

  for (const [rx, cat] of rules) {
    if (cat === 'multi' || cat === 'multi-meat' || cat === 'multi-disambiguate') {
      if (rx.test(s)) {
        if (cat === 'multi-meat') return 'Meat & Seafood';
        if (cat === 'multi') return 'Pantry & Snacks';
        // multi-disambiguate: figure out which specific phrase matched
        if (/birthday\s*candles?/.test(s)) return 'Seasonal & Party';
        if (/axe\s*(body|deodorant|spray)/.test(s)) return 'Health & Beauty';
        if (/shark\s*(vacuum|steam|navigator|robot)/.test(s)) return 'Appliances';
      }
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
let isDragging = false;

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
const overflowBtn     = document.getElementById('overflow-btn');
const overflowDropdown = document.getElementById('overflow-dropdown');
const overflowClearBtn    = document.getElementById('overflow-clear-btn');
const overflowSelectBtn   = document.getElementById('overflow-select-btn');
const overflowShareBtn    = document.getElementById('overflow-share-btn');
const overflowStaplesBtn  = document.getElementById('overflow-staples-btn');
const loadStaplesBtn      = document.getElementById('load-staples-btn');

// ── Toast notifications ────────────────────────────────────────────────────────
function showToast(msg, type = 'info', duration = 3000) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, duration);
}

// ── Staples helpers ────────────────────────────────────────────────────────────
function getStaples() { try { return JSON.parse(localStorage.getItem('shop119_staples') || '[]'); } catch { return []; } }
function isStaple(name) { return getStaples().some(s => s.name.toLowerCase() === name.toLowerCase()); }

function toggleStaple(item) {
  let staples = getStaples();
  const idx = staples.findIndex(s => s.name.toLowerCase() === item.name.toLowerCase());
  if (idx >= 0) {
    staples.splice(idx, 1);
    showToast(`${item.name} removed from staples`, 'info', 2000);
  } else {
    staples.unshift({ name: item.name, category: item.category || 'Other', quantity: item.quantity || '1', notes: item.notes || '', item_number: item.item_number || '' });
    showToast(`${item.name} saved to staples ★`, 'success', 2000);
  }
  localStorage.setItem('shop119_staples', JSON.stringify(staples.slice(0, 50)));
  renderItems();
}

async function loadStaplesToList() {
  const staples = getStaples();
  if (!staples.length) { showToast('No staples yet. Tap ★ on items to save them.', 'info', 3000); return; }
  const existing = new Set(items.filter(i => !i.checked).map(i => i.name.toLowerCase()));
  const toAdd = staples.filter(s => !existing.has(s.name.toLowerCase()));
  if (!toAdd.length) { showToast('All your staples are already on this list.', 'info', 2500); return; }
  showToast(`Adding ${toAdd.length} staple${toAdd.length !== 1 ? 's' : ''}…`, 'info', 2000);
  const results = await Promise.allSettled(
    toAdd.map(s => api('POST', `/api/lists/${listCode}/items/add`, { name: s.name, quantity: s.quantity, notes: s.notes, item_number: s.item_number, category: s.category }))
  );
  const added = results.filter(r => r.status === 'fulfilled').map(r => r.value);
  items.push(...added);
  lastUpdatedAt = null;
  renderItems();
  updateSubtotal();
  updateClearCheckedBtn();
  showToast(`${added.length} staple${added.length !== 1 ? 's' : ''} added`, 'success', 2500);
}

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

// ── Overflow menu (small screens) ─────────────────────────────────────────────
if (overflowBtn) {
  overflowBtn.addEventListener('click', e => {
    e.stopPropagation();
    overflowDropdown.classList.toggle('open');
  });
  document.addEventListener('click', () => overflowDropdown.classList.remove('open'));
  if (overflowShareBtn)   overflowShareBtn.addEventListener('click',   () => { overflowDropdown.classList.remove('open'); openShare(); });
  if (overflowClearBtn)   overflowClearBtn.addEventListener('click',   () => { overflowDropdown.classList.remove('open'); clearCheckedBtn.click(); });
  if (overflowSelectBtn)  overflowSelectBtn.addEventListener('click',  () => { overflowDropdown.classList.remove('open'); enterSelectMode(); });
  if (overflowStaplesBtn) overflowStaplesBtn.addEventListener('click', () => { overflowDropdown.classList.remove('open'); loadStaplesToList(); });
}

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
  if (!initial && isDragging) return; // don't yank the list out from under an active drag
  try {
    const data = await api('GET', `/api/lists/${listCode}`);
    if (!initial && isDragging) return; // a drag may have started while this request was in flight
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
  if (overflowBtn) overflowBtn.style.display = '';
  // Show staples buttons if user has staples saved
  const hasStaples = getStaples().length > 0;
  if (loadStaplesBtn) loadStaplesBtn.style.display = hasStaples ? 'inline-flex' : 'none';
  if (overflowStaplesBtn) overflowStaplesBtn.style.display = hasStaples ? '' : 'none';
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

function setStatus(msg) { if (msg) showToast(msg); }

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
  if (overflowClearBtn) overflowClearBtn.style.display = hasChecked ? '' : 'none';
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
  div.dataset.section = item.checked ? '__checked__' : (CATEGORY_ORDER.includes(item.category) ? item.category : 'Other');

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

    const starBtn = document.createElement('button');
    starBtn.className = `star-btn${isStaple(item.name) ? ' starred' : ''}`;
    starBtn.title = isStaple(item.name) ? 'Remove from staples' : 'Save to staples';
    starBtn.textContent = isStaple(item.name) ? '★' : '☆';
    starBtn.addEventListener('click', e => { e.stopPropagation(); toggleStaple(item); });

    const dragHandle = document.createElement('div');
    dragHandle.className = 'drag-handle';
    dragHandle.title = 'Drag to reorder';

    actions.append(starBtn, editBtn, delBtn, dragHandle);
    div.appendChild(actions);

    attachDragHandle(dragHandle, div);
  }

  // Swipe gestures (touch only, not in select mode)
  if (!selectMode) {
    const hintRight = document.createElement('div');
    hintRight.className = 'item-swipe-hint-right';
    hintRight.textContent = '✓';
    const hintLeft = document.createElement('div');
    hintLeft.className = 'item-swipe-hint-left';
    hintLeft.textContent = '🗑';
    div.prepend(hintRight);
    div.appendChild(hintLeft);

    let swipeStartX, swipeStartY, isSwiping = false;
    div.addEventListener('touchstart', e => {
      if (e.target.closest('.drag-handle')) return; // let the drag handle own this touch
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
      isSwiping = false;
    }, { passive: true });
    div.addEventListener('touchmove', e => {
      const dx = e.touches[0].clientX - swipeStartX;
      const dy = e.touches[0].clientY - swipeStartY;
      if (!isSwiping && Math.abs(dy) > Math.abs(dx)) return;
      isSwiping = true;
      const clamped = Math.max(-90, Math.min(90, dx));
      div.style.transform = `translateX(${clamped}px)`;
      div.style.transition = 'none';
      div.classList.toggle('swipe-right', dx > 30);
      div.classList.toggle('swipe-left', dx < -30);
    }, { passive: true });
    div.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - swipeStartX;
      div.style.transition = 'transform 0.25s';
      div.style.transform = '';
      div.classList.remove('swipe-right', 'swipe-left');
      if (!isSwiping) return;
      if (dx > 65) toggleCheck(item);
      else if (dx < -75) deleteItem(item, div);
    });
  }

  return div;
}

// ── Drag-and-drop reorder (mouse + touch + pen via Pointer Events) ──────────────
// Unchecked items can be dragged across category sections (recategorizing them);
// checked items ("✓ In the cart") only reorder within that section — checking
// items on/off stays a swipe/tap action, not a drag action.
function attachDragHandle(handleEl, cardEl) {
  let drag = null;

  handleEl.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();

    const startCategory = cardEl.dataset.section;
    const pool = Array.from(itemsContainer.querySelectorAll('.item-card'))
      .filter(el => startCategory === '__checked__'
        ? el.dataset.section === '__checked__'
        : el.dataset.section !== '__checked__');
    const startIndex = pool.indexOf(cardEl);
    if (startIndex === -1 || pool.length < 2) return;

    const poolRects = pool.map(el => el.getBoundingClientRect());
    const gap = parseFloat(getComputedStyle(itemsContainer).rowGap) || 10;
    const step = cardEl.getBoundingClientRect().height + gap;

    drag = {
      pool, poolRects, startIndex, step, startCategory,
      currentIndex: startIndex,
      targetCategory: startCategory,
      startY: e.clientY,
    };

    isDragging = true;
    cardEl.classList.add('dragging');
    handleEl.setPointerCapture(e.pointerId);
  });

  handleEl.addEventListener('pointermove', e => {
    if (!drag) return;
    const { pool, poolRects, startIndex, step } = drag;
    const minDelta = poolRects[0].top - poolRects[startIndex].top;
    const maxDelta = poolRects[poolRects.length - 1].top - poolRects[startIndex].top;
    const deltaY = Math.max(minDelta, Math.min(maxDelta, e.clientY - drag.startY));
    cardEl.style.transform = `translateY(${deltaY}px)`;

    // Closest-original-slot matching (not a uniform step) so category-header
    // gaps between sections don't throw off the target index.
    const currentCenter = poolRects[startIndex].top + deltaY + poolRects[startIndex].height / 2;
    let newIndex = startIndex;
    let minDist = Infinity;
    poolRects.forEach((r, i) => {
      const dist = Math.abs(currentCenter - (r.top + r.height / 2));
      if (dist < minDist) { minDist = dist; newIndex = i; }
    });

    if (newIndex !== drag.currentIndex) {
      drag.currentIndex = newIndex;
      // Whichever original slot we're now closest to determines the target category —
      // unambiguous even when the two neighboring slots belong to different categories.
      drag.targetCategory = pool[newIndex].dataset.section;
      pool.forEach((el, i) => {
        if (el === cardEl) return;
        let shift = 0;
        if (startIndex < newIndex && i > startIndex && i <= newIndex) shift = -step;
        else if (startIndex > newIndex && i >= newIndex && i < startIndex) shift = step;
        el.style.transition = 'transform 0.15s';
        el.style.transform = shift ? `translateY(${shift}px)` : '';
      });
    }
  });

  handleEl.addEventListener('pointerup', e => finishDrag(e));
  handleEl.addEventListener('pointercancel', e => finishDrag(e, true));

  function finishDrag(e, cancelled) {
    if (!drag) return;
    const { pool, startIndex, currentIndex, startCategory, targetCategory } = drag;
    try { handleEl.releasePointerCapture(e.pointerId); } catch {}
    cardEl.classList.remove('dragging');
    cardEl.style.transition = '';
    cardEl.style.transform = '';
    pool.forEach(el => { el.style.transition = ''; el.style.transform = ''; });

    if (!cancelled && currentIndex !== startIndex) {
      const finalOrder = pool.slice();
      finalOrder.splice(startIndex, 1);
      finalOrder.splice(currentIndex, 0, cardEl);
      persistReorder(finalOrder, cardEl.dataset.itemId, targetCategory, startCategory); // clears isDragging once the save settles
    } else {
      isDragging = false;
    }
    drag = null;
  }
}

async function persistReorder(finalOrder, movedId, newCategory, oldCategory) {
  const changed = [];
  const categoryChanged = newCategory !== oldCategory;

  // Members of the new (or unchanged) category, in final drag order — includes the moved item.
  const newCatIds = finalOrder
    .filter(el => el.dataset.itemId === movedId || el.dataset.section === newCategory)
    .map(el => el.dataset.itemId);
  newCatIds.forEach((id, idx) => {
    const it = items.find(i => String(i.id) === String(id));
    if (!it) return;
    const isMoved = String(id) === String(movedId);
    const needsCategory = isMoved && categoryChanged;
    if (it.position !== idx || needsCategory) {
      it.position = idx;
      if (needsCategory) it.category = newCategory;
      changed.push({ id: it.id, position: idx, ...(needsCategory ? { category: newCategory } : {}) });
    }
  });

  // Old category's remaining members (only when the item actually switched category):
  // their relative order among themselves is unchanged, just renumbered to close the gap.
  if (categoryChanged) {
    const oldCatItems = items
      .filter(i => String(i.id) !== String(movedId) && !i.checked &&
        (CATEGORY_ORDER.includes(i.category) ? i.category : 'Other') === oldCategory)
      .sort((a, b) => a.position - b.position);
    oldCatItems.forEach((it, idx) => {
      if (it.position !== idx) { it.position = idx; changed.push({ id: it.id, position: idx }); }
    });
  }

  if (!changed.length) { isDragging = false; return; }
  renderItems();
  try {
    await api('POST', `/api/lists/${listCode}/items/reorder`, { items: changed });
    lastUpdatedAt = null;
  } catch {
    showToast('Could not save new order. Try again.', 'error');
    lastUpdatedAt = null;
    loadList(false);
  } finally {
    isDragging = false;
  }
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
  node.classList.add('item-exiting');
  await new Promise(r => setTimeout(r, 200));
  try {
    await api('DELETE', `/api/lists/${listCode}/items/delete`, { itemId: item.id });
    items = items.filter(i => i.id !== item.id);
    renderItems();
    updateSubtotal();
    updateClearCheckedBtn();
    lastUpdatedAt = null;
  } catch {
    node.classList.remove('item-exiting');
    showToast('Could not delete item. Try again.', 'error');
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

if (loadStaplesBtn) loadStaplesBtn.addEventListener('click', loadStaplesToList);

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
    // Animate the newly added item
    const newNode = itemsContainer.querySelector(`[data-item-id="${item.id}"]`);
    if (newNode) { newNode.classList.add('item-entering'); setTimeout(() => newNode.classList.remove('item-entering'), 300); }
    updateSubtotal();
    updateClearCheckedBtn();
    closeAddForm();
    showToast(`${item.name} added`, 'success', 1800);
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
    showToast('Copied!', 'success', 2000);
  }).catch(() => showToast('Could not copy — please copy manually.', 'error'));
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
