import type { Product } from "./categories";

/**
 * Forgiving, multilingual product search.
 *  1. "exact"   - every word of the query matches (name text, or a translated category word)
 *  2. "similar" - nothing exact: typo-tolerant / partial matches ranked by closeness
 *  3. "popular" - nothing close at all: popular finds (the search never comes back empty)
 */

export type SearchMode = "all" | "exact" | "similar" | "popular";
export interface SearchResult {
  items: Product[];
  mode: SearchMode;
}

/** lowercase, strip accents/diacritics, keep letters+numbers from any alphabet */
export function norm(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/ł/g, "l")
    .replace(/ø/g, "o")
    .replace(/đ/g, "d")
    .replace(/ı/g, "i")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** category -> words people use for it in many languages (English product-name keywords first) */
const WORDS: Record<string, string> = {
  Shoes:
    "shoe shoes sneaker sneakers trainer trainers footwear kicks boot boots slides slide sandals sandal loafers loafer runner runners | " +
    "tenis sapato sapatos calcado calcados chuteira bota botas sandalia sandalias chinelo chinelos sapatilha sapatilhas tenis esportivo | " +
    "zapatilla zapatillas zapato zapatos calzado deportivas deportivo botines | " +
    "chaussure chaussures baskets basket souliers bottes | schuhe schuh turnschuhe stiefel | scarpe scarpa scarpe da ginnastica stivali sneakers | " +
    "pantofi pantof adidasi adidas incaltaminte ghete papuci | buty but obuwie trampki adidasy | schoenen schoen laarzen gympen | " +
    "ayakkabi ayakkabilar spor ayakkabi bot | кроссовки кроссовок обувь ботинки кеды | boty tenisky | skor sko | " +
    "обувки маратонки | взуття кросівки | sepatu | giay | cipo cipok | παπούτσια | 鞋 运动鞋 球鞋 靴 | 靴 スニーカー | 신발 운동화 | حذاء احذية",
  Hoodies:
    "hoodie hoodies hoody sweatshirt sweatshirts pullover pullovers jumper sweater sweaters crewneck zip up hooded | " +
    "moletom moletons moleton blusa de frio casaco de moletom | sudadera sudaderas buzo buzos capucha jersey jerseis sueter | " +
    "sweat pull pulls sweat a capuche | kapuzenpullover pullover pulli pullis kapuzenjacke | felpa felpe maglione maglioni | " +
    "hanorac hanorace bluza bluze pulover | bluza bluzy bluza z kapturem | trui truien capuchontrui | kapsonlu kazak | " +
    "худи толстовка свитшот | mikina mikiny | hoodtroja troja | 卫衣 连帽衫 | パーカー スウェット | 후드 맨투맨 | هودي",
  Tees:
    "tee tees t shirt t shirts tshirt tshirts shirt shirts top tops polo polos jersey | camiseta camisetas camisa camisas remera playera polera blusa | " +
    "tee shirt chemise chemises maillot | hemd hemden oberteil | maglietta magliette t shirt camicia camicie | " +
    "tricou tricouri camasa camasi | koszulka koszulki koszula | overhemd | tisort tisortler gomlek gomlekler | " +
    "футболка футболки рубашка майка | tricko trika | skjorta | t恤 短袖 衬衫 上衣 | tシャツ シャツ | 티셔츠 셔츠 | قميص تيشيرت",
  Jackets:
    "jacket jackets coat coats puffer windbreaker parka parkas bomber vest vests outerwear down jacket gilet blazer anorak raincoat | " +
    "jaqueta jaquetas casaco casacos blusao blusoes colete coletes corta vento | chaqueta chaquetas abrigo abrigos cazadora chamarra chaleco chalecos plumas | " +
    "veste vestes manteau manteaux doudoune doudounes blouson | jacke jacken mantel mantelen daunenjacke weste westen | " +
    "giacca giacche giubbotto giubbotti cappotto cappotti piumino | geaca geci haina haine jacheta vesta veste | " +
    "kurtka kurtki plaszcz plaszcze kamizelka | jas jassen jack bodywarmer | ceket ceketler mont montlar kaban yelek | " +
    "куртка куртки пальто пуховик жилет ветровка | bunda bundy kabat | jacka jackor kappa | 夹克 外套 羽绒服 大衣 | ジャケット コート | 자켓 재킷 코트 | جاكيت معطف",
  Pants:
    "pants pant trousers jeans jean denim shorts short cargo cargos joggers jogger leggings sweatpants bottoms chinos | " +
    "calca calcas bermuda bermudas calcao calcoes | pantalon pantalones vaqueros pantalon corto | pantalons jean shorts | hose hosen kurze hose | " +
    "pantaloni pantalone pantaloncini | blugi pantaloni scurti sort | spodnie dzinsy szorty spodenki | broek broeken spijkerbroek | " +
    "pantolon kot sort | штаны брюки джинсы шорты | kalhoty rifle kratasy | byxor | 裤子 牛仔裤 短裤 长裤 | パンツ ズボン ジーンズ | 바지 청바지 | بنطلون",
  Tracksuits:
    "tracksuit tracksuits track suit sweatsuit sweat suit jogging suit set sets 2 piece two piece matching set | agasalho agasalhos conjunto conjuntos treino conjunto de moletom | " +
    "chandal chandals conjunto conjuntos | survetement survetements survet ensemble ensembles | trainingsanzug jogginganzug anzug | tuta tute completo | " +
    "trening treninguri | dres dresy komplet komplety | trainingspak joggingpak | esofman takim takimlar | спортивный костюм костюм | " +
    "soupravy teplakova souprava | traningsoverall | 运动套装 套装 | セットアップ ジャージ | 트레이닝 세트",
  Accessories:
    "accessory accessories jewelry jewellery necklace necklaces bracelet bracelets ring rings chain chains earrings earring wallet wallets scarf scarves gloves glove keychain pendant | " +
    "acessorio acessorios joia joias colar colares pulseira pulseiras anel aneis brinco brincos carteira carteiras cachecol luva luvas | " +
    "accesorio accesorios joyeria collar collares pulsera pulseras anillo anillos cartera billetera bufanda guantes | " +
    "accessoire accessoires bijou bijoux collier bracelet bague portefeuille echarpe gants | zubehor schmuck kette armband geldborse schal handschuhe | " +
    "accessori gioielli collana braccialetto anello portafoglio sciarpa guanti | accesorii bijuterii colier bratara inel portofel esarfa manusi | " +
    "akcesoria bizuteria naszyjnik bransoletka pierscionek portfel szalik rekawiczki | sieraden ketting portemonnee sjaal handschoenen | " +
    "aksesuar taki kolye bilezik yuzuk cuzdan atki eldiven | аксессуары украшения кошелек шарф перчатки цепочка | 配饰 项链 手链 钱包 围巾 | アクセサリー ネックレス 財布 | 악세사리 목걸이 지갑",
  Bags:
    "bag bags backpack backpacks handbag handbags purse purses tote duffel crossbody satchel luggage suitcase fanny pack shoulder bag messenger belt bag | " +
    "bolsa bolsas mochila mochilas mala malas pochete | bolso bolsos maleta bandolera rinonera | sac sacs sac a dos valise banane pochette | " +
    "tasche taschen rucksack handtasche koffer umhangetasche | borsa borse zaino valigia marsupio | geanta genti rucsac valiza | " +
    "torba torby plecak walizka torebka nerka | tas tassen rugzak koffer handtas | canta cantalar sirt cantasi valiz | сумка сумки рюкзак чемодан | " +
    "taska tasky batoh kufr | vaska vaskor ryggsack | 包 背包 手提包 钱包 | バッグ リュック | 가방 백팩",
  Caps:
    "cap caps hat hats snapback trucker baseball cap bucket hat visor fitted | bone bones chapeu chapeus viseira | gorra gorras sombrero sombreros | " +
    "casquette casquettes chapeau bob | kappe kappen basecap hut hute | cappello cappelli | sapca sepci palarie | czapka z daszkiem czapki z daszkiem kapelusz bejsbolowka | " +
    "pet petten hoed honkbalpet | sapka sapkalar sapka | кепка кепки шляпа бейсболка панама | ksiltovka klobouk | keps hatt | 帽子 棒球帽 鸭舌帽 | キャップ 帽子 | 모자 캡",
  Beanies:
    "beanie beanies bobble hat knit hat knitted hat winter hat ski hat skull cap wool hat toque | gorro gorros touca toucas | gorro gorros gorro de lana | bonnet bonnets | " +
    "mutze mutzen strickmutze | berretto berretti cuffia cappello di lana | caciula caciuli fes | czapka zimowa czapki zimowe | muts mutsen | bere bereler | " +
    "шапка шапки вязаная шапка | cepice ctepice | mossa | 毛线帽 针织帽 | ニット帽 ビーニー | 비니",
  Belts:
    "belt belts waistband | cinto cintos cinta cinturao | cinturon cinturones correa | ceinture ceintures | gurtel guertel hosengurtel | cintura cinture | " +
    "curea curele cordon | pasek paski | riem riemen gordel | kemer kemerler | ремень ремни пояс | opasek paska | balte | 腰带 皮带 | ベルト | 벨트",
  Glasses:
    "glasses sunglasses sunglass shades eyewear spectacles frames goggles | oculos oculos de sol oculos escuros | gafas gafas de sol lentes anteojos | " +
    "lunettes lunettes de soleil | brille brillen sonnenbrille | occhiali occhiali da sole | ochelari ochelari de soare | okulary okulary przeciwsloneczne | " +
    "bril brillen zonnebril | gozluk gozlukler gunes gozlugu | очки солнцезащитные очки | bryle slunecni bryle | glasogon solglasogon | 眼镜 太阳镜 墨镜 | サングラス メガネ | 선글라스 안경 | نظارة",
  Socks:
    "sock socks ankle socks crew socks stockings | meia meias meiao | calcetines calcetin medias | chaussettes chaussette | socken socke strumpfe | calze calzini calza | " +
    "sosete soset ciorapi | skarpetki skarpety skarpeta | sokken sok | corap coraplar | носки носок | ponozky | strumpor strumpa | 袜子 袜 | 靴下 ソックス | 양말 | جوارب",
  Boxers:
    "boxer boxers underwear briefs underpants trunks undies boxer shorts | cueca cuecas roupa intima | calzoncillos ropa interior slip | caleçon calecon calecons sous vetements | " +
    "unterhose unterhosen boxershorts unterwasche | mutande intimo | boxeri lenjerie intima chiloti | bokserki bielizna majtki | ondergoed onderbroek boxershort | ic camasiri kilot | " +
    "трусы нижнее белье боксеры | spodni pradlo boxerky | underklader kalsonger | 内裤 四角裤 | ボクサー 下着 | 속옷 팬티",
  Perfumes:
    "perfume perfumes fragrance fragrances cologne eau de parfum parfum scent edp edt aftershave | fragrancia colonia agua de colonia | fragancia | parfums eau de toilette | " +
    "parfum duft eau de parfum | profumo profumi fragranza | parfumuri apa de parfum fragranta | perfumy perfum zapach woda perfumowana | geur | koku esans | " +
    "духи парфюм аромат | parfem | parfym doft | 香水 | フレグランス | 향수 | عطر",
  Watches:
    "watch watches wristwatch timepiece smartwatch clock | relogio relogios | reloj relojes | montre montres | uhr uhren armbanduhr | orologio orologi | ceas ceasuri | " +
    "zegarek zegarki | horloge horloges | saat saatler kol saati | часы наручные часы | hodinky | klocka klockor armbandsur | 手表 腕表 表 | 腕時計 時計 | 시계 | ساعة",
};

