/*
* Formats sheet so any duplicate sheets are highlighted
* @param {sheet} SpreadsheetApp.SheetType
* @param {idcol} num
*/
function highlightDups (sheet, idcol='A') {
  let range = sheet.getRange(2,1,sheet.getLastRow()-1,sheet.getLastColumn());
  SpreadsheetApp.newConditionalFormatRule()
  let rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=and(not(isblank($${idcol}2)),gt(countif($${idcol}:$${idcol},$${idcol}2),1))`)
    .setBackground('yellow')
    .setRanges([range])
    .build();
  sheet.setConditionalFormatRules([rule]);
}

function testHighlight () {
  highlightDups(SpreadsheetApp.getActive().getSheetByName('A Week Requests'));
}
