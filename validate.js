/* Code to validate that columns and data are in the format we expect 
* 
* We expect column headers to be present. If they are missing, we then 
* do a little work to figure out what happened and try to fix it, or to
* warn the user if something has gone wrong.
*
*/


function readSheetWithValidation (
  sheetName,
  skipBlank = true,
  columns = []
) {
  let jsonData = readSheet(sheetName);
  let missingColumns = [];
  if (jsonData.length) {
    let sampleRow = jsonData[0];
    for (let c of columns) {
      if (!sampleRow[c]) {
        console.log('Missing required column',c);
        missingColumns.push(c);
      }
    }
  }
  if (missingColumns.length) {
    fixMissingColumns(sheetName,columns);
    return readSheetWithValidation(sheetName,skipBlank,columns);
  } else {
    return jsonData;
  }
}

function fixMissingColumns (sheetName, columns) {
   let ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw `Sheet "${sheetName}" not found`;
    } else {
      let data = sheet.getDataRange().getValues();
      let headerRow = data[0];
      let fixed = 0;
      for (let c of columns) {
        if (!headerRow.includes(c)) {
          // Let's start by assuming it got renamed...
          let originalIndex = columns.indexOf(c);
          let currentHeader = headerRow[originalIndex];
          /* But if the place we expect it has another header we expect, then
             maybe they've added/removed/reorganized columns and then we're in
             trouble so we'll throw an error */
          if (columns.includes(currentHeader)) {
            console.log('Looking for ',c,'which should be in ',originalIndex,'but that index has',currentHeader)
            const msg = `Missing expected column ${c} in sheet ${sheetName}`
            SpreadsheetApp.getUi().alert(msg);
            throw new Error(msg);
          } else {
            /* If the place we expect header c has a name we don't recognize, let's just squash that name */            
            headerRow[originalIndex] = c; // set it in our array -- we'll push from there momentarily
            fixed++
          }
        }
      }
      if (fixed > 0) {
        console.log('Pushing new set of headers: ',headerRow,'to sheet',sheetName);
        sheet.getRange(1,1,1,headerRow.length).setValues([headerRow]);
      } else {
        console.log('No fixes needed');
      }
    }
}
