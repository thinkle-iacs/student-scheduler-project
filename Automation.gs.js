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
  "Time of last run",
];
const LASTRUN_COL = "M";
const ERR_COL = "N";

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
  createTimerSheet();
  setupTimers();
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
        const sheets = data["Sheets to Clear"].split(",");
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
        const sheets = data["Sheets to Hide"].split(",");
        hideSheets(sheets);
      }
      if (data["Sheets to Show"]) {
        const sheets = data["Sheets to Show"].split(",");
        showSheets(sheets);
      }
      if (data["Sheets to Sort"] && data["Sort Columns"]) {
        let sheets = data["Sheets to Sort"].split(",");
        let columns = data["Sort Columns"].split(",");
        console.log("Sort sheets", sheets, "by columns", columns);
        sortSheets(sheets, columns);
      }
      if (data['Email Sheet']) {
        console.log('Emailing sheet!');
        emailSheet(data['Email Sheet']);
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
