function sortSheets(sheetnames, headers) {
  for (let sn of sheetnames) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sn);
    sheet.setFrozenRows(1);
    let existingFilter = sheet.getFilter();
    if (existingFilter) {
      existingFilter.remove();
    }
    let sheetHeaders = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];
    let filter = sheet.getDataRange().createFilter();
    for (let header of headers) {
      let column = sheetHeaders.indexOf(header);
      if (column > -1) {
        filter.sort(column + 1, true);
      } else {
        console.log(
          "WARNING: Sorting by ",
          header,
          "but header not found in sheet",
          sn
        );
      }
    }
  }
}

function testSortSheets() {
  sortSheets(["Tuesday Schedule"], ["Name", "Activity"]);
}
