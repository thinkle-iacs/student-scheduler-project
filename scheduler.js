const TINY = ["Username", "ID", "Limit", "Notes"];
const BOLD = ["Name", "Activity"];
const WRAP = ["Name", "Activity", "Notes"];

function Scheduler() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  let schedules = {};
  this.schedules = schedules;
  let days = getDays();

  for (let d of days) {
    schedules[d] = {};
  }

  this.readSchedules = () => {
    let slotSheet = ss.getSheetByName(PLACEMENT_SHEET);
    let jsonData = sheetToJson(slotSheet);
    for (let slotRow of jsonData) {
      for (let d of days) {
        if (slotRow[d]) {
          schedules[d][slotRow.Activity] = {
            ...slotRow,
            roster: [],
          };
        }
      }
    }
  };

  this.readStudents = () => {
    let studentSheet = ss.getSheetByName(STUDENT_SHEET);
    let jsonData = sheetToJson(studentSheet);
    this.students = jsonData;
    this.studentMap = {};
    for (let s of jsonData) {
      s.schedule = {};
      for (let d of days) {
        s.schedule[d] = null;
      }
      this.studentMap[s.Username] = s;
      this.studentMap[s.ID] = s;
    }
  };

  this.init = () => {
    this.readStudents();
    this.readSchedules();
  };

  this.scheduleSheet = (sheetName) => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      throw `Expected sheet "${sheetName}" but did not find it`;
    }
    let jsonData = sheetToJson(sheet);
    for (let row of jsonData) {
      const students = this.students;
      let student = this.studentMap[row.Username] || this.studentMap[row.ID];
      if (!student) {
        if (row.Username || row.ID) {
          console.log("Did not find student for row", row);
        }
        continue;
      }
      for (let d of days) {
        if (row[d]) {
          if (!student.notes) {
            student.notes = {};
          }
          if (!student.notes[d]) {
            student.notes[d] = [];
          }
          let request = row[d];
          let requestedBlock = this.schedules[d][request];
          if (!requestedBlock) {
            console.log("Weird, no requested block");
            continue;
            debugger;
          }
          if (student.schedule[d]) {
            console.log(
              `Ignoring request from ${sheetName} for ${request} on ${d}: student already scheduled.`
            );
            student.notes[d].push(
              `Unable to give request from ${sheetName} for ${request} on ${d}: student already scheduled.`
            );
          } else if (
            requestedBlock.Limit &&
            requestedBlock.roster.length >= requestedBlock.Limit
          ) {
            student.notes[d].push(
              `Unable to give request from ${sheetName} for ${request} on ${d}: already at limit of ${requestedBlock.Limit}`
            );
          } else {
            student.schedule[d] = requestedBlock;
            requestedBlock.roster.push(student);
            student.notes[d].push(`Honored request from ${sheetName}`);
          }
        }
      }
    }
  };

  this.writeOutput = function () {
    for (let d of days) {
      const FIELDS = [
        "Present",
        ...STUDENT_FIELDS,
        ...PLACEMENT_FIELDS,
        "Notes",
      ];
      let sheet = setupConfigSheet(`${d} Schedule`, FIELDS, true);
      this.students.sort((a, b) => {
        let scheduleA = a.schedule[d];
        let scheduleB = b.schedule[d];
        if (scheduleA && !scheduleB) {
          return -1;
        } else if (scheduleB && !scheduleA) {
          return 1;
        } else if (!scheduleA) {
          return 0;
        } else if (scheduleA.Name > scheduleB.Name) {
          return 1;
        } else if (scheduleB.Name > scheduleA.Name) {
          return -1;
        } else {
          return 0;
        }
      });
      let rows = [];
      for (let s of this.students) {
        let row = [false];
        for (let sf of STUDENT_FIELDS) {
          row.push(s[sf]);
        }
        for (let pf of PLACEMENT_FIELDS) {
          if (s.schedule[d]) {
            row.push(s.schedule[d][pf]);
          } else {
            row.push("");
          }
        }
        if (s.notes && s.notes[d]) {
          // HARDCODING NOTES WITH THE WORDS 'Default Placement' NOT TO SHOW UP
          let notes = s.notes[d].filter(
            (n) => n.indexOf("Default Placement") == -1
          );
          //row.push(s.notes[d].join('\n'));
          row.push(notes.join("\n"));
        } else {
          row.push("");
        }
        rows.push(row);
      }
      sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
      sheet
        .getRange("A2:A")
        .setDataValidation(
          SpreadsheetApp.newDataValidation().requireCheckbox().build()
        );

      sheet.setFrozenRows(1);
      sheet.setFrozenColumns(1);
      let existingFilter = sheet.getDataRange().getFilter();
      if (existingFilter) {
        existingFilter.remove();
      }
      sheet
        .getDataRange()
        .createFilter()
        .sort(FIELDS.indexOf("Name") + 1, true)
        .sort(FIELDS.indexOf("Activity") + 1, true);
      applyFormatting(sheet, FIELDS);
    }
  };
}

function applyFormatting(sheet, FIELDS) {
  //let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('foo');
  for (let column of TINY) {
    let index = FIELDS.indexOf(column) + 1;
    let range = sheet.getRange(1, index, sheet.getLastRow() - 1, 1);
    range.setFontSize(7);
    range.setFontStyle("italic");
    range.setFontColor("#444444");
  }
  for (let column of BOLD) {
    let index = FIELDS.indexOf(column) + 1;
    let range = sheet.getRange(1, index, sheet.getLastRow() - 1, 1);
    range.setFontSize(10);
    range.setFontWeight("bold");
    range.setFontColor("black");
  }
  for (let column of WRAP) {
    let index = FIELDS.indexOf(column) + 1;
    let range = sheet.getRange(1, index, sheet.getLastRow() - 1, 1);
    console.log(
      "Set wrap on",
      sheet.getName(),
      "range",
      range.getFormula(),
      "with # of rows: ",
      range.getNumRows()
    );
    range.setWrap(true);
  }
}

function createSchedule() {
  let ss = SpreadsheetApp.getActiveSpreadsheet();
  let placementSheets = ss
    .getSheetByName(PLACEMENT_SHEET_LIST)
    .getDataRange()
    .getValues();
  placementSheets = placementSheets.slice(1);
  placementSheets.sort((a, b) => a[1] - b[1]);
  let scheduler = new Scheduler();
  scheduler.init();
  for (let sheetRow of placementSheets) {
    console.log("Run for ", sheetRow[0]);
    scheduler.scheduleSheet(sheetRow[0]);
  }
  scheduler.writeOutput();
}
