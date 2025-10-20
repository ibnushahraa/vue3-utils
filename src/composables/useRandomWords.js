import { ref, computed } from "vue";

/**
 * Composable untuk menampilkan kata/kalimat secara random dari array.
 * @param {Array<string|Object>} words - Array kata/kalimat
 * @param {Object} options - Opsi konfigurasi
 * @returns {Object} Object dengan randomWord dan fungsi refresh
 */
export function useRandomWords(words = [], options = {}) {
  const { category } = options;

  // Filter words berdasarkan kategori jika ada
  const filteredWords = computed(() => {
    if (!category) {
      return words;
    }

    return words.filter((word) => {
      // Jika word adalah object dan punya property category
      if (typeof word === "object" && word !== null && "category" in word) {
        return word.category === category;
      }
      return false;
    });
  });

  // Pilih random word dari array yang sudah difilter
  const getRandomItem = () => {
    const wordsToUse = filteredWords.value;
    if (wordsToUse.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * wordsToUse.length);
    return wordsToUse[randomIndex];
  };

  const randomItem = ref(getRandomItem());

  // Computed untuk mengambil text dari randomItem
  const randomWord = computed(() => {
    if (!randomItem.value) return "";

    // Jika randomItem adalah string, return langsung
    if (typeof randomItem.value === "string") {
      return randomItem.value;
    }

    // Jika randomItem adalah object, ambil property text
    if (
      typeof randomItem.value === "object" &&
      randomItem.value !== null &&
      "text" in randomItem.value
    ) {
      return randomItem.value.text;
    }

    return "";
  });

  /**
   * Pilih kata random yang baru
   */
  const refresh = () => {
    randomItem.value = getRandomItem();
  };

  return {
    randomWord,
    randomItem,
    refresh,
    filteredWords,
  };
}
