/**
 * Supported third-person pronoun sets.
 *
 * Each set maps to its five grammatical forms, in this fixed order:
 *   [subject, object, possessive, psAdjective, reflexive]
 *
 * Examples:
 *   subject     - "**he** sat"
 *   object      - "saw **him**"
 *   possessive  - "that is **his**"   (independent / standalone)
 *   psAdjective - "**his** car"        (possessive determiner)
 *   reflexive   - "**himself**"
 */
export enum PronounSet {
  He,
  She,
  They,
  It,
  Ey,
  Xe,
  Fae,
  Per,
  Xir,
}

/** Index of each grammatical form within a set tuple. */
export enum Form {
  Subject = 0,
  Object = 1,
  Possessive = 2,
  PsAdjective = 3,
  Reflexive = 4,
}

export type FormTuple = readonly [
  subject: string,
  object: string,
  possessive: string,
  psAdjective: string,
  reflexive: string,
];

/**
 * The five forms for each supported set.
 *
 * Note: `It` uses the grammatically correct object form "it" (e.g. "I saw it"),
 * not "its".
 */
export const SETS: Record<PronounSet, FormTuple> = {
  [PronounSet.He]: ["he", "him", "his", "his", "himself"],
  [PronounSet.She]: ["she", "her", "hers", "her", "herself"],
  [PronounSet.They]: ["they", "them", "theirs", "their", "themselves"],
  [PronounSet.It]: ["it", "it", "its", "its", "itself"],
  [PronounSet.Ey]: ["ey", "em", "eirs", "eir", "emself"],
  [PronounSet.Xe]: ["xe", "xem", "xyrs", "xyr", "xemself"],
  [PronounSet.Fae]: ["fae", "faer", "faers", "faer", "faerself"],
  [PronounSet.Per]: ["per", "per", "pers", "per", "perself"],
  [PronounSet.Xir]: ["xir", "xim", "xirs", "xir", "xirself"],
};

export interface ReverseEntry {
  set: PronounSet;
  /** Candidate forms this surface word can represent within its set. */
  forms: Form[];
}

/**
 * Reverse lookup: lowercased surface word -> the set it belongs to and the
 * grammatical form(s) it can represent.
 *
 * There are no cross-set collisions among the supported sets, so every word
 * resolves to exactly one set. A word may map to multiple forms within that
 * set (syncretism), e.g. "her" is both object and psAdjective.
 */
export const REVERSE: Map<string, ReverseEntry> = (() => {
  const map = new Map<string, ReverseEntry>();
  for (const key of Object.keys(SETS) as unknown as PronounSet[]) {
    const set = Number(key) as PronounSet;
    SETS[set].forEach((word, formIndex) => {
      const lower = word.toLowerCase();
      const existing = map.get(lower);
      if (existing) {
        if (!existing.forms.includes(formIndex)) existing.forms.push(formIndex);
      } else {
        map.set(lower, { set, forms: [formIndex] });
      }
    });
  }
  return map;
})();
