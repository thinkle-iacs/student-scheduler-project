function setVisibility(sheetNames, visibility) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  for (let name of sheetNames) {
    let sheet = ss.getSheetByName(name);
    if (sheet) {
      if (visibility) {
        sheet.showSheet();
      } else {
        sheet.hideSheet();
      }
    }
  }
}

function setSetupVisibility(visibility) {
  setVisibility(
    [PLACEMENT_SHEET, PLACEMENT_SHEET_LIST, DAY_SHEET, STUDENT_SHEET],
    visibility
  );
}

function showSetup() {
  setSetupVisibility(true);
}

function hideSetup() {
  setSetupVisibility(false);
}

function setPlacementVisibility(visibility) {    
  let sheets = readSheetWithValidation(PLACEMENT_SHEET_LIST,true,PLACEMENT_LIST_FIELDS);  
  let names = [PLACEMENT_SHEET_LIST];
  for (let s of sheets) {
    names.push(s.SheetName);
  }
  setVisibility(names, visibility);
}

function hidePlacements() {
  setPlacementVisibility(false);
}
function showPlacements() {
  setPlacementVisibility(true);
}

function setScheduleVisibility(visibility) {
  let days = getDays();
  let sheetNames = days.map((d) => `${d} Schedule`);
  setVisibility(sheetNames, visibility);
}
function showSchedules() {
  setScheduleVisibility(true);
}
function hideSchedules() {
  setScheduleVisibility(false);
}
