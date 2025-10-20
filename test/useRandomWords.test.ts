import { describe, it, expect } from "@jest/globals";
import { useRandomWords } from "../src/composables/useRandomWords.js";
import { nextTick } from "vue";

describe("useRandomWords", () => {
  it("should return random word from string array", async () => {
    const words = ["Hello", "Hi", "Hey"];
    const { randomWord } = useRandomWords(words);

    await nextTick();

    expect(words).toContain(randomWord.value);
  });

  it("should return random word from object array", async () => {
    const words = [
      { text: "Halo", category: "greeting" },
      { text: "Hi", category: "greeting" },
    ];
    const { randomWord } = useRandomWords(words);

    await nextTick();

    expect(["Halo", "Hi"]).toContain(randomWord.value);
  });

  it("should filter by category", async () => {
    const words = [
      { text: "Selamat pagi", category: "morning" },
      { text: "Selamat siang", category: "afternoon" },
    ];
    const { randomWord } = useRandomWords(words, { category: "morning" });

    await nextTick();

    expect(randomWord.value).toBe("Selamat pagi");
  });

  it("should refresh word", async () => {
    const words = ["A", "B", "C", "D", "E"];
    const { randomWord, refresh } = useRandomWords(words);

    await nextTick();
    const first = randomWord.value;

    let changed = false;
    for (let i = 0; i < 20; i++) {
      refresh();
      if (randomWord.value !== first) {
        changed = true;
        break;
      }
    }

    expect(changed).toBe(true);
  });

  it("should return empty string when empty array", async () => {
    const { randomWord } = useRandomWords([]);

    await nextTick();

    expect(randomWord.value).toBe("");
  });
});
