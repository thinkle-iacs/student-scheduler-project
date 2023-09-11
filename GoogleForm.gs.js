
function createForm () {
  let form = FormApp.create('Sample New Form');
  let ss = SpreadsheetApp.getActiveSpreadsheet()
  let result = form.setDestination(FormApp.DestinationType.SPREADSHEET,ss.getId())
  console.log('Gnerates result',result)
}
