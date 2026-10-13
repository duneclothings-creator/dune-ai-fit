
export const sizeCharts = {
  pants: {
    name: "İş Pantolonu",
    sizes: [
      { size: "S", waistMin: 40, waistMax: 44, calf: 32.5, length: 106 },
      { size: "M", waistMin: 43, waistMax: 47, calf: 34, length: 106.5 },
      { size: "L", waistMin: 47, waistMax: 51, calf: 36, length: 107.5 },
      { size: "XL", waistMin: 51, waistMax: 55, calf: 38, length: 108.5 },
      { size: "2XL", waistMin: 55, waistMax: 59, calf: 40, length: 109.5 },
    ],
    toleranceCm: 1,
  },

  zipHoodie: {
    name: "Fermuarlı Hoodie / Sweatshirt",
    sizes: [
      { size: "S", width: 57, length: 71 },
      { size: "M", width: 59, length: 73 },
      { size: "L", width: 62, length: 75 },
      { size: "XL", width: 65, length: 77 },
    ],
    toleranceCm: 2,
  },

  longSleeve: {
    name: "Uzun Kollu Tişört",
    sizes: [
      { size: "S", hem: 53, chest: 53, length: 69 },
      { size: "M", hem: 55, chest: 54, length: 70 },
      { size: "L", hem: 58, chest: 58, length: 74 },
      { size: "XL", hem: 60, chest: 60, length: 76 },
    ],
    toleranceCm: 2,
  },

  shortSleeve: {
    name: "Kısa Kollu Tişört",
    sizes: [
      { size: "S", hem: 47, chest: 47, length: 70 },
      { size: "M", hem: 50, chest: 50, length: 72 },
      { size: "L", hem: 53, chest: 53, length: 74 },
      { size: "XL", hem: 58, chest: 58, length: 76 },
    ],
    toleranceCm: 2,
  },
} as const;
