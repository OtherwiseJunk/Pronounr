# pronounr

Context-aware third-person pronoun replacement for English text.

Swap one person's pronouns to any supported set — including neopronouns —
while preserving grammatical form and capitalization. Syncretic words
(`her`, `his`, `it`, …) are disambiguated by part-of-speech context via
[compromise](https://github.com/spencermountain/compromise).

## Install

```sh
npm install pronounr
```

## Usage

```ts
import { replacePronouns, PronounSet } from "pronounr";

// Single subject: replace every third-person pronoun.
replacePronouns("They went to their car", PronounSet.She);
// => "She went to her car"

// Multi-subject: replace ONLY the source set's pronouns.
replacePronouns(
  "He sat across from them and next to her",
  PronounSet.He,    // target
  PronounSet.They,  // source — only they/them swapped
);
// => "He sat across from him and next to her"
```

### API

```ts
replacePronouns(text: string, target: PronounSet, source?: PronounSet): string
```

- `target` — the set to convert pronouns **into**.
- `source` — optional. When given, only pronouns belonging to that set are
  replaced; everything else is left untouched. When omitted, **all** recognized
  third-person pronouns are replaced (use only for single-subject text).

First- and second-person pronouns (`I`, `you`, `we`) are never touched.

### Supported sets

`He` · `She` · `They` · `It` · `Ey` · `Xe` · `Fae` · `Per` · `Xir`

Each maps to five forms: subject · object · possessive · psAdjective · reflexive.

## Limitations

- **Single-subject by default.** Without `source`, every third-person pronoun
  is rewritten — correct only when the text concerns one person. The `source`
  filter is the supported way to handle multiple subjects.
- **Heuristic disambiguation.** Form resolution uses POS tagging, not a full
  parser. Accurate on clean prose; rare edge cases (notably `it` as
  subject-vs-object) may resolve wrong.

## Publishing

CI publishes to npm via `.github/workflows/publish.yml` when a GitHub Release
is published (or via manual workflow dispatch).
