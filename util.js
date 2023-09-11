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

