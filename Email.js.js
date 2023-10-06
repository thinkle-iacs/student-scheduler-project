const EMAIL_SHEET = 'Email Templates';
const EMAIL_FIELDS = ['Description', 'SheetName', 'Column', 'Value', 'Subject', 'Template'];
const EMAIL_DOCS = [
  'Name of template',
  'Name of the sheet this template applies to',
  'Column to match on',
  'Value to match (or DEFAULT for default template)',
  'Subject line of email',
  'Email template, using {{column name}} to insert columns'
];

function setupEmailSheet () {
  let sheet = setupConfigSheet(EMAIL_SHEET,EMAIL_FIELDS);
  sheet.appendRow(EMAIL_DOCS);
}

function getTemplateForDataRow(dataRow, sheetName) {
  let dataSheet = readSheet(EMAIL_SHEET, true);
  let defaultTemplate = null;

  for (let row of dataSheet) {
    // Skip this row if the sheet name does not match
    if (row.SheetName !== sheetName) continue;

    // Handle default template separately
    if (row.Value == 'DEFAULT') {
      defaultTemplate = {
        subject: row.Subject,
        template: row.Template
      };
    }
    // Match based on column value and use this template
    else if (dataRow[row.Column] == row.Value) {
      return {
        subject: row.Subject,
        template: row.Template
      };
    }
  }
  
  // If no matching template was found, return the default (which might be null)
  return defaultTemplate;
}


function applyTemplate (template, row) {
  return filledTemplate = template.template.replace(/\{\{([^\}]+)\}\}/g, function(_, key) {
      key = key.trim();
      var value = row[key];
      // Check if the value is boolean and replace with respective HTML.
      if (typeof value === 'boolean') {
        if (value) {
          return '<span style="color: green;">✔</span>';
        } else {
          return '<span style="color: red;">✖</span>';
        }
      }
      // Special handling for currentDate placeholder
      if (key === 'currentDate') {
        return getFormattedCurrentDate();
      }
      if (key.startsWith("currentDate")) {
        var daysToAdd = parseInt(key.split('+')[1]) || 0;  // Extract number of days to add
        return getFormattedCurrentDate(daysToAdd);
      }
      return value || "";
  });
}

function emailSheet(sheetName, mode="Show Template",testEmailAddress='') {
  // Example implementation; specifics might depend on your use case and email sending mechanism.
  let dataSheet = readSheet(sheetName, true);
  for (let dataRow of dataSheet) {
    let template = getTemplateForDataRow(dataRow, sheetName);
    if (template) {      
      sendEmail(template, dataRow, mode,testEmailAddress);
    } else {
      console.log('No applicable template found for row', dataRow, testEmailAddress);
    }
  }
}

function sendEmail(template, dataRow, mode='Show Template', testEmailAddress='') {
  const filledSubject = applyTemplate({template: template.subject}, dataRow);
  const filledBody = applyTemplate({template: template.template}, dataRow);
  
  switch(mode) {
    case "Show Template":
      // Logging the email template to the console
      console.log("Subject: ", filledSubject);
      console.log("Body: ", filledBody);
      var htmlOutput = HtmlService.createHtmlOutput(filledBody);
      SpreadsheetApp.getUi().showModalDialog(htmlOutput, filledSubject);
      break;
    
    case "Test Email":
      // Sending to a test email address.
      // Note: You should implement UI to gather the test email address dynamically.      
      GmailApp.sendEmail(testEmailAddress, filledSubject, '', {htmlBody:filledBody});
      break;
    
    case "Live":
      // Sending to actual recipient
      // Assuming dataRow has an 'email' property which holds recipient email address
      GmailApp.sendEmail(dataRow.Email||dataRow.Username, filledSubject, '', {htmlBody:filledBody});
      break;
      
    default:
      console.error("Invalid mode provided to sendEmail function.");
  }
}

async function showTemplateForSheetInteractive () {
  let sheetName = await getSheetFromUser("Select sheet to show template for.");
  emailSheet(sheetName,"Show Template");
}

async function sendTestEmailForSheetInteractive () {
  let sheetName = await getSheetFromUser("Select sheet to show template for.");
  const testEmailAddress = SpreadsheetApp.getUi().prompt('Enter a test email address').getResponseText();
  emailSheet(sheetName,"Test Email",testEmailAddress);
}

function requestConfirmationFromUser() {
  const ui = SpreadsheetApp.getUi();
  
  const result = ui.prompt(
      'Confirmation Needed',
      'Please enter the phrase: "Send email and I mean it!" to continue.',
      ui.ButtonSet.OK_CANCEL);

  // Check if the user clicked "OK".
  if (result.getSelectedButton() == ui.Button.OK) {
    if (result.getResponseText() === "Send email and I mean it!") {
      // Proceed with the desired action here.
      console.log("Confirmed! Proceeding with action...");
      return true;
    } else {
      ui.alert('Wrong phrase entered. Action aborted.');
      return false;
    }
  } else {
    console.log("User cancelled the action.");
    return false;
  }
}


async function sendEmailForSheetInteractive () {
  let sheetName = await getSheetFromUser("Select sheet to send email for");
  if (requestConfirmationFromUser()) {
    emailSheet(sheetName,"Live");
  }
}

function testSendEmail () {
  const sampleDataRow = {
    email: 'recipient@example.com',
    name: 'John Doe',
    product: 'Example Product',
    //... other fields ...
  };
  sendEmail(
    {
      subject:'Test email for {{name}}',
    template:"<b>Hello world</b> this is a sample <br>email about {{product}} for {{name}}.<br><li>Wow a list</li>"
    },
    sampleDataRow,
    "Test Email"
  );
}


