import nlp from "compromise";
import { Form, PronounSet, REVERSE, SETS, type ReverseEntry } from "./sets.js";

export { PronounSet } from "./sets.js";

/** A single tokenized term as emitted by compromise's `json()`. */
interface Term {
  text: string;
  pre?: string;
  post?: string;
  tags?: string[];
}

interface Sentence {
  terms: Term[];
}

/**
 * Replace third-person pronouns in `text` with the equivalent forms of
 * `target`, preserving each word's grammatical form and capitalization.
 *
 * If `source` is given, only pronouns belonging to that set are replaced
 * (other people's pronouns are left alone). If `source` is omitted, every
 * recognized third-person pronoun is replaced — appropriate only when the
 * text concerns a single subject.
 *
 * Ambiguous (syncretic) words such as "her", "his", or "it" are disambiguated
 * by part-of-speech context using the neighboring token.
 *
 * @example
 * replacePronouns("He sat across from them and next to her", PronounSet.He, PronounSet.They)
 * // => "He sat across from him and next to her"  (only they/them swapped)
 *
 * @example
 * replacePronouns("They went to their car", PronounSet.She)
 * // => "She went to her car"
 */
export function replacePronouns(
  text: string,
  target: PronounSet,
  source?: PronounSet,
): string {
  const sentences = nlp(text).json() as Sentence[];
  let out = "";

  for (const sentence of sentences) {
    const terms = sentence.terms;
    for (let i = 0; i < terms.length; i++) {
      const term = terms[i]!;
      const pre = term.pre ?? "";
      const post = term.post ?? "";
      let surface = term.text;

      const entry = REVERSE.get(surface.toLowerCase());
      if (entry && (source === undefined || entry.set === source)) {
        const form = resolveForm(entry, terms[i + 1]);
        surface = applyCase(term.text, SETS[target][form]);
      }

      out += pre + surface + post;
    }
  }

  return out;
}

/**
 * Pick the grammatical form a matched word represents. Unambiguous words
 * resolve directly. Syncretic words are decided by the next token's tags,
 * falling back to a fixed precedence when context is inconclusive.
 */
function resolveForm(entry: ReverseEntry, next: Term | undefined): Form {
  const { forms } = entry;
  if (forms.length === 1) return forms[0]!;

  const tags = next?.tags ?? [];
  const nounLike =
    tags.includes("Noun") ||
    tags.includes("Adjective") ||
    tags.includes("Value");
  const verbLike = tags.includes("Verb");

  // psAdjective is a determiner -> followed by the noun phrase it modifies.
  if (forms.includes(Form.PsAdjective) && nounLike) return Form.PsAdjective;
  // subject precedes its verb.
  if (forms.includes(Form.Subject) && verbLike) return Form.Subject;

  // Inconclusive context: deterministic precedence over remaining candidates.
  if (forms.includes(Form.Object)) return Form.Object;
  if (forms.includes(Form.Possessive)) return Form.Possessive;
  if (forms.includes(Form.Subject)) return Form.Subject;
  return forms[0]!;
}

/** Apply the casing pattern of `original` (UPPER / Title / lower) to `word`. */
function applyCase(original: string, word: string): string {
  if (original.length > 1 && original === original.toUpperCase()) {
    return word.toUpperCase();
  }
  if (original[0] === original[0]?.toUpperCase()) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  return word;
}
