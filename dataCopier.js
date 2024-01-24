function testCopySheets() {
  copySheets(
    ["Monday Schedule"],
    "https://docs.google.com/spreadsheets/d/1PrOhwrmQm57cXMUR1PAfR1uVtYa66SA6nZRXk3zK4OM/edit#gid=550658584"
  );
}

function copySheets(sheetNames, targetUrl) {
  let targetSS = SpreadsheetApp.openByUrl(targetUrl);
  let currentSS = SpreadsheetApp.getActiveSpreadsheet();
  let today = new Date();

  for (let name of sheetNames) {
    let sourceSheet = currentSS.getSheetByName(name);
    if (!sourceSheet) {
      throw `Sheet "${name}" not found`;
    }

    let targetSheet = targetSS.getSheetByName(name);

    // If it's the first time, copy the entire sheet
    if (!targetSheet) {
      targetSheet = sourceSheet.copyTo(targetSS);
      targetSheet.setName(name);

      // Remove any blank rows
      removeBlankRows(targetSheet);
      SpreadsheetApp.flush();
      // Add a new column for "Date Copied"
      targetSheet.insertColumnBefore(1);
      targetSheet.getRange(1, 1).setValue("Date Copied");
      // Copy the dates for the existing rows
      let dateColumn = Array(targetSheet.getLastRow() - 1).fill([today]);
      targetSheet.getRange(2, 1, dateColumn.length, 1).setValues(dateColumn);
      targetSheet.getRange(2, 1, dateColumn.length, 1).clearDataValidations();
    } else {
      // Append new data
      let dataRange = sourceSheet.getRange(
        2,
        1,
        sourceSheet.getLastRow() - 1,
        sourceSheet.getLastColumn()
      );
      let data = dataRange.getValues();
      data = data.filter((row) => row.slice(2).some((cell) => cell !== ""));
      data = data.map((row) => [today, ...row]);
      if (data.length > 0) {
        let targetRange = targetSheet.getRange(
          targetSheet.getLastRow() + 1,
          1,
          data.length,
          data[0].length
        );
        targetRange.setValues(data);
      }
    }
  }
}

function removeBlankRows(sheet) {
  let lastRow = sheet.getLastRow();
  let range = sheet.getRange(1, 1, lastRow, sheet.getLastColumn());
  let values = range.getValues();
  let startRow = null;
  let endRow = null;

  for (let i = 0; i < values.length; i++) {
    // Check if the entire row is blank
    if (values[i].slice(1).every((cell) => !cell)) {
      if (startRow === null) {
        startRow = i + 1; // Set the start of a contiguous blank row block
      }
      endRow = i + 1; // Set or update the end of the contiguous block
    } else if (startRow !== null) {
      // Delete the block of blank rows
      sheet.deleteRows(startRow, endRow - startRow + 1);
      // Adjust for the number of rows deleted
      i -= endRow - startRow + 1;
      // Reset start and end markers
      startRow = null;
      endRow = null;
    }
  }

  // Check if the last rows are blank and need to be deleted
  if (startRow !== null) {
    sheet.deleteRows(startRow, endRow - startRow + 1);
  }
}
