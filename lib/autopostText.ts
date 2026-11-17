/** Short, product-aware hook lines for the auto-posts (always English, never invents prices or discounts). */

const BY_CATEGORY: Record<string, string[]> = {
  Shoes: [
    "Stop wearing the same boring sneakers every single day.",
    "Your shoe rack called. It wants an upgrade.",
    "Clean pair, clean fit. Stop settling for mid sneakers.",
    "Plain white tees need a pair like this to match.",
    "Your feet deserve better than beat-up old kicks.",
  ],
  Hoodies: [
    "Stop freezing in a thin hoodie that does nothing.",
    "The one hoodie you will end up wearing every day.",
    "Cold outside? Cozy, heavy and ready for the fit.",
    "Stop recycling the same hoodie all winter long.",
    "Layer up. This one goes with literally everything.",
  ],
  Jackets: [
    "Stop leaving the house in a jacket that does not hit.",
    "Cold weather is coming. Be the best dressed in the room.",
    "One jacket, a hundred outfits. Stop overthinking it.",
    "Your outfit is missing the final layer. Found it.",
  ],
  Pants: [
    "Stop wearing sweatpants to every single place.",
    "The right pair of pants fixes the whole outfit.",
    "Your closet needs a pair that actually fits right.",
    "Comfort, style and a fit people ask about.",
  ],
  Tees: [
    "Stop buying basic tees that fade after two washes.",
    "A tee that makes a simple outfit look intentional.",
    "Your daily fit starts here. Simple, clean, solid.",
    "Stop wearing the same old shirt on repeat.",
  ],
  Tracksuits: [
    "Stop mixing random pieces. One set, full fit done.",
    "Matching set, zero effort, maximum drip.",
    "The easiest outfit you will ever put together.",
    "Comfy enough for the couch, clean enough for outside.",
  ],
  Bags: [
    "Stop carrying everything in your pockets.",
    "Your outfit is missing the right bag.",
    "Space for everything, style for everyone to see.",
    "Stop leaving the house with a bag that is falling apart.",
  ],
  Beanies: [
    "Stop letting the cold ruin your whole fit.",
    "Bad hair day? There is a beanie for that.",
    "The cheapest way to upgrade any winter outfit.",
  ],
  Caps: [
    "Bad hair day? Say less. Put a cap on it.",
    "The final touch your outfit has been missing.",
    "Stop skipping the cap. It changes the whole look.",
  ],
  Belts: [
    "Stop wearing the same worn-out belt for years.",
    "Small detail, big difference. Upgrade the belt.",
    "The accessory people notice more than you think.",
  ],
  Glasses: [
    "Stop squinting in the sun. Upgrade the look.",
    "A pair of shades makes any outfit hit harder.",
    "The easiest way to level up your whole style.",
  ],
  Perfumes: [
    "Stop smelling like everyone else.",
    "The scent people remember after you leave the room.",
    "Smell good, feel good, walk in with confidence.",
  ],
  Accessories: [
    "Small details make the whole outfit. Do not skip them.",
    "The finishing touch your fit has been missing.",
    "Stop leaving your outfit unfinished.",
  ],
  Watches: [
    "Stop checking your phone for the time.",
    "One wrist piece that upgrades every outfit.",
    "Clean detail on the wrist, instant style boost.",
  ],
  Boxers: [
    "Stop wearing worn-out basics. Comfort starts here.",
    "The part nobody sees but everybody should feel.",
    "Stock up on comfort that actually lasts.",
  ],
  Socks: [
    "Stop wearing mismatched, worn-out socks.",
    "Fresh socks, fresh feet, fresh mood.",
    "The small upgrade your sneakers have been waiting for.",
  ],
  Popular: [
    "One of the most popular finds right now.",
    "Everybody is grabbing this one. Here is why.",
    "A crowd favorite. Check the photos and see.",
  ],
};

/** Name keywords give a more specific hook than the category. */
const BY_KEYWORD: [RegExp, string[]][] = [
  [/jersey|football|soccer/i, ["Game day fit sorted. Stop wearing plain tees to the match.", "Rep your team in style. This jersey does the talking."]],
  [/puffer|down jacket|vest/i, ["Stop being cold. Puffer season is here.", "Warm, light and it looks great with everything."]],
  [/short/i, ["Summer is coming. Stop wearing the same old shorts.", "Shorts that actually look good. Imagine that."]],
  [/jean|denim|cargo/i, ["Stop wearing pants that do not fit right.", "Great pants fix the whole outfit. This is one of them."]],
  [/zip/i, ["The zip-up that goes with literally everything."]],
  [/case|phone/i, ["Stop risking your phone with a flimsy case."]],
  [/beanie/i, ["Stop letting the cold ruin your whole fit."]],
];

function pick<T>(arr: T[], avoid?: T): T {
  const pool = arr.length > 1 && avoid !== undefined ? arr.filter((x) => x !== avoid) : arr;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function hookFor(name: string, category: string, lastHook?: string): string {
  const spec = BY_KEYWORD.find(([re]) => re.test(name));
  const pool = [...(spec ? spec[1] : []), ...(BY_CATEGORY[category] || BY_CATEGORY.Popular)];
  return pick(pool, lastHook);
}

const CTAS = ["Grab it on Kakobuy", "Check it out on Kakobuy", "See it on Kakobuy", "Order it on Kakobuy"];
export function ctaLine(): string {
  return pick(CTAS);
}
