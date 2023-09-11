function onOpen(e) {
  let createMenu = SpreadsheetApp.getUi()
    .createMenu("Setup")
    .addItem("1. Start Set Up", "setupInitialConfig")
    .addItem("2. Set Up Placement Options", "setupPlacementOptions")
    .addItem("3. Add Placement/Request Sheet", "createPlacementSheet")
    .addItem("4. Set Up Timers", "setupTimerSheet");

  SpreadsheetApp.getUi()
    .createMenu("Schedule Tool")
    .addSubMenu(createMenu)
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
