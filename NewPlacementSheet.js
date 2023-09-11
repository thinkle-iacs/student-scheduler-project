function createPlacementSheet() {
  let placementSheetName = SpreadsheetApp.getUi()
    .prompt("Enter name for Placement Sheet (i.e. Student Placements)")
    .getResponseText();
  if (!placementSheetName) {
    SpreadsheetApp.getUi().alert("No sheet name entered, nevermind :(");
    return;
  }
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let days = getDays();
  let headers = [...STUDENT_FIELDS, ...days];
  let sheet = setupConfigSheet(placementSheetName, headers);
  let placementList = ss.getSheetByName(PLACEMENT_SHEET_LIST);
  placementList.appendRow([placementSheetName, placementList.getLastRow()]);
  const pbd_sheet = ss.getSheetByName(PBD_SHEET);
  let studentSheet = ss.getSheetByName(STUDENT_SHEET);
  sheet
    .getRange("A2:A")
    .setDataValidation(
      SpreadsheetApp.newDataValidation().requireValueInRange(
        studentSheet.getRange("A2:A")
      )
    );
  for (let i = 1; i < STUDENT_FIELDS.length; i++) {
    let letter = getColumnLetter(i);
    sheet
      .getRange(`${letter}2`)
      .setFormula(
        `arrayformula(iferror(vlookup($A2:$A,'${STUDENT_SHEET}'!A:${letter},${
          i + 1
        },false),""))`
      );
    formatRO(sheet.getRange(`${letter}:${letter}`));
  }
  for (let i = 0; i < days.length; i++) {
    let day = days[i];
    let dayCol = STUDENT_FIELDS.length + i;
    let letter = getColumnLetter(dayCol);
    let pbd_letter = getColumnLetter(i);
    sheet
      .getRange(`${letter}2:${letter}`)
      .setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInRange(
          pbd_sheet.getRange(`${pbd_letter}2:${pbd_letter}`)
        )
      );
  }
  highlightDups(sheet);
}
