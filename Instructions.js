/* Instructions.js Last Update 2025-08-24 21:11:31 <e34733e35b5ef0601d7431ddfea6d5cf452e3cd8ec8b7cfe2c6e4794caa3b00b>
/* eslint-disable no-unused-vars */
/* global getCellUrl, getSheetUrl, setRichInstructions, SpreadsheetApp,
  SHEET_SYMBOLS, SHEET_LEVELSETTINGS, MENU, PLACEMENT_SHEET, PLACEMENT_SHEET_LIST,
  EMAIL_SHEET, AUTOMATION_SHEET, DAY_SHEET, STUDENT_SHEET
*/
/* exported writePostSetupInstructions */

let counters = {
  default: 1,
}
function step(counter = 'default') {
  if (!counters[counter]) {
    counters[counter] = 1;
  }
  let stepString = `${counters[counter]}`;
  counters[counter]++;
  return stepString;
}

const blurbs = {
  'TOC_ROW': 1,
  'Intro': 'A2',
  'About': 'A3',
  'Setup': 'A4',
  'Placements': 'A5',
  'Requests': 'A6',
  'Scheduling': 'A7',
  'Automation': 'A8',
  'Emailing': 'A9',
  'Tips': 'A10'
};


function writePostSetupInstructions() {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName('Instructions');
  if (!sheet) {
    sheet = ss.insertSheet('Instructions');
  }
  sheet.clear();

  // Use MENU object for all menu item references
  const tocItems = [
    { key: 'About', label: 'About' },
    { key: 'Setup', label: 'Initial Setup' },
    { key: 'Placements', label: 'Placement Options' },
    { key: 'Requests', label: 'Request Sheets' },
    { key: 'Scheduling', label: 'Generating Schedules' },
    { key: 'Automation', label: 'Automation' },
    { key: 'Emailing', label: 'Emailing Schedules' },
    { key: 'Tips', label: 'Tips & Troubleshooting' }
  ];
  const tocCols = tocItems.length;
  for (let c = 1; c <= tocCols; c++) {
    sheet.setColumnWidth(c, 220);
  }
  sheet.setFrozenRows(1);
  tocItems.forEach((item, idx) => {
    const col = idx + 1;
    const anchorRange = sheet.getRange(blurbs[item.key]);
    const url = getCellUrl(anchorRange);
    setRichInstructions(
      sheet.getRange(1, col),
      `<div style="text-align:center"><a href="${url}"><b>${item.label}</b></a></div>`
    );
  });
  for (let row = 2; row < 20; row++) {
    sheet.getRange(row, 1, 1, tocCols).merge();
  }


  // Overview and Quick Start
  setRichInstructions(
    sheet.getRange(blurbs['Intro']),
    `<h1>Student Scheduler - Complete Guide</h1>
    <p>This tool helps you manage flexible blocks, extra help, or choice sessions by automatically scheduling students into activities based on requests and priorities. Use the links above to jump to a section.</p>`);
  setRichInstructions(
    sheet.getRange(blurbs['About']),
    `<h2>About This Tool</h2>
    <p>This scheduler is designed for schools running "flex blocks", "extra help", or "choice" periods. It supports multiple levels of requests (e.g., teacher request, student request, fallback/spillover), manages room limits, and generates daily schedules with feedback for each student.</p>
    <ul>
      <li>Supports unlimited days, activities, and students.</li>
      <li>Handles multiple request sources with priorities (e.g., teacher, student, fallback).</li>
      <li>Automatically enforces room/activity limits.</li>
      <li>Provides clear feedback if a request can't be honored.</li>
      <li>Includes automation and email features for streamlined workflow.</li>
    </ul>`
  );

  // Stage 1: Initial Setup
  setRichInstructions(
    sheet.getRange(blurbs['Setup']),
    `<h2>Step ${step()}: Initial Setup</h2>
    <p>Use the <b>${MENU.setupMenu}</b> menu to set up your scheduler. Start with:</p>    
    <ul>
      <li><b>${MENU.setupInitialConfig}</b>: Creates the ${DAY_SHEET} and ${STUDENT_SHEET} sheets.</li>
    </ul>
    <p>After filling in the ${DAY_SHEET} sheet with the days you want to create schedules for (can be any names for separately
    scheduled days or blocks depending on your needs -- e.g. "Monday", "Thursday" or "Flex A" "Flex B" or
    whatever works internally). You can then move onto the next steps.</p>      
    `
  );
  setRichInstructions(
    sheet.getRange(blurbs['Placements']),
    `<h3>Step ${step()}: Define Placement Options</h3>
    <p>Once you've defined days, you can generate placement options using <b>${MENU.setupPlacementOptions}</b> in the ${MENU.setupMenu} menu.</p>    
    <p>Use the <b>${PLACEMENT_SHEET}</b> sheet to list all activities, sessions, or rooms available for scheduling. For each option, specify:</p>
    <ul>
      <li><b>Activity</b>: The name of the session or event.</li>
      <li><b>Staff</b>: The staff member responsible.</li>
      <li><b>Room</b>: The location for the activity.</li>
      <li><b>Limit</b>: The maximum number of students allowed.</li>
      <li>For each day, check the box if the activity is available that day.</li>
    </ul>
    <p>You can edit this sheet at any time to add, remove, or update options.</p>`
  );
  setRichInstructions(
    sheet.getRange(blurbs['Requests']),
    `<h3>Step ${step()}: Add Request Sheets</h3>
    <p>You can have one or more request sheets, each representing a different level of request (e.g., teacher request, student request, fallback/spillover). The <b>${PLACEMENT_SHEET_LIST}</b> sheet lists all request sheets and their priority (lower number = higher priority).</p>
    <p>To add additional request sheets beyond the first one, use <b>${MENU.createPlacementSheet}</b> in the ${MENU.setupMenu} menu.</p>
    <p>Each request sheet lets you map students to activities for the days you've defined. The precedence of request sheets is 
    managed on the sheet named <b>${PLACEMENT_SHEET_LIST}</b>.</p>
    <ul>
      <li>Each request sheet allows you to assign or request students for activities.</li>
      <li>Priority determines which requests are honored first if there are conflicts or limits.</li>
      <li>You can add as many request sheets as needed for your workflow.</li>
    </ul>
    <p>Typical use: Teacher requests (priority 1), student requests (priority 2), fallback/spillover (priority 3).</p>`
  );

  setRichInstructions(
    sheet.getRange(blurbs['Scheduling']),
    `<h3>Step ${step()}: Generate Schedules</h3>
    <p>Once your placement options and request sheets are ready, use <b>${MENU.makeSchedule}</b> in the ${MENU.scheduleToolMenu} menu to generate daily schedules. The scheduler will:</p>
    <ul>
      <li>Assign students to activities based on request priority and room limits.</li>
      <li>Provide feedback in the "Notes" column if a request can't be honored (e.g., activity full).</li>
      <li>Create a separate schedule tab for each day, with checkboxes for attendance.</li>
    </ul>
    <p>You can re-run the scheduler at any time after updating requests or options.</p>`
  );
  setRichInstructions(
    sheet.getRange(blurbs['Automation']),
    `<h3>Step ${step()}: Automation</h3>
    <p>Use <b>${MENU.setupTimerSheet}</b> in the ${MENU.setupMenu} menu to create or reset the ${AUTOMATION_SHEET} sheet. This sheet lets you schedule a series of actions to run automatically, such as generating schedules, sorting, emailing, copying, and showing or hiding sheets. Each row is a rule with options for when and what to run.</p>
    <ul>
      <li>To manually run automations at any time, use <b>${MENU.runAutomations}</b> in the ${MENU.scheduleToolMenu} menu.</li>
      <li>To turn off all timers, use <b>${MENU.turnOffTimers}</b> in the ${MENU.breakDownMenu} submenu.</li>
    </ul>
    <p>Key columns in ${AUTOMATION_SHEET} include:</p>
    <ul>
      <li>Active: Checkbox to enable or disable the rule.</li>
      <li>Date: Run on a specific date (optional).</li>
      <li>Day: Day of week (1=Monday, 2=Tuesday, ...).</li>
      <li>Hour: Hour to run (24-hour, e.g., 8=8am, 13=1pm).</li>
      <li>Run Schedule?: Checkbox to generate schedules.</li>
      <li>Sheets to Hide/Show/Clear/Sort: Comma-separated list of sheet names.</li>
      <li>Days to Clear: Which days to clear from sheets (or ALL).</li>
      <li>Sort Columns: Columns to sort by (for each sheet).</li>
      <li>Email Sheet: Name of sheet to email using templates.</li>
      <li>Sheets to Copy: Sheets to copy to another spreadsheet.</li>
      <li>Copy To: URL of destination spreadsheet.</li>
    </ul>
    <p>To set up or manage automation triggers, use the custom menu in the sheet (no need to visit Apps Script directly).</p>
    <h4>Example: Weekly Flex Block Automation</h4>
    <ul>
      <li>Wednesday 8:00: Generate and show the schedule tab, sorted by student, so teachers can announce placements.</li>
      <li>Wednesday 12:00: Sort the schedule tab by activity for attendance-taking.</li>
      <li>Wednesday 15:00: Copy attendance data to a log sheet for record-keeping.</li>
      <li>Thursday 7:00: Hide the Wednesday schedule and show the sign up sheets for next week requests.</li>
    </ul>
    <p>Each of these steps can be a row in the ${AUTOMATION_SHEET} sheet, with the appropriate day, hour, and actions set. You can also automate emailing, clearing, and more. See the ${AUTOMATION_SHEET} sheet for column documentation and examples.</p>`
  );
  setRichInstructions(
    sheet.getRange(blurbs['Emailing']),
    `<h3>Step ${step()}: Emailing Schedules</h3>
    <p>Use <b>${MENU.setupEmailSheet}</b> in the ${MENU.setupMenu} menu to create or reset the ${EMAIL_SHEET} sheet. This sheet is where you define all your email templates. Each row specifies:</p>
    <ul>
      <li>Description: Name for your template (for your reference).</li>
      <li>SheetName: The name of the schedule or placement sheet this template applies to (e.g., "Wednesday Schedule").</li>
      <li>Column: The column to match on (e.g., "Advisory").</li>
      <li>Value: The value to match in that column (or DEFAULT for a fallback template).</li>
      <li>Subject: The subject line for the email (can use <code>{{column}}</code> placeholders).</li>
      <li>Template: The body of the email, using <code>{{column}}</code> placeholders for dynamic content (e.g., <code>{{Name}}</code>, <code>{{Activity}}</code>, <code>{{Room}}</code>).</li>
    </ul>
    <p>To preview, test, or send emails, use the following options in the ${MENU.scheduleToolMenu} menu:</p>
    <ul>
      <li><b>${MENU.testEmailTemplate}</b>: Preview the email template for the current sheet.</li>
      <li><b>${MENU.sendTestEmail}</b>: Send a test email to a specified address.</li>
      <li><b>${MENU.sendEmailForSheet}</b>: Send emails for the current sheet to all recipients.</li>
    </ul>
    <p>Each schedule or placement sheet will get an Email Status column to track which rows have been emailed and log errors/status. You can automate emailing as part of your ${AUTOMATION_SHEET} rules by filling the Email Sheet column.</p>
    <h4>Example Email Template Row</h4>    
Description: Wednesday Placement
SheetName: Wednesday Schedule
Column: Advisory
Value: DEFAULT
Subject: Your Wednesday Flex Block Placement
Template: Hello {{Name}},Your Wednesday activity is {{Activity}} in {{Room}} with {{Staff}}. See you there!  
    <p>See the ${EMAIL_SHEET} sheet for more details and add your own templates as needed. You can have multiple templates for different groups, advisories, or activities.</p>`
  );
  // Add a section for Show/Hide Sheets and Break Down menu items
  setRichInstructions(
    sheet.getRange(blurbs['Tips']),
    `<h3>Tips & Troubleshooting</h3>
    <ul>
      <li>Use the <b>${MENU.showHideSheetsMenu}</b> submenu in the ${MENU.scheduleToolMenu} menu to show or hide Schedules, Setup Sheets, or Placement Sheets as needed:</li>
      <ul>
        <li><b>${MENU.showSchedules}</b> / <b>${MENU.hideSchedules}</b></li>
        <li><b>${MENU.showSetup}</b> / <b>${MENU.hideSetup}</b></li>
        <li><b>${MENU.showPlacements}</b> / <b>${MENU.hidePlacements}</b></li>
      </ul>
      <li>To turn off all timers or clear all automation, use the <b>${MENU.breakDownMenu}</b> submenu:</li>
      <ul>
        <li><b>${MENU.turnOffTimers}</b>: Turn off all automation triggers.</li>
        <li><b>${MENU.clearAll}</b>: Clear all automation and configuration data.</li>
      </ul>
      <li>Check the "Notes" column in schedules for feedback on unfulfilled requests.</li>
      <li>Update placement options and requests as needed—re-run the scheduler to refresh schedules.</li>
      <li>Room/limit issues? Double-check your ${PLACEMENT_SHEET} sheet for correct limits and availability.</li>
      <li>For automation and emailing, make sure you have the right permissions and triggers set up in Apps Script.</li>
    </ul>
    <p>For more help, see the ABOUT sheet or contact your system administrator.</p>`
  );

  // Set column widths for readability (content spans the first N TOC columns)
  // Keep column 1 wide enough for merged paragraphs; the others are already set above.
  // Our width should be either 60px per heading OR 850px for the merged, whichever is
  // bigger...
  let colWidth = 850 / tocCols;
  if (colWidth < 60) {
    colWidth = 60;
  }
  for (let c = 1; c <= tocCols; c++) {
    sheet.setColumnWidth(c, colWidth);
  }
}