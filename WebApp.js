function doGet(e) {
  let template = HtmlService.createTemplateFromFile("WebForm.html");
  template.param = e.parameters.option;
  return template.evaluate();
  //return HtmlService.createHtmlOutputFromFile('WebForm.html');
}

function getWebUser() {
  return Session.getActiveUser().getEmail();
}

function getFormData() {
  let placements = getPlacementOptions();
  let sheets = getPlacementSheets();
  let days = getDays();
  let students = getStudents();
  return {
    placements,
    sheets,
    days,
    students,
  };
}
