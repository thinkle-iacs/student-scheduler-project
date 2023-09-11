function getColumnLetter(i) {
  let columns = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (i < 26) {
    return columns[i];
  } else {
    let lastPart = getColumnNumber(i % 26);
    let firstPart = getColumnNumber(Math.floor(i / 26) - 1);
    return `${firstPart}${lastPart}`;
  }
}

function testColumnNumbers() {
  for (let i of [0, 1, 3, 10, 27, 32, 51, 52, 53, 55, 102, 17, 17 + 26]) {
    console.log(i, getColumnNumber(i));
  }
}

function formatRO(range) {
  range.setFontStyle("italic").setBackgroundRGB(200, 200, 200);
}

/* Convenience method by ChatGPT -- thanks AI! */
function getRandomSubset(array, length) {
  // Check if the requested length is greater than the array length
  if (length >= array.length) {
    throw new Error("Subset length should be less than the array length.");
  }

  // Create a copy of the original array to avoid modifying it
  const copyArray = [...array];

  // Shuffle the copy of the array randomly
  for (let i = copyArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copyArray[i], copyArray[j]] = [copyArray[j], copyArray[i]];
  }

  // Return a slice of the first 'length' elements from the shuffled array
  return copyArray.slice(0, length);
}
