const DAY_SHEET = "Days";
const STUDENT_SHEET = "Students";
const PLACEMENT_SHEET = "Placement Options";
const PBD_SHEET = "_Placements_by_Day";
const STUDENT_FIELDS = ["Username", "ID", "Name", "YOG", "Advisory"];

const DAY_FIELDS = ["Day Name"];

const PLACEMENT_FIELDS = ["Activity", "Staff", "Limit"];

const PLACEMENT_SHEET_LIST = "Request Sheets";
const PLACEMENT_LIST_FIELDS = [
  "SheetName",
  "Priority (lower is higher)",
  "Form",
];

function setupReadOnly(sheet) {
  let data = sheet.getDataRange();
  formatRO(data);
  data.protect().setDescription("Read only range");
}

function setupInitialConfig() {
  setupConfigSheet(STUDENT_SHEET, STUDENT_FIELDS);
  setupConfigSheet(DAY_SHEET, DAY_FIELDS);
  SpreadsheetApp.getActiveSpreadsheet().toast(
    "Add at least one Day to Day Sheet, then set up placement options."
  );
}

function getDays() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let dayValues = ss.getSheetByName(DAY_SHEET).getDataRange().getValues();
  let days = [];
  for (let i = 1; i < dayValues.length; i++) {
    days.push(dayValues[i][0]);
  }
  return days;
}

function setupPlacementOptions() {
  let days = getDays();
  let placementHeaders = [...PLACEMENT_FIELDS, ...days];
  let sheet = setupConfigSheet(PLACEMENT_SHEET, placementHeaders);
  sheet
    .getRange(2, PLACEMENT_FIELDS.length + 1, 500, days.length)
    .setDataValidation(SpreadsheetApp.newDataValidation().requireCheckbox());
  makePlacementByDaySheet();
  setupConfigSheet(PLACEMENT_SHEET_LIST, PLACEMENT_LIST_FIELDS);
}
function makePlacementByDaySheet() {
  let days = getDays();
  let sheet = setupConfigSheet(PBD_SHEET, days);
  for (let i = 0; i < days.length; i++) {
    let d = days[i];
    let letter = getColumnLetter(i + PLACEMENT_FIELDS.length);
    sheet
      .getRange(2, i + 1)
      .setFormula(
        `=QUERY('${PLACEMENT_SHEET}'!A2:${letter},"select A where ${letter} = true")`
      );
  }
  setupReadOnly(sheet);
}

function setupConfigSheet(sheetName, headers, clear = false) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet();
    sheet.setName(sheetName);
  }
  if (clear) {
    sheet.clear();
  }
  let range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  sheet.setFrozenRows(1);
  return sheet;
}
