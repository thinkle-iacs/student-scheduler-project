function clearAll () {
  const preserve = ['ABOUT']
  let magicPrompt = 'Yes, I am dead sure I want to erase everything'
  let response = SpreadsheetApp.getUi().prompt(
    `Are you absolutely sure you want to clear ALL DATA from this spreadsheet to reset it? If so, write
    "${magicPrompt}" now (without the quotes):`
  ).getResponseText();
  if (response == magicPrompt) {
    SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(
      (sheet)=>{
        let name = sheet.getName();
        if (preserve.indexOf(name) == -1) {
          SpreadsheetApp.getActiveSpreadsheet().deleteSheet(sheet);
        }
      }
    )
  }
}
