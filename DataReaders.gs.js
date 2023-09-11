/*
const DAY_SHEET = 'Days';
const STUDENT_SHEET = 'Students';
const PLACEMENT_SHEET = 'Placement Options';
const PBD_SHEET = '_Placements_by_Day'*/

/*
function getDays () {
  return readSheet(DAY_SHEET);
}
*/

function getPlacementOptions () {
  return readSheet(PLACEMENT_SHEET);
}
function getPlacementSheets () {
  return readSheet(PLACEMENT_SHEET_LIST);
}

function getStudents () {
  return readSheet(STUDENT_SHEET);
}

function readSheet (sheetName, skipBlank=true) {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    throw `Sheet "${sheetName}" not found`
  } else {
    let data = sheet.getDataRange().getValues();
    let headerRow = data[0];
    let jsonRows = [];
    for (let i=1; i<data.length; i++) {
      if (!skipBlank || data[i][0]) {
      let row = data[i];
      let json = {
        __row : i+1
      };
      for (let c=0; c<headerRow.length; c++) {
        let header = headerRow[c];
        if (header) {
          let value = row[c];
          json[header] = value;
        }
      }
      jsonRows.push(json);
    }}
    return jsonRows;
  }
  
}

function testReaders () {
  console.log('Get days:',getDays())
  console.log('Get placement sheets',getPlacementSheets());
  console.log('Get placement options',getPlacementOptions())
  console.log('Get students',getStudents())
}
