/*
Implements async function getSheetFromUser(prompt) which returns a sheet or throws an error.

Very impressive work on this module ChatGPT4 -- this is not a simple problem to solve!
*/

const EMAIL_UI_HTML = `
  <!DOCTYPE html>
  <html>
    <head>
      <base target="_top">
    </head>
    <body>
      <div>
        <label for="sheetSelect"><?= promptText ?></label>
        <select id="sheetSelect">
          <? var sheets = getSheetsForDropdown(); ?>
          <? for (let sheetName of sheets) { ?>
            <option value="<?= sheetName ?>"><?= sheetName ?></option>
          <? } ?>
        </select>
      </div>
      <button onclick="submitForm()">Submit</button>

      <script>
        window.addEventListener('beforeunload', function(event) {
          google.script.run.handleDialogClosure();
        });

        function submitForm() {
          const sheetName = document.getElementById('sheetSelect').value;
          google.script.run
            .withSuccessHandler(() => {
              google.script.host.close();
            })
            .storeSelectedSheet(sheetName);
        }
      </script>
    </body>
  </html>
`;

// Function to display the modal dialog to the user
async function getSheetFromUser(promptText) {
  const htmlOutput = HtmlService.createTemplate(EMAIL_UI_HTML)
  htmlOutput.promptText = promptText;
  SpreadsheetApp.getUi().showModalDialog(htmlOutput.evaluate(), "Select Sheet");

  let isResolved = false;
  let selectedSheet;

  while (!isResolved) {
    await Utilities.sleep(2000); // Sleep for 1 second before checking
    selectedSheet = PropertiesService.getUserProperties().getProperty('selectedSheet');
    
    if (selectedSheet === 'DIALOG_CLOSED') {
      throw new Error('Dialog was closed without a selection.');
    } else if (selectedSheet) {
      isResolved = true;
    }
  }

  // Cleanup property for next use
  PropertiesService.getUserProperties().deleteProperty('selectedSheet');

  return selectedSheet;
}

// Store the sheet that the user selected
function storeSelectedSheet(sheetName) {
  PropertiesService.getUserProperties().setProperty('selectedSheet', sheetName);
}

// Handle the event where the user closed the dialog
function handleDialogClosure() {
  PropertiesService.getUserProperties().setProperty('selectedSheet', 'DIALOG_CLOSED');
}

// Function to get all sheets in the spreadsheet for the dropdown
function getSheetsForDropdown() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets().map(sheet => sheet.getName());
}

// Example Usage:
async function testGetSheetFromUser() {
  try {
     let sheetName = await getSheetFromUser("Select sheet to use for Email:");
     console.log(sheetName);
  } catch (err) {
     SpreadsheetApp.getUi().alert('Action Cancelled');
  }
}
