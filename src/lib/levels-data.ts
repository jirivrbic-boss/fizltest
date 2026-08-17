import { LevelDefinition } from "./gamification-types";

const GRADIENTS = [
  "from-slate-500 to-slate-700",
  "from-blue-500 to-blue-700",
  "from-cyan-500 to-blue-600",
  "from-amber-400 to-orange-500",
  "from-purple-500 to-indigo-600",
  "from-violet-500 to-purple-700",
  "from-yellow-400 to-amber-600",
  "from-red-500 to-rose-600",
  "from-orange-500 to-red-600",
  "from-emerald-400 via-yellow-400 to-amber-500",
  "from-teal-500 to-cyan-700",
  "from-indigo-500 to-blue-800",
  "from-pink-500 to-rose-700",
  "from-lime-500 to-green-700",
  "from-sky-500 to-indigo-600",
  "from-fuchsia-500 to-purple-800",
  "from-rose-400 to-red-700",
  "from-emerald-500 to-teal-700",
  "from-amber-500 to-yellow-700",
  "from-blue-600 to-violet-800",
];

const LEVEL_CONTENT: Omit<LevelDefinition, "level" | "xpRequired" | "gradient">[] = [
  { title: "Nováček", reward: "Vstupní odznak", rewardEmoji: "🌱", message: "Vítej v řadách! Každý velký policista začíná prvním krokem." },
  { title: "Strážník v výcviku", reward: "Stříbrný štít", rewardEmoji: "🛡️", message: "Tvoje vytrvalost se vyplácí. Pokračuj v tréninku — jsi na dobré cestě!" },
  { title: "Patrolní policista", reward: "Modrý prapor", rewardEmoji: "🚔", message: "Už znáš základy na zpaměť. Teď je čas posunout laťku výš!" },
  { title: "Zkušený strážník", reward: "Zlatá hvězda", rewardEmoji: "⭐", message: "Skvělá práce! Tvoje znalosti rostou rychleji než pochybnosti." },
  { title: "Specialista", reward: "Elitní odznak", rewardEmoji: "🏅", message: "Polovina cesty je za tebou. Jsi mezi nejlepšími kandidáty!" },
  { title: "Expert", reward: "Diamantový kříž", rewardEmoji: "💎", message: "Tvoje odhodlání je inspirující. Služba tě volá!" },
  { title: "Mistr testů", reward: "Platinový věnec", rewardEmoji: "👑", message: "Už těmto otázkám vládneš. Jsi připraven na cokoliv!" },
  { title: "Veterán", reward: "Čestný meč", rewardEmoji: "⚔️", message: "Tvoje znalosti jsou zbraní. Používej je moudře!" },
  { title: "Legenda", reward: "Legendární plaketa", rewardEmoji: "🔥", message: "Málokdo se dostane tak daleko. Ty jsi výjimka!" },
  { title: "Velmistr PČR", reward: "Nejvyšší vyznamenání", rewardEmoji: "🏆", message: "Dosáhl jsi vrcholu první desítky. Cesta pokračuje!" },
  { title: "Velitel hlídky", reward: "Stříbrná píšťala", rewardEmoji: "📯", message: "Vedení začíná znalostmi. Tvoje hlídka by ti záviděla!" },
  { title: "Vyšetřovatel", reward: "Lupa pravdy", rewardEmoji: "🔍", message: "Každá otázka je stopa. Ty je umíš najít všechny." },
  { title: "Taktik", reward: "Mapa operace", rewardEmoji: "🗺️", message: "Strategie je klíč. Plánuješ dopředu a vždy trefíš." },
  { title: "Instruktor", reward: "Zlaté pero", rewardEmoji: "✒️", message: "Učíš se tak rychle, že bys mohl učit ostatní." },
  { title: "Operátor", reward: "Taktická vesta", rewardEmoji: "🦺", message: "Jsi připraven na jakoukoliv situaci. Žádná otázka tě nezaskočí." },
  { title: "Kynolog", reward: "Paw odznak", rewardEmoji: "🐕", message: "Věrnost a vytrvalost — tvoje nejsilnější zbraně." },
  { title: "Dopravní expert", reward: "Zelená vlajka", rewardEmoji: "🚦", message: "Zastavíš chaos dřív, než vznikne. Perfektní kontrola!" },
  { title: "Pořádková jednotka", reward: "Ochranný štít", rewardEmoji: "🔰", message: "Stojíš pevně i pod tlakem. Respekt!" },
  { title: "Kriminalista", reward: "Forenzní sada", rewardEmoji: "🧬", message: "Detaily odhalují pravdu. Ty je vidíš všechny." },
  { title: "Velitel oddělení", reward: "Stříbrný prsten", rewardEmoji: "💍", message: "Dvacet levelů! Jsi v elitní skupině kandidátů." },
  { title: "Speciální jednotka", reward: "Taktická helma", rewardEmoji: "⛑️", message: "Rychlost, přesnost, odhodlání — všechno máš." },
  { title: "Vyjednavač", reward: "Diplomatický odznak", rewardEmoji: "🤝", message: "Klidná hlava vyhrává. I v nejtěžších testech." },
  { title: "Forenzní expert", reward: "Důkazní sáček", rewardEmoji: "🔬", message: "Věda a právo v jednom. Impozantní kombinace!" },
  { title: "Operační velitel", reward: "Zlatý kompas", rewardEmoji: "🧭", message: "Vždy víš, kam jít. Směr je jasný — nahoru!" },
  { title: "Mistr vyšetřování", reward: "Klíč k pravdě", rewardEmoji: "🗝️", message: "Pětadvacet levelů! Tvoje úsilí je neuvěřitelné." },
  { title: "Šéf patrol", reward: "Velitelská hvězda", rewardEmoji: "🌟", message: "Celá oblast by tě chtěla jako velitele." },
  { title: "Taktický expert", reward: "Noční vidění", rewardEmoji: "🌙", message: "Vidíš i to, co ostatní přehlédnou. Skvělé!" },
  { title: "Mentor", reward: "Kniha moudrosti", rewardEmoji: "📚", message: "Tvoje znalosti jsou poklad. Sdílej je s ostatními!" },
  { title: "Elitní strážník", reward: "Platinový odznak", rewardEmoji: "🎖️", message: "Elita není náhoda. Je to tvrdá práce — a ty ji děláš." },
  { title: "Strážce zákona", reward: "Váhy spravedlnosti", rewardEmoji: "⚖️", message: "Spravedlnost není jen slovo. Pro tebe je to cesta." },
  { title: "Operační důstojník", reward: "Stříbrný meč", rewardEmoji: "🗡️", message: "Třicet levelů! Jsi mezi absolutní špičkou." },
  { title: "Mistr taktiky", reward: "Šachová věž", rewardEmoji: "♟️", message: "Každý tah promyšlený. Každá odpověď správná." },
  { title: "Vyšší důstojník", reward: "Zlaté vyznamenání", rewardEmoji: "🥇", message: "Respekt, který si zasloužíš. Zaslouženě!" },
  { title: "Expert PČR", reward: "Státní pečeť", rewardEmoji: "🔏", message: "Oficiálně nejlepší. Tvoje jméno by mělo znít hlasitě." },
  { title: "Velitel operace", reward: "Vlajka vítězství", rewardEmoji: "🏁", message: "Operace dokončena s bravurností. Vždy!" },
  { title: "Strateg", reward: "Globus moci", rewardEmoji: "🌍", message: "Vidíš celý obraz. Ostatní jen kousky." },
  { title: "Mistr služby", reward: "Stříbrný věnec", rewardEmoji: "🌿", message: "Služba není povinnost — pro tebe je to poslání." },
  { title: "Elitní vyšetřovatel", reward: "Rentgen pravdy", rewardEmoji: "📡", message: "Nic se před tebou neschová. Pravda vždy vyjde najevo." },
  { title: "Taktický velitel", reward: "Zlatý prapor", rewardEmoji: "🚩", message: "Vedení je tvůj druhý domov. Excelentní práce!" },
  { title: "Legenda služby", reward: "Plamenný odznak", rewardEmoji: "🔱", message: "Čtyřicet levelů! Tvoje jméno bude v učebnicích." },
  { title: "Mistr zákona", reward: "Koruna moudrosti", rewardEmoji: "👸", message: "Zákon není složitý, když ho rozumíš. A ty rozumíš." },
  { title: "Operační legenda", reward: "Stříbrný orel", rewardEmoji: "🦅", message: "Letíš vysoko nad ostatními. Nezastavitelný!" },
  { title: "Velitel brigády", reward: "Generálská hvězda", rewardEmoji: "✨", message: "Velení ti jde přirozeně. Jsi stvořen pro víc." },
  { title: "Absolutní expert", reward: "Diamantová koruna", rewardEmoji: "💠", message: "Expertíza na nejvyšší úrovni. Obdivuhodné!" },
  { title: "Mistr PČR", reward: "Zlatý orel", rewardEmoji: "🎗️", message: "Symbol excellence. Ty jsi ten symbol." },
  { title: "Strážce republiky", reward: "Státní koruna", rewardEmoji: "👑", message: "Chráníš víc než body — chráníš znalosti a čest." },
  { title: "Elitní velitel", reward: "Platinový meč", rewardEmoji: "⚡", message: "Rychlost blesku, přesnost chirurga. Dokonalost!" },
  { title: "Nejvyšší důstojník", reward: "Generálský prsten", rewardEmoji: "💫", message: "Téměř na vrcholu. Poslední krok tě dělí od legendy." },
  { title: "Velmistr služby", reward: "Legendární koruna", rewardEmoji: "🌠", message: "49 levelů! Jsi na prahu absolutního mistrovství." },
  { title: "Velmistr PČR — Legenda", reward: "Nejvyšší vyznamenání PČR", rewardEmoji: "🏆", message: "DOSÁHL JSI MAXIMÁLNÍHO LEVELU! Jsi absolutní legenda Policie ČR. Služba tě čeká!" },
];

function computeXpThresholds(count: number): number[] {
  const thresholds: number[] = [0];
  const baseIncrements = [200, 300, 400, 500, 600, 800, 1000, 1200, 1500];

  let xp = 0;
  for (let level = 2; level <= count; level++) {
    const increment =
      level <= 10 ? baseIncrements[level - 2] : 1600 + (level - 11) * 80;
    xp += increment;
    thresholds.push(xp);
  }

  return thresholds;
}

export const MAX_LEVEL = 50;

export function buildLevels(): LevelDefinition[] {
  const thresholds = computeXpThresholds(MAX_LEVEL);

  return LEVEL_CONTENT.map((content, index) => ({
    level: index + 1,
    xpRequired: thresholds[index],
    gradient: GRADIENTS[index % GRADIENTS.length],
    ...content,
  }));
}