interface Concept {
  cat: string;
  /** english keywords that also appear inside product names for this concept */
  name: string[];
}

const SINGLE = new Map<string, Concept>(); // single word (latin or cyrillic etc.) -> concept
const PHRASES: { text: string; c: Concept }[] = []; // multi-word phrases and CJK strings

function build() {
  for (const [cat, groups] of Object.entries(WORDS)) {
    const enGroup = groups.split("|")[0];
    const enWords = norm(enGroup).split(" ").filter((w) => w.length > 2);
    const c: Concept = { cat, name: [...new Set(enWords)] };
    for (const g of groups.split("|")) {
      // entries inside a group are separated by 2+ spaces? No: single words separated by space,
      // multi-word phrases are written with their words adjacent; we index every word and every adjacent pair.
      const words = norm(g).split(" ").filter(Boolean);
      for (const w of words) {
        // a lone word is a keyword for this category; skip filler words that would mean something else
        if (/^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]+$/u.test(w)) {
          PHRASES.push({ text: w, c });
        } else if (w.length > 1 && !STOP.has(w)) {
          if (!SINGLE.has(w)) SINGLE.set(w, c);
        }
      }
    }
  }
}
// words that appear inside phrases in the lists above but would be wrong as standalone concepts
const STOP = new Set(["de", "da", "do", "a", "z", "di", "la", "le", "les", "of", "up", "t", "s", "2", "piece", "two", "pack", "box", "eau", "sol", "del", "des", "con", "set", "sets", "top", "tops", "frames", "bob", "pull", "pulls", "slip", "ring", "rings", "chain", "chains", "sort", "bot", "but", "cap", "hat", "hats", "vest", "sok", "sac", "pet", "tas", "jas", "bil", "ceas", "uhr", "kot"]);
build();
// a few of the stop-listed words are real, unambiguous concept words in their own language: restore them
for (const [w, cat] of [
  ["cap", "Caps"],
  ["caps", "Caps"],
  ["hat", "Caps"],
  ["hats", "Caps"],
  ["vest", "Jackets"],
  ["ring", "Accessories"],
  ["rings", "Accessories"],
  ["chain", "Accessories"],
  ["chains", "Accessories"],
  ["pull", "Hoodies"],
  ["sac", "Bags"],
  ["tas", "Bags"],
  ["jas", "Jackets"],
  ["pet", "Caps"],
  ["uhr", "Watches"],
  ["ceas", "Watches"],
  ["sok", "Socks"],
  ["bot", "Shoes"],
  ["but", "Shoes"],
] as [string, string][]) {
  const c = SINGLE.get(w) ?? { cat, name: [] };
  SINGLE.set(w, { ...c, cat });
}

