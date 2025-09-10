// Menu item labels as constants for consistency
const MENU = {
  setupInitialConfig: "1. Start Set Up",
  setupPlacementOptions: "2. Set Up Placement Options",
  createPlacementSheet: "3. Add Placement/Request Sheet",
  setupTimerSheet: "4. Set Up Timers",
  setupEmailSheet: "5. Set Up Email",
  testEmailTemplate: "Test Email Template",
  sendTestEmail: "Send Test Email",
  sendEmailForSheet: "Send Email for Sheet NOW",
  makeSchedule: "Make Schedule",
  runAutomations: "Run automations NOW (manually run)",
  showSchedules: "Show Schedules",
  hideSchedules: "Hide Schedules",
  showSetup: "Show Setup Sheets",
  hideSetup: "Hide Setup Sheets",
  showPlacements: "Show placement sheets",
  hidePlacements: "Hide placement sheets",
  turnOffTimers: "Turn off timers",
  clearAll: "Clear ALL",
  showHideSheetsMenu: "Show/Hide Sheets",
  breakDownMenu: "Break Down",
  setupMenu: "Setup",
  scheduleToolMenu: "Schedule Tool"
};

function onOpen(e) {
  let createMenu = SpreadsheetApp.getUi()
    .createMenu(`${MENU.setupMenu}`)
    .addItem(`${MENU.setupInitialConfig}`, "setupInitialConfig")
    .addItem(`${MENU.setupPlacementOptions}`, "setupPlacementOptions")
    .addItem(`${MENU.createPlacementSheet}`, "createPlacementSheet")
    .addItem(`${MENU.setupTimerSheet}`, "setupTimerSheet")
    .addItem(`${MENU.setupEmailSheet}`, "setupEmailSheet");

  SpreadsheetApp.getUi()
    .createMenu(`${MENU.scheduleToolMenu}`)
    .addSubMenu(createMenu)
    .addItem(`${MENU.testEmailTemplate}`, "showTemplateForSheetInteractive")
    .addItem(`${MENU.sendTestEmail}`, "sendTestEmailForSheetInteractive")
    .addItem(`${MENU.sendEmailForSheet}`, "sendEmailForSheetInteractive")
    /*.addItem(
    'Generate Form',
    'generateForm'
  )
  */
    .addItem(`${MENU.makeSchedule}`, "createSchedule")
    .addItem(`${MENU.runAutomations}`, "runAutomations")
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu(`${MENU.showHideSheetsMenu}`)
        .addItem(`${MENU.showSchedules}`, "showSchedules")
        .addItem(`${MENU.hideSchedules}`, "hideSchedules")
        .addSeparator()
        .addItem(`${MENU.showSetup}`, "showSetup")
        .addItem(`${MENU.hideSetup}`, "hideSetup")
        .addSeparator()
        .addItem(`${MENU.showPlacements}`, "showPlacements")
        .addItem(`${MENU.hidePlacements}`, "hidePlacements")
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu(`${MENU.breakDownMenu}`)
        .addItem(`${MENU.turnOffTimers}`, "clearTimers")
        .addItem(`${MENU.clearAll}`, "clearAll")
    )
    .addToUi();
}
