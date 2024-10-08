const AUTOMATION_SHEET = "Automation (Timer)";
const ACTIVE = "Active";
const AUTOMATION_FIELDS = [
  "Active",
  "Date",
  "Day",
  "Hour",
  "Run Schedule?",
  "Sheets to Hide",
  "Sheets to Show",
  "Sheets to Clear",
  "Days to Clear",
  "Sheets to Sort",
  "Sort Columns",
  "Email Sheet",
  "Sheets to Copy",
  "Copy To",
  "Last run",
  "Errors",
];
const AUTOMATION_DOCS = [
  "",
  "A specific date",
  "A number where 1=Monday,2=Tuesday, etc",
  "The hour after which we should run (1=1am, 13=1pm, etc)",
  "Whether we should run the schedule",
  "Which sheets to hide (if any): comma separated list",
  "Which sheets to show (if any): comma separated list",
  "Which sheets to clear data from (if any): comma separated list",
  "Which days to clear from sheets we are clearing (or ALL to clear all days)",
  "Names of sheets to sort",
  "Headers of columns to sort by in order (we sort left-to-right, so rightmost is most important)",
  "Name of sheet to use for email data",
  "Names of sheets to copy (comma separated)",
  "URL of spreadsheet to Copy Data to",
  "Time of last run",
];
const LASTRUN_COL = "O";
const ERR_COL = "P";

function createTimerSheet() {
  let sheet = setupConfigSheet(AUTOMATION_SHEET, AUTOMATION_FIELDS, true);
  sheet.appendRow(AUTOMATION_DOCS);
  sheet
    .getRange("C3:D")
    .setDataValidation(
      SpreadsheetApp.newDataValidation()
        .requireNumberGreaterThanOrEqualTo(0)
        .build()
    );
  sheet
    .getRange("A3:A")
    .setDataValidation(
      SpreadsheetApp.newDataValidation().requireCheckbox().build()
    );
  sheet
    .getRange("E3:E")
    .setDataValidation(
      SpreadsheetApp.newDataValidation().requireCheckbox().build()
    );
  sheet.getRange("2:2").setWrap(true);
}
function setupTimerSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(AUTOMATION_SHEET);

  if (sheet) {
    // Prompt user for confirmation to clear existing sheet
    let ui = SpreadsheetApp.getUi();
    let response = ui.alert(
      "Clear automation sheet?",
      "Do you want to clear the automation sheet and start over?",
      ui.ButtonSet.YES_NO
    );

    // If YES, ask for additional confirmation and then clear sheet
    if (response == ui.Button.YES) {
      let secondResponse = ui.alert(
        "Confirm Deletion",
        "Really delete all your automation data?",
        ui.ButtonSet.YES_NO
      );

      if (secondResponse == ui.Button.YES) {
        createTimerSheet();
      }
    }
  } else {
    // If sheet doesn't exist, create it
    createTimerSheet();
  }

  // If sheet exists, whether originally or newly created, validate its structure
  sheet = ss.getSheetByName(AUTOMATION_SHEET); // Refresh sheet reference
  validateSheetStructure(sheet, AUTOMATION_FIELDS);
  setupTimers();
  SpreadsheetApp.getUi().alert("Set up automations to run every hour!");
}

function validateSheetStructure(sheet, expectedFields) {
  let headers = sheet.getRange(1, 1, 1, expectedFields.length).getValues()[0];
  for (let i = 0; i < expectedFields.length; i++) {
    if (headers[i] !== expectedFields[i]) {
      // Log or handle any discrepancies between actual and expected headers
      console.error(
        `Expected header "${expectedFields[i]}" but found "${
          headers[i]
        }" in column ${i + 1}.`
      );
    }
  }
}

function setupTimers() {
  // RUN TRIGGERS EVERY HOUR
  ScriptApp.newTrigger("runAutomations").timeBased().everyHours(1).create();
}

function clearTimers() {
  ScriptApp.getScriptTriggers().forEach((trigger) => {
    if (trigger.getTriggerSource() == "CLOCK") {
      console.log("Deleting trigger");
      ScriptApp.deleteTrigger(trigger);
    }
  });
}

function runAutomations() {
  console.log("Wow we are running an automation!");
  let automationData = readSheet(AUTOMATION_SHEET);
  console.log("Got me some data: ", JSON.stringify(automationData));
  let now = new Date();
  for (let row of automationData) {
    if (!row[ACTIVE]) {
      console.log("Ignoring inactive row: ", row);
      continue;
    }
    let isTheDay = false;
    if (row.Date) {
      let dateObject = new Date(row.Date);
      if (
        now.getDate() == dateObject.getDate() &&
        now.getMonth() == dateObject.getMonth() &&
        now.getFullYear() == dateObject.getFullYear()
      ) {
        isTheDay = true;
        console.log("Is the precise date!");
      }
    } else {
      if (now.getDay() == Number(row.Day) % 7) {
        isTheDay = true;
        console.log("It is the right day for rule", row);
      }
    }
    if (isTheDay) {
      if (now.getHours() >= Number(row.Hour)) {
        console.log("Past time to do it!");
        runAutomation(row);
      } else {
        console.log("Not yet!", now.getHours(), ">", row.Hour);
      }
    } else {
      if (row.Day !== "") {
        console.log("Not the day: ", now.getDay(), "!=", row.Day);
      }
      if (row.Date) {
        console.log("Not the date: ", now, "!=", row.Date);
      }
    }
  }
}