function plural(w: string): string[] {
  const out = [w];
  if (w.length > 3 && w.endsWith("s")) out.push(w.slice(0, -1));
  if (w.length > 4 && w.endsWith("es")) out.push(w.slice(0, -2));
  return out;
}

/** which category concepts does this query mention? */
function concepts(q: string, tokens: string[]): { concepts: Concept[]; rest: string[] } {
  const found = new Map<string, Concept>();
  const used = new Set<string>();
  for (const p of PHRASES) if (q.includes(p.text)) found.set(p.c.cat, p.c);
  for (const t of tokens) {
    for (const v of plural(t)) {
      const c = SINGLE.get(v);
      if (c) {
        found.set(c.cat, c);
        used.add(t);
        break;
      }
    }
  }
  return { concepts: [...found.values()], rest: tokens.filter((t) => !used.has(t)) };
}

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      cur.push(v);
      if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

interface Indexed {
  p: Product;
  text: string;
  words: string[];
}
let indexCache: { src: Product[]; idx: Indexed[] } | null = null;
function index(list: Product[]): Indexed[] {
  if (indexCache && indexCache.src === list) return indexCache.idx;
  const idx = list.map((p) => {
    const text = norm(p.name);
    return { p, text, words: text.split(" ").filter(Boolean) };
  });
  indexCache = { src: list, idx };
  return idx;
}

