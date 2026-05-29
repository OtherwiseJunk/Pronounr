import { describe, expect, it } from "vitest";
import { PronounSet, replacePronouns } from "../src/index.js";

describe("replacePronouns - source filter", () => {
  it("replaces only the source set's words", () => {
    expect(
      replacePronouns(
        "He sat across from them and next to her",
        PronounSet.He,
        PronounSet.They,
      ),
    ).toBe("He sat across from him and next to her");
  });

  it("leaves everything untouched when no source word is present", () => {
    expect(
      replacePronouns("He saw her", PronounSet.They, PronounSet.It),
    ).toBe("He saw her");
  });
});

describe("replacePronouns - single subject (no source)", () => {
  it("replaces every third-person pronoun to the target", () => {
    expect(
      replacePronouns(
        "He sat across from them and next to her",
        PronounSet.Xir,
      ),
    ).toBe("Xir sat across from xim and next to xim");
  });
});

describe("replacePronouns - form preservation", () => {
  it("maps each form they -> she correctly", () => {
    expect(replacePronouns("They went to their car", PronounSet.She)).toBe(
      "She went to her car",
    );
    expect(replacePronouns("I saw them", PronounSet.She)).toBe("I saw her");
    expect(replacePronouns("That book is theirs", PronounSet.She)).toBe(
      "That book is hers",
    );
    expect(replacePronouns("They blamed themselves", PronounSet.She)).toBe(
      "She blamed herself",
    );
  });
});

describe("replacePronouns - syncretic disambiguation", () => {
  it("her: psAdjective before a noun, object otherwise", () => {
    expect(replacePronouns("her car broke", PronounSet.He)).toBe(
      "his car broke",
    );
    expect(replacePronouns("they sat next to her", PronounSet.He)).toBe(
      "he sat next to him",
    );
  });

  it("his: psAdjective before a noun, possessive otherwise", () => {
    expect(replacePronouns("his dog ran", PronounSet.They)).toBe(
      "their dog ran",
    );
    expect(replacePronouns("the book is his", PronounSet.They)).toBe(
      "the book is theirs",
    );
  });
});

describe("replacePronouns - case preservation", () => {
  it("preserves lower, Title, and UPPER casing", () => {
    expect(replacePronouns("they ran", PronounSet.He)).toBe("he ran");
    expect(replacePronouns("They ran", PronounSet.He)).toBe("He ran");
    expect(replacePronouns("THEY ran", PronounSet.He)).toBe("HE ran");
  });
});
