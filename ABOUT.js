/**
 * Original Script Lives Here: https://docs.google.com/spreadsheets/d/1WGKQpIOSarvEkGrDRo318Gzx3sf-JiqeURmDAT_kN2w/edit#gid=0
 * Please port improvements back there!
 */

/* History
 *
 * NOTE: going forward we're annoyingly just copying this script over into a couple of other working documents
 * (bad process, yes, but better than dealing with Google's add-on publication process which is a nightmare).
 * Given that, let's start listing which files change with each version so we know how much copy/pasting
 * there is to do!
 *
 * Version 1.0 => Used in the 2022-2023 school year for our High School flex block
 * Version 1.1 => Allow clearing specific days.
 * Version 1.2 => Allow sorting
 * Version 1.3 =>
 *     - Improve handling of broken column headers (add validation /
 *       auto-correction where possible)
 *     - Support custom "Note" fields for days.
 *     - Improve test suite
 * Version 1.4 => Add emailing support
 *   + FILES CHANGED:
 *     -   Code.gs - Added setup email method
 *     -   Email.gs - new module
 *     -   SheetSelectorUtil.gs - new module
 *     -   Automation.gs - add email columns
 *     -   DataReader.gs - fixed bug where we skipped rows based only on first column
 *   + Features
 *     - Define email templates for any sheet
 *     - Send emails about sheets from menu (and to test them)
 *     - Automate emails with Automation script.
 *   + Fixes
 *     - Fix bug in DataReader where we skip a row that has an empty first column
 *       but is otherwise full.
 * Version 1.5 => Add support for exporting data to other sheets.
 *   + FILES CHANGED:
 *     - Automation.gs - Added columns for data copier configuration.
 *     - dataCopier.gs - New function for copying data to other sheets.
 *   + Features
 *     - Add support for copying data to other sheets on a timer.
 * Version 1.5.1 => Fix bug that meant "Active" checkbox did nothing
 *   + FILES CHANGED:
 *     - Automation.gs - Implement "Active" checkbox check on run automations
 * Version 1.6 => Add Room field to placement options / generated schedule.
 *
 * In active use here: https://script.google.com/home/projects/1rQWbkycRWgHPuNVJWF8DuK-Rw__pZtH8e0WCYFPisdf4DJBGUbxmqtnY/edit
 * Last ported improvements back to this original on 12/19/23
 *
 * Also in active use for MS in two sheets:
 *   5/6: https://docs.google.com/spreadsheets/d/1oSK2TLAPty3971bbPQqH3ETg7Gu1Y0bwjBrhRFlINSM/edit#gid=1139748539
 *   7/8: https://docs.google.com/spreadsheets/d/1zyABqw9cT6ThcWJKhusdit5fKRbOh3GbCa9DjDZ-91M/edit#gid=0
 */

/**
 * This is a complicated little tool for building custom schedules based on requests.
 * The tool is intended to support something like a a "What-I-Need" block or "Extra Help"
 * sessions or perhaps choice options in a Field Day.
 *
 * Features:
 * - Allows scheduling as many activities over as many days as you like
 *   (e.g. 4 options for field day or 20 workshops over 10 days -- whatever)
 * - Allows limiting attendance at any event to a number of your choosing.
 * - Allows multiple competing streams of information (e.g. pre-assigned
 *   schedules + high priority requests + lower priority requests).
 * - Generates schedules automatically and provides feedback on why each person
 *    was scheduled where they were (e.g. if someone didn't get their request
 *    because of a limitation, it says so to help you troubleshoot)
 *  - Helps you manage the many sheets it generates to keep this more usable.
 *
 * Setup Process:
 * - Start Set Up will create our most basic sheet:
 *    DAYS: this is a list of days we want to schedule. It could be days of the week, or "A Day" and "B Day"
 *    If we're just doing a one day schedule, then we just put one day here.
 *
 *    Students: this is our list of students and whatever metadata we want to have about them.
 *    These will be the people we are scheduling in our system.
 *
 * - Step 2. Setup Placement Request Options
 *
 *  We will now have a spreadsheet for creating our options. Each option can occur on one or more days.
 *  These options are the things we're scheduling (i.e. "Volleyball" for field day or "Math Extra Help Session")
 *
 * - Step 3: Add Request Sheets:
 *   If you only have one placement sheet, life is simple: we're just putting students where you put them. You get a nice
 *   Google Sheet with dropdown boxes for selecting students and then placements to place the students where you want them.
 *
 *   If you have multiple ways of requesting students, that's where the fun begins! You can add as many layers to this system as you want.
 *   The "Request Sheets" sheet will contain your list of sheets we use and what priority to give them in case of conflict.
 *
 *
 *  - Step 4: Make Schedule
 *   The final step will generate schedules based on the assignments.
 *   There will be one tab per day you created with the schedules
 *
 *
 *  Sheet Management
 *  - Typically, there are 3 different phases of use, which come with 3 different sets of sheets.
 *    There are show/hide menu items to help with this.
 *
 *  - Setup
 *    -> You want to see the list of Days, Students and Placement Options
 *  - Requests
 *    -> You want to see the various placement sheets you've created
 *  - Using the Schedule
 *    -> You want to see the schedule generated for each day
 *
 *
 *
 *
 */