/** score how well a single query word matches a product name (0 = not at all) */
function wordScore(t: string, it: Indexed): number {
  if (it.text.includes(t)) return 1;
  if (t.length < 3) return 0;
  const max = t.length >= 8 ? 2 : t.length >= 4 ? 1 : 0;
  let best = 0;
  for (const w of it.words) {
    if (w.length >= 3 && (w.startsWith(t) || (t.length >= 4 && t.startsWith(w)))) best = Math.max(best, 0.75);
    if (max && Math.abs(w.length - t.length) <= max) {
      const d = lev(t, w, max);
      if (d <= max) best = Math.max(best, d === 1 ? 0.7 : 0.55);
    }
  }
  return best;
}

function hasWord(it: Indexed, k: string): boolean {
  return it.words.includes(k) || it.words.includes(k + "s");
}

function popularFirst(a: Product, b: Product) {
  return Number(!!b.popular) - Number(!!a.popular);
}

export function searchCatalog(list: Product[], query: string, category = ""): SearchResult {
  const scoped = category ? list.filter((p) => p.category === category) : list;
  const q = norm(query);
  if (!q) return { items: scoped, mode: "all" };

  const tokens = q.split(" ").filter(Boolean);
  const { concepts: cs, rest } = concepts(q, tokens);
  const idx = index(scoped);
  const cats = new Set(cs.map((c) => c.cat));

  // 1. exact: every plain word is in the name; a translated category word matches the category (or its keyword)
  const exact: Indexed[] = [];
  for (const it of idx) {
    if (rest.every((t) => it.text.includes(t)) && (!cs.length || cs.every((c) => it.p.category === c.cat || c.name.some((k) => hasWord(it, k))))) {
      exact.push(it);
    }
  }
  if (exact.length) {
    // names that literally contain the typed words first, then category-only matches; popular first inside each group
    const literal = (it: Indexed) => tokens.every((t) => it.text.includes(t));
    const sorted = exact.sort((a, b) => Number(literal(b)) - Number(literal(a)) || popularFirst(a.p, b.p));
    return { items: sorted.map((x) => x.p), mode: "exact" };
  }

  // 2. similar: typo tolerant / partial / any-word matches, ranked by closeness
  const scored: { it: Indexed; s: number }[] = [];
  for (const it of idx) {
    let s = 0;
    for (const t of rest) s += wordScore(t, it);
    if (cats.has(it.p.category)) s += 0.9;
    else if (cs.some((c) => c.name.some((k) => hasWord(it, k)))) s += 0.6;
    if (s > 0) scored.push({ it, s: s + (it.p.popular ? 0.05 : 0) });
  }
  if (scored.length) {
    scored.sort((a, b) => b.s - a.s);
    return { items: scored.slice(0, 240).map((x) => x.it.p), mode: "similar" };
  }

  // 3. nothing close: never leave the visitor with an empty page
  const pool = scoped.length ? scoped : list;
  const withImg = pool.filter((p) => p.image);
  const popular = withImg.filter((p) => p.popular);
  return { items: [...popular, ...withImg.filter((p) => !p.popular)].slice(0, 96), mode: "popular" };
}
