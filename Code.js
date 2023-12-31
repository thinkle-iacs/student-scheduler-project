/* This just creates our menu setup */
function onOpen(e) {
  let createMenu = SpreadsheetApp.getUi()
    .createMenu("Setup")
    .addItem("1. Start Set Up", "setupInitialConfig")
    .addItem("2. Set Up Placement Options", "setupPlacementOptions")
    .addItem("3. Add Placement/Request Sheet", "createPlacementSheet")
    .addItem("4. Set Up Timers", "setupTimerSheet")
    .addItem("5. Set Up Email", "setupEmailSheet");

  SpreadsheetApp.getUi()
    .createMenu("Schedule Tool")
    .addSubMenu(createMenu)
    .addItem('Test Email Template',"showTemplateForSheetInteractive")
    .addItem('Send Test Email',"sendTestEmailForSheetInteractive")
    .addItem('Send Email for Sheet NOW',"sendEmailForSheetInteractive")
    /*.addItem(
    'Generate Form',
    'generateForm'
  )
  */
    .addItem("Make Schedule", "createSchedule")
    .addItem("Run automations NOW (manually run)", "runAutomations")
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Show/Hide Sheets")
        .addItem("Show Schedules", "showSchedules")
        .addItem("Hide Schedules", "hideSchedules")
        .addSeparator()
        .addItem("Show Setup Sheets", "showSetup")
        .addItem("Hide Setup Sheets", "hideSetup")
        .addSeparator()
        .addItem("Show placement sheets", "showPlacements")
        .addItem("Hide placement sheets", "hidePlacements")
    )
    .addSubMenu(
      SpreadsheetApp.getUi()
        .createMenu("Break Down")
        .addItem("Turn off timers", "clearTimers")
        .addItem("Clear ALL", "clearAll")
    )

    .addToUi();
}