function isToday(date) {
  let now = new Date();
  if (
    now.getFullYear() == date.getFullYear() &&
    now.getMonth() == date.getMonth() &&
    now.getDate() == date.getDate()
  ) {
    return true;
  } else {
    return false;
  }
}

function splitAndClean(input) {
  if (typeof input !== "string") return [];
  return input.split(/\s*,\s*/).filter(Boolean);
}

function runAutomation(data) {
  let now = new Date();
  console.log("Run for", data);
  let lastRun = data["Last run"];
  if (lastRun) {
    lastRun = new Date(lastRun);
  }
  if (lastRun && isToday(lastRun)) {
    console.log("Nevermind, already ran today");
  } else {
    try {
      if (data["Run Schedule?"]) {
        createSchedule();
      }
      if (data["Sheets to Clear"]) {
        const sheets = splitAndClean(data["Sheets to Clear"]);
        const dayValue = data["Days to Clear"];
        let days;
        if (dayValue.toUpperCase() == "ALL") {
          days = "ALL";
        } else {
          days = dayValue.split(",");
          days = days.map((s) => s.replace(/^\s|\s$/g, ""));
        }
        clearSheets(sheets, days);
      }
      if (data["Sheets to Hide"]) {
        const sheets = splitAndClean(data["Sheets to Hide"]);
        hideSheets(sheets);
      }
      if (data["Sheets to Show"]) {
        const sheets = splitAndClean(data["Sheets to Show"]);
        showSheets(sheets);
      }
      if (data["Sheets to Sort"] && data["Sort Columns"]) {
        let sheets = splitAndClean(data["Sheets to Sort"]);
        let columns = splitAndClean(data["Sort Columns"]);
        console.log("Sort sheets", sheets, "by columns", columns);
        sortSheets(sheets, columns);
      }
      if (data["Email Sheet"]) {
        console.log("Emailing sheet!");
        emailSheet(data["Email Sheet"], "Live");
      }
      if (data["Sheets to Copy"] && data["Copy To"]) {
        let sheets = splitAndClean(data["Sheets to Copy"]);
        let copyTo = data["Copy To"];
        console.log("Copy sheets", sheets, "to", copyTo);
        copySheets(sheets, copyTo);
      }
      console.log("Running now!");
      SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(AUTOMATION_SHEET)
        .getRange(`${LASTRUN_COL}${data.__row}`)
        .setValue(new Date());
    } catch (err) {
      console.log("Ran into error:", err);
      SpreadsheetApp.getActiveSpreadsheet()
        .getSheetByName(AUTOMATION_SHEET)
        .getRange(`${ERR_COL}${data.__row}`)
        .setValue(JSON.stringify(err));
      throw err;
    }
  }
}

function isName(s) {
  return s && s != "null";
}

function testClearSheet() {
  clearSheets(["Weekly Placement Requests"]);
}

function clearSheets(sheetnames, days = "ALL") {
  for (let sheetname of sheetnames.filter(isName)) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
    if (sheet) {
      if (days == "ALL") {
        //Clear all the columns from 2nd on...
        let lastCol = sheet.getLastColumn();
        let lastRow = sheet.getLastRow();
        // Only clear from second column...
        let range = sheet.getRange(2, 1, lastRow - 1, lastCol);
        // First save our formulas...
        let formulas = range.getFormulas();
        range.clearContent();
        // restore formulas
        range.setFormulas(formulas);
      } else {
        let headers = sheet.getRange("1:1").getValues()[0];
        // Find which headers match our list of days to clear
        let columnsToClear = [];
        let daysFound = [];
        for (let i = 0; i < headers.length; i++) {
          const h = headers[i];
          if (days.indexOf(h) > -1) {
            columnsToClear.push(i);
            daysFound.push(h);
          }
        }
        let lastRow = sheet.getLastRow();
        for (let c of columnsToClear) {
          let range = sheet.getRange(2, c + 1, lastRow - 1, 1);
          range.clearContent();
        }
        for (let d of days) {
          if (daysFound.indexOf(d) == -1) {
            console.log("DID NOT FIND COLUMN", d, "WARNING...");
          }
        }
      }
    } else {
      SpreadsheetApp.getUi().alert(
        `Did not find sheet named "${sheetname}" to clear. Sheet is listed in automation configuration on sheet ${AUTOMATION_SHEET}`
      );
    }
  }
}

function showSheets(sheetnames) {
  for (let sheetname of sheetnames.filter(isName)) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
    if (sheet) {
      sheet.showSheet();
    } else {
      SpreadsheetApp.getUi().alert(
        `Did not find sheet named "${sheetname}" to show. Sheet is listed in automation configuration on sheet ${AUTOMATION_SHEET}`
      );
    }
  }
}

function hideSheets(sheetnames) {
  for (let sheetname of sheetnames.filter(isName)) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetname);
    if (sheet) {
      sheet.hideSheet();
    } else {
      SpreadsheetApp.getUi().alert(
        `Did not find sheet named "${sheetname} to hide. Sheet is listed in automation configuration on sheet ${AUTOMATION_SHEET}`
      );
    }
  }
}
