export type Suit = "Wands" | "Cups" | "Swords" | "Pentacles" | "Major";
export type Element = "Fire" | "Water" | "Air" | "Earth" | "Aether";

export type TarotCard = {
  id: string;
  name: string;
  arcana: "Major" | "Minor";
  suit: Suit;
  element: Element;
  numeral: string;
  glyph: string;
  light: string;
  shadow: string;
  fortune: string;
};

const MAJORS: Array<{
  n: number;
  name: string;
  light: string;
  shadow: string;
  fortune: string;
  glyph: string;
}> = [
  { n: 0, name: "The Fool", light: "Fresh starts, faith in the leap, open-hearted curiosity.", shadow: "Recklessness, ignoring warnings, unanchored wandering.", fortune: "A door opens that you did not plan for.", glyph: "✦" },
  { n: 1, name: "The Magician", light: "Focused will, manifestation, resourcefulness.", shadow: "Manipulation, scattered power, illusion over substance.", fortune: "Your intention becomes visible to others.", glyph: "☿" },
  { n: 2, name: "The High Priestess", light: "Inner knowing, dreams, sacred patience.", shadow: "Secrets kept too long, disconnection from instinct.", fortune: "An answer arrives through silence, not effort.", glyph: "☾" },
  { n: 3, name: "The Empress", light: "Abundance, nurture, creative fertility.", shadow: "Smothering, over-giving, stagnation in comfort.", fortune: "Something you tended begins to bloom.", glyph: "♀" },
  { n: 4, name: "The Emperor", light: "Structure, protection, earned authority.", shadow: "Rigidity, control, cold command.", fortune: "A boundary you set will be respected.", glyph: "♃" },
  { n: 5, name: "The Hierophant", light: "Tradition, mentorship, meaningful ritual.", shadow: "Dogma, conformity, borrowed beliefs.", fortune: "A teacher or lineage shapes your next step.", glyph: "⛩" },
  { n: 6, name: "The Lovers", light: "Union, aligned values, conscious choice.", shadow: "Indecision, mismatched desire, divided loyalty.", fortune: "A choice between two goods must be made.", glyph: "⚭" },
  { n: 7, name: "The Chariot", light: "Momentum, disciplined victory, direction.", shadow: "Force over finesse, burnout, runaway drive.", fortune: "Forward motion resumes after a stall.", glyph: "⛊" },
  { n: 8, name: "Strength", light: "Gentle courage, patience with the wild self.", shadow: "Suppressed anger, self-doubt, brittle bravado.", fortune: "Softness accomplishes what force could not.", glyph: "∞" },
  { n: 9, name: "The Hermit", light: "Solitude, wisdom-seeking, inner lantern.", shadow: "Isolation, avoidance, over-analysis.", fortune: "A retreat clarifies what noise obscured.", glyph: "☉" },
  { n: 10, name: "Wheel of Fortune", light: "Cycles turning, luck, timely change.", shadow: "Fatalism, resisting inevitable turns.", fortune: "Circumstances shift outside your control — favorably.", glyph: "☸" },
  { n: 11, name: "Justice", light: "Truth, fairness, cause and effect.", shadow: "Bias, avoidance of accountability, imbalance.", fortune: "A matter is weighed and settled.", glyph: "⚖" },
  { n: 12, name: "The Hanged Man", light: "New perspective, willing pause, surrender.", shadow: "Stalling, martyrdom, needless sacrifice.", fortune: "Waiting is the productive move.", glyph: "⋔" },
  { n: 13, name: "Death", light: "Transformation, clean endings, release.", shadow: "Clinging, fear of change, prolonged decay.", fortune: "Something concludes so something can begin.", glyph: "☠" },
  { n: 14, name: "Temperance", light: "Balance, alchemy, measured blending.", shadow: "Excess, impatience, mismatched proportions.", fortune: "Moderation produces an unexpected gift.", glyph: "⚗" },
  { n: 15, name: "The Devil", light: "Naming the attachment, embodied honesty.", shadow: "Compulsion, dependency, golden cages.", fortune: "A chain reveals it was never locked.", glyph: "⛧" },
  { n: 16, name: "The Tower", light: "Necessary revelation, liberating collapse.", shadow: "Shock, upheaval resisted, denial of cracks.", fortune: "A sudden truth clears false ground.", glyph: "🜂" },
  { n: 17, name: "The Star", light: "Hope, healing, quiet guidance.", shadow: "Disillusionment, faithlessness, dimmed vision.", fortune: "Relief arrives gently and stays.", glyph: "★" },
  { n: 18, name: "The Moon", light: "Intuition, dreamwork, navigating mystery.", shadow: "Confusion, projection, fear of the unseen.", fortune: "Trust the path even when it is unlit.", glyph: "☽" },
  { n: 19, name: "The Sun", light: "Vitality, clarity, joyful visibility.", shadow: "Ego glare, burnout, forced positivity.", fortune: "Success is recognized publicly.", glyph: "☀" },
  { n: 20, name: "Judgement", light: "Awakening, reckoning, rising to the call.", shadow: "Self-criticism, avoidance of the summons.", fortune: "A chapter is reviewed and renewed.", glyph: "🜍" },
  { n: 21, name: "The World", light: "Completion, integration, wholeness.", shadow: "Unfinished loops, delayed closure.", fortune: "A cycle completes with honors.", glyph: "🜨" },
];

const ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"];

const SUITS: Array<{
  suit: Exclude<Suit, "Major">;
  element: Element;
  glyph: string;
  domain: string;
  lightTone: string;
  shadowTone: string;
}> = [
  { suit: "Wands", element: "Fire", glyph: "🜂", domain: "drive, creativity and ambition", lightTone: "kindled momentum", shadowTone: "scattered heat and impatience" },
  { suit: "Cups", element: "Water", glyph: "🜄", domain: "emotion, intimacy and intuition", lightTone: "open feeling", shadowTone: "flooded moods and avoidance" },
  { suit: "Swords", element: "Air", glyph: "🜁", domain: "thought, truth and communication", lightTone: "clear discernment", shadowTone: "overthinking and sharp words" },
  { suit: "Pentacles", element: "Earth", glyph: "🜃", domain: "body, money and craft", lightTone: "steady building", shadowTone: "hoarding and material fixation" },
];

const RANKS: Array<{ label: string; numeral: string; light: string; shadow: string; fortune: string }> = [
  { label: "Ace", numeral: "A", light: "a pure seed of potential", shadow: "potential left unplanted", fortune: "A beginning is offered." },
  { label: "Two", numeral: "II", light: "partnership and balance", shadow: "stalemate or divided focus", fortune: "A pairing needs your decision." },
  { label: "Three", numeral: "III", light: "early growth and collaboration", shadow: "growth without direction", fortune: "Progress becomes visible." },
  { label: "Four", numeral: "IV", light: "stability and consolidation", shadow: "stagnation and defensiveness", fortune: "A pause secures your ground." },
  { label: "Five", numeral: "V", light: "productive friction and learning", shadow: "loss, conflict, scarcity thinking", fortune: "A challenge sharpens you." },
  { label: "Six", numeral: "VI", light: "harmony restored and generosity", shadow: "imbalanced giving or nostalgia", fortune: "Support arrives from outside." },
  { label: "Seven", numeral: "VII", light: "patient strategy and assessment", shadow: "illusion, doubt, waiting too long", fortune: "Reassess before committing." },
  { label: "Eight", numeral: "VIII", light: "mastery through repetition", shadow: "restlessness or grinding without joy", fortune: "Skill compounds quietly." },
  { label: "Nine", numeral: "IX", light: "near-completion and resilience", shadow: "guardedness and exhaustion", fortune: "You are closer than it feels." },
  { label: "Ten", numeral: "X", light: "fullness and legacy", shadow: "overload and heavy inheritance", fortune: "A cycle reaches its limit." },
  { label: "Page", numeral: "P", light: "curiosity and apprenticeship", shadow: "naivety and unfinished study", fortune: "A message or invitation appears." },
  { label: "Knight", numeral: "N", light: "bold pursuit and devotion", shadow: "extremes and tunnel vision", fortune: "Movement comes quickly." },
  { label: "Queen", numeral: "Q", light: "inner authority and care", shadow: "control disguised as nurture", fortune: "Lead from what you already know." },
  { label: "King", numeral: "K", light: "mature command and stewardship", shadow: "rigidity and cold mastery", fortune: "Ownership is yours to claim." },
];

function slug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export const TAROT_DECK: TarotCard[] = [
  ...MAJORS.map((card) => ({
    id: slug(card.name),
    name: card.name,
    arcana: "Major" as const,
    suit: "Major" as Suit,
    element: "Aether" as Element,
    numeral: ROMAN[card.n] ?? String(card.n),
    glyph: card.glyph,
    light: card.light,
    shadow: card.shadow,
    fortune: card.fortune,
  })),
  ...SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      id: slug(`${rank.label}-of-${suit.suit}`),
      name: `${rank.label} of ${suit.suit}`,
      arcana: "Minor" as const,
      suit: suit.suit as Suit,
      element: suit.element,
      numeral: rank.numeral,
      glyph: suit.glyph,
      light: `In ${suit.domain}: ${rank.light}, expressed as ${suit.lightTone}.`,
      shadow: `In ${suit.domain}: ${rank.shadow}, tipping into ${suit.shadowTone}.`,
      fortune: rank.fortune,
    })),
  ),
];

export type DrawnCard = TarotCard & {
  reversed: boolean;
  position: string;
  positionMeaning: string;
};

export const SPREAD_POSITIONS = [
  { position: "Past", positionMeaning: "Root Cause" },
  { position: "Present", positionMeaning: "Situation" },
  { position: "Future", positionMeaning: "Outcome" },
] as const;

export function drawCards(count: 1 | 3): DrawnCard[] {
  const pool = [...TAROT_DECK];
  const picked: DrawnCard[] = [];
  for (let i = 0; i < count; i += 1) {
    const index = Math.floor(Math.random() * pool.length);
    const [card] = pool.splice(index, 1);
    if (!card) break;
    const slot =
      count === 1
        ? { position: "Focus", positionMeaning: "Single Card Insight" }
        : SPREAD_POSITIONS[i]!;
    picked.push({
      ...card,
      reversed: Math.random() < 0.32,
      position: slot.position,
      positionMeaning: slot.positionMeaning,
    });
  }
  return picked;
}
