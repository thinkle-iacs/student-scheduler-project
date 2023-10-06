const EMAIL_SHEET = "Email Templates";
const EMAIL_FIELDS = [
  "Description",
  "SheetName",
  "Column",
  "Value",
  "Subject",
  "Template",
];
const EMAIL_DOCS = [
  "Name of template",
  "Name of the sheet this template applies to",
  "Column to match on",
  "Value to match (or DEFAULT for default template)",
  "Subject line of email",
  "Email template, using {{column name}} to insert columns",
];

function setupEmailSheet() {
  let sheet = setupConfigSheet(EMAIL_SHEET, EMAIL_FIELDS);
  sheet.appendRow(EMAIL_DOCS);
}

function getTemplateForDataRow(dataRow, sheetName) {
  let dataSheet = readSheet(EMAIL_SHEET, true);
  let defaultTemplate = null;

  for (let row of dataSheet) {
    // Skip this row if the sheet name does not match
    if (row.SheetName !== sheetName) continue;

    // Handle default template separately
    if (row.Value == "DEFAULT") {
      defaultTemplate = {
        subject: row.Subject,
        template: row.Template,
      };
    }
    // Match based on column value and use this template
    else if (dataRow[row.Column] == row.Value) {
      return {
        subject: row.Subject,
        template: row.Template,
      };
    }
  }

  // If no matching template was found, return the default (which might be null)
  return defaultTemplate;
}

function applyTemplate(template, row) {
  return (filledTemplate = template.template.replace(
    /\{\{([^\}]+)\}\}/g,
    function (_, key) {
      key = key.trim();
      var value = row[key];
      // Check if the value is boolean and replace with respective HTML.
      if (typeof value === "boolean") {
        if (value) {
          return '<span style="color: green;">✔</span>';
        } else {
          return '<span style="color: red;">✖</span>';
        }
      }
      // Special handling for currentDate placeholder
      if (key === "currentDate") {
        return getFormattedCurrentDate();
      }
      if (key.startsWith("currentDate")) {
        var daysToAdd = parseInt(key.split("+")[1]) || 0; // Extract number of days to add
        return getFormattedCurrentDate(daysToAdd);
      }

      return value.trim().replace(/\n/g, "\n<br>\n") || "";
    }
  ));
}

function getTestRowIndex(data) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rowNumber = sheet.getActiveRange().getRow() - 1;
  if (rowNumber == 0) {
    console.log("Header selected... ignore");
    return 0;
  } else if (rowNumber >= data.length) {
    console.log("Too long...");
    return data.length - 1;
  } else {
    return rowNumber - 1; // trim header
  }
}

function emailSheet(sheetName, mode = "Show Template", testEmailAddress = "") {
  // Example implementation; specifics might depend on your use case and email sending mechanism.
  let dataSheet = readSheet(sheetName, true);
  let testIndex = getTestRowIndex(dataSheet);
  for (let i = 0; i < dataSheet.length; i++) {    
    if (mode == "Show Template" || mode == "Test Email") {
      // We only do the test index if we are in test mode...
      if (i != testIndex) continue;
    }
    let dataRow = dataSheet[i];
    let template = getTemplateForDataRow(dataRow, sheetName);
    if (template) {
      sendEmail(template, dataRow, mode, testEmailAddress);
    } else {
      console.log(
        "No applicable template found for row",
        dataRow,
        testEmailAddress
      );
    }
  }
}

function testEmailSheet() {
  emailSheet("Friday Schedule", "Show Template");
}

function sendEmail(
  template,
  dataRow,
  mode = "Show Template",
  testEmailAddress = ""
) {
  const filledSubject = applyTemplate({ template: template.subject }, dataRow);
  const filledBody = applyTemplate({ template: template.template }, dataRow);

  switch (mode) {
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
      GmailApp.sendEmail(testEmailAddress, filledSubject, "", {
        htmlBody: filledBody,
      });
      break;

    case "Live":
      // Sending to actual recipient
      // Assuming dataRow has an 'email' property which holds recipient email address
      GmailApp.sendEmail(dataRow.Email || dataRow.Username, filledSubject, "", {
        htmlBody: filledBody,
      });
      break;

    default:
      console.error("Invalid mode provided to sendEmail function.");
  }
}

async function showTemplateForSheetInteractive() {
  let activeSheet = SpreadsheetApp.getActiveSheet().getName();
  let sheetName = activeSheet;
  if (activeSheet == EMAIL_SHEET || activeSheet == AUTOMATION_SHEET) {
    sheetName = await getSheetFromUser("Select sheet to show template for.");
  }
  emailSheet(sheetName, "Show Template");
}

async function sendTestEmailForSheetInteractive() {
  let sheetName = await getSheetFromUser(
    "Select sheet to send test email for."
  );
  const testEmailAddress = SpreadsheetApp.getUi()
    .prompt("Enter a test email address")
    .getResponseText();
  emailSheet(sheetName, "Test Email", testEmailAddress);
}

function requestConfirmationFromUser() {
  const ui = SpreadsheetApp.getUi();

  const result = ui.prompt(
    "Confirmation Needed",
    'Please enter the phrase: "Send email and I mean it!" to continue.',
    ui.ButtonSet.OK_CANCEL
  );

  // Check if the user clicked "OK".
  if (result.getSelectedButton() == ui.Button.OK) {
    if (result.getResponseText() === "Send email and I mean it!") {
      // Proceed with the desired action here.
      console.log("Confirmed! Proceeding with action...");
      return true;
    } else {
      ui.alert("Wrong phrase entered. Action aborted.");
      return false;
    }
  } else {
    console.log("User cancelled the action.");
    return false;
  }
}

async function sendEmailForSheetInteractive() {
  let sheetName = await getSheetFromUser("Select sheet to send email for");
  if (requestConfirmationFromUser()) {
    emailSheet(sheetName, "Live");
  }
}

function testSendEmail() {
  const sampleDataRow = {
    email: "recipient@example.com",
    name: "John Doe",
    product: "Example Product",
    //... other fields ...
  };
  sendEmail(
    {
      subject: "Test email for {{name}}",
      template:
        "<b>Hello world</b> this is a sample <br>email about {{product}} for {{name}}.<br><li>Wow a list</li>",
    },
    sampleDataRow,
    "Test Email"
  );
}

/* Date utilities */
function getFormattedCurrentDate(n) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + (n || 0)); // Adds n days if n is provided
  var timeZone = spreadsheet.getSpreadsheetTimeZone();
  var locale = spreadsheet.getSpreadsheetLocale();
  var formattedDate = Utilities.formatDate(
    currentDate,
    timeZone,
    getDateFormat(locale)
  );
  return formattedDate;
}
function getDateFormat(locale) {
  // Common date formats. Add/change as per your needs.
  var dateFormats = {
    en_US: "MMMM dd, yyyy",
    en_GB: "dd MMMM yyyy",
    // Add more locale-format pairs as needed
  };

  return dateFormats[locale] || "yyyy-MM-dd"; // Default to ISO date format if locale not mapped
}
