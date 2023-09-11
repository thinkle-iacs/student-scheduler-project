let firsts = [
  "Mohammed",
  "Bob",
  "Jamie",
  "Teri",
  "Ryan",
  "Alondra",
  "Marisol",
  "Luzdivina",
  "Perry",
  "George",
  "Ray",
  "Ryan",
  "Emma",
  "Liam",
  "Sophia",
  "Noah",
  "Olivia",
  "Jackson",
  "Ava",
  "Lucas",
  "Isabella",
  "William",
  "Mia",
  "Benjamin",
  "Charlotte",
  "Elijah",
  "Amelia",
  "James",
  "Harper",
  "Alexander",
  "Evelyn",
  "Michael",
  "Grace",
  "Henry",
  "Abigail",
  "Oliver",
  "Emily",
  "Daniel",
  "Elizabeth",
  "David",
  "Lily",
  "Sofia",
  "Chen",
  "Ravi",
  "Leila",
  "Hiroshi",
  "Fatima",
  "Santiago",
  "Priya",
  "Mateo",
  "Jasmine",
  "Muhammad",
  "Nina",
  "Yusuf",
  "Luna",
  "Elena",
  "Amir",
];
let lasts = [
  "Smith",
  "Gbagbo",
  "Rodriguez",
  "Lopez",
  "Lengsavat",
  "Bui",
  "Ng",
  "Wright",
  "Perry",
  "Ryan",
  "Hartman",
  "Badajoz",
  "Chu",
  "Panagiatopolis",
  "Kim",
  "Lee",
  "Chen",
  "Wang",
  "Liu",
  "Zhang",
  "Nguyen",
  "Tran",
  "Pham",
  "Patel",
  "Sharma",
  "Singh",
  "Abdullah",
  "Khan",
  "Ali",
  "Iqbal",
  "Rahman",
  "Santos",
  "Silva",
  "Ferreira",
  "Pereira",
  "Dos Santos",
  "Gonzalez",
  "Lopez",
  "Rodriguez",
  "Martinez",
  "Fuentes",
  "Hernandez",
  "Gomez",
  "Johnson",
  "Brown",
  "Taylor",
  "Miller",
  "Wilson",
  "Moore",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
  "Martin",
  "Thompson",
  "Garcia",
  "Davis",
];
let YOGs = [2029, 2028];
let advisors = [
  "Hinkle",
  "Orpen",
  "Uyaguari",
  "Lane",
  "Murry",
  "Pereyra",
  "Bresnahan",
  "Angelone",
];

let i = 0;

function TestData() {
  let students = [];
  this.createNames = () => {
    for (let i = 0; i < 400; i++) {
      let first = firsts[i % firsts.length];
      let last = lasts[i % lasts.length];
      let yog = YOGs[i % YOGs.length];
      let adv = advisors[i % advisors.length];
      let student = [
        `${first}.${last}@example.com`,
        i,
        `${first} ${last}`,
        yog,
        adv,
      ];
      students.push(student);
    }
  };
  let ss = SpreadsheetApp.getActiveSpreadsheet();

  this.populateStudents = () => {
    let studentSheet = ss.getSheetByName(STUDENT_SHEET);
    let lastRow = studentSheet.getLastRow();
    let cols = students[0].length;
    studentSheet.getRange(2, 1, students.length, cols).setValues(students);
  };

  this.populateDays = () => {
    let daySheet = ss.getSheetByName(DAY_SHEET);
    let sampleDays = [["Monday"], ["Wednesday"], ["Friday"]];
    daySheet.getRange(2, 1, sampleDays.length, 1).setValues(sampleDays);
  };

  this.populateSlots = () => {
    let slotSheet = ss.getSheetByName(PLACEMENT_SHEET);
    // hardcoded placement fields
    let placementOptions = [
      ["Chorus", "Mr Singer", 20, true, true, true],
      ["Intensive Writing", "Mr. Writer", 4, true, false, false],
      ["Mathletes", "Ms. Math", 15, false, true, false],
      ["A hablar!", "Srta Charla", 22, true, true, true],
      ["Study Hall", "Ms Learner", 30, true, true, true],
      ["Flag Football", "Mr Tough", 40, false, false, true],
      ["Frisbee Golf", "Sra Fly", 30, false, false, true],
      ["Lab Time", "Ms Petri", 22, true, true, false],
      ["Overflow", "Mister Mister", false, true, true, true],
      ["Friday Fun", "Mr. Fun", false, false, false, true],
      ["Monday Mania", "Ms. Manic", false, true, false, false],
    ];
    slotSheet
      .getRange(2, 1, placementOptions.length, 6)
      .setValues(placementOptions);
  };

  this.init = () => {
    this.createNames();
  };
  this.init();
}

function populateExample() {
  let td = new TestData();
  td.populateStudents();
  td.populateSlots();
  td.populateDays();
}
