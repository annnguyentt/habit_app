// display number of items of selected date
function displayItemsOfSelectedDate(selectedDate) {
    let habitField = document.querySelector(".habit-field"),
        numActiveHabits = getActiveHabitIds(selectedDate).length;

    displayActiveHabits(numActiveHabits);
    document.querySelectorAll(".habit-display").forEach((e) => e.remove());
    if (numActiveHabits >= 1) {
        openMainPage();
        let idx = 0;
        let allActiveHabitIds = getSortedHabitArray(
            getActiveHabitIds(selectedDate)
        );
        for (let habitId of allActiveHabitIds) {
            let habitStatus = allRecords[habitId][selectedDate]
                ? allRecords[habitId][selectedDate]
                : [];
            const newHabit = createNewHabitItemDiv(
                habitId,
                allHabits[habitId]["name"],
                habitStatus,
                idx,
                selectedDate
            );
            habitField.appendChild(newHabit);
            idx += 1;
        }
    }
}

// return goal of habit
function getGoalOfHabit() {
    let goalSection = document.querySelector(".goal");
    numOfTimes = parseInt(goalSection.querySelector("#num-of-times").value);
    goalPeriod = goalSection.querySelector("#goal-period").value;
    return [numOfTimes, goalPeriod];
}

// return selected day names in the schedule section
function getSelectedDayName() {
    const allScheduleOptions = document.querySelectorAll(".checkbox-input");
    let selectedDayName = [];
    for (let item of allScheduleOptions) {
        if (item.checked) {
            selectedDayName.push(item.id);
        }
    }
    return selectedDayName;
}

// replace content of selected-items
function replaceContentSelectedItems() {
    let selectedDayNameArr = getSelectedDayName(),
        numOfSelectedDayNames = selectedDayNameArr.length,
        scheduleSection = document.querySelector(".schedule"),
        selectedScheduleToDisplay =
            scheduleSection.querySelector(".selected-items");

    if (numOfSelectedDayNames === 7) {
        selectedScheduleToDisplay.innerText = "Everyday";
    } else if (numOfSelectedDayNames > 0 && numOfSelectedDayNames < 7) {
        selectedScheduleToDisplay.innerText = selectedDayNameArr.join(", ");
    } else {
        selectedScheduleToDisplay.innerText = "No Repeat";
    }
}

// whether user returns to the main screen or not
function returnToMainScreen(isReturned = true) {
    const addNewHabitField = document.querySelector(".add-new-habit-field"),
        body = document.querySelector("body"),
        scheduleOption = document.querySelector(".schedule-option");
    if (isReturned) {
        addNewHabitField.classList.remove("opened");
        body.classList.remove("stop-scrolling");
        scheduleOption.classList.remove("opened");
    } else {
        addNewHabitField.classList.add("opened");
        body.classList.add("stop-scrolling");
    }
}

/* SHOW SELECTED DATE ON MAIN PAGE */
let today = formatDate(getUnixTimeToday(), false),
    selectedDate = today;

const showableDateArray = getDateArr(
    6,
    new Date(selectedDate).getTime() - 86400 * 1000 * 5
).map((item) => formatDate(item));

const showableDates = document.querySelector(".showable-dates");

showableDateArray.forEach(function (item) {
    let dateElement = document.createElement("li");
    dateElement.classList.add("date");
    dateElement.setAttribute("data-selected-date", item[2]);
    dateElement.innerHTML = `<h3>${item[0]}</h3>
                            <p>${item[1]}</p>`;
    if (item[2] === selectedDate) {
        dateElement.classList.add("selected");
        dateElement.classList.add("today");
    }
    showableDates.appendChild(dateElement);
});

/* CHANGE DISPLAYED ITEMS WHEN SELECT ANOTHER DATE */
const dateItems = showableDates.querySelectorAll(".date");
showableDates.addEventListener("click", function (event) {
    if (["LI", "H3", "P"].includes(event.target.tagName)) {
        dateItems.forEach((date) => date.classList.remove("selected"));
        if (event.target.tagName === "LI") {
            event.target.classList.add("selected");
            selectedDate = event.target.getAttribute("data-selected-date");
        } else {
            event.target.parentNode.classList.add("selected");
            selectedDate = event.target.parentNode.getAttribute("data-selected-date");
        }
    }
    displayItemsOfSelectedDate(selectedDate);
});

/* INITIALIZE MAIN PAGE LAYOUT WHEN USER VISIT APP */
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

displayItemsOfSelectedDate(selectedDate);

/* CLOSE REMOVE BUTTON IF USERS CLICK ESLEWHERE NOT HABIT ITEMS */
// document.addEventListener("click", function (event) {
//     if (
//         event.target.classList.contains("habit-display") ||
//         event.target.parentNode.classList.contains("habit-display") ||
//         event.target.parentNode.parentNode.classList.contains("habit-display") ||
//         event.target.parentNode.parentNode.parentNode.classList.contains(
//             "habit-display"
//         )
//     ) {
//     } else {
//         closeAllRemoveButtons();
//     }
// });

/* CLICK ADD NEW HABIT BUTTON */
const addNewHabitButton = document.querySelector("#add-new-habit-button");
const addNewHabitField = document.querySelector(".add-new-habit-field");
const habitNameInput = document.querySelector("#habit-name");

addNewHabitButton.addEventListener("click", function () {
    // focus to the input field first
    habitNameInput.focus();
    // remove main screen
    returnToMainScreen(false);
    // default status of all checkboxes is true
    const allScheduleOptions = document.querySelectorAll(".checkbox-input");
    allScheduleOptions.forEach((item) => (item.checked = true));
    // show everyday on selected items field
    replaceContentSelectedItems();
    // defaultly display start date is today
    document.querySelector("#startdate").value = today;
    // defaultly show num of times in the goal section
    document.querySelector("#num-of-times").value = 1;
    // defaultly show goal period is week
    document.querySelector("#goal-period").value = "day";
});

/* CLICK CANCEL BUTTON */
const cancelButton = addNewHabitField.querySelector("#cancel-button");
cancelButton.addEventListener("click", function () {
    returnToMainScreen(true);
});

/* OPEN SCHEDULE OPTIONS */
let scheduleSection = document.querySelector(".schedule");
selectedScheduleToDisplay = scheduleSection.querySelector(".selected-items");
selectedScheduleToDisplay.addEventListener("click", function () {
    let scheduleOption = document.querySelector(".schedule-option");
    if (scheduleOption.classList.contains("opened")) {
        scheduleOption.classList.remove("opened");
    } else {
        scheduleOption.classList.add("opened");
    }
});

/* DISPLAY SELECTED DAY NAMES */
const allScheduleOptions = document.querySelectorAll(".checkbox-input");
allScheduleOptions.forEach((item) => {
    item.addEventListener("click", function () {
        replaceContentSelectedItems();
    });
});

/* CLICK SAVE BUTTON */
const saveButton = addNewHabitField.querySelector("#save-button");
saveButton.addEventListener("click", function () {
    const habitName = document.querySelector("#habit-name").value;
    const habitId = getUnixTimeToday();
    let startDate = document.querySelector("#startdate").value;
    const selectedDayName = getSelectedDayName();

    // add the new habit to local storage first
    addNewHabit(habitId, habitName, startDate, selectedDayName, getGoalOfHabit());
    updateRecord(habitId, [], startDate);
    storeToLocalStorage(habitTracking, "habitTracking");

    // clear the input value after saving
    document.querySelector("#habit-name").value = "";
    // return to the main screen
    returnToMainScreen(true);
    // display
    displayItemsOfSelectedDate(selectedDate);
});



function displayProgressCircle(habitElement, progressEndValue, isRunning=false) {
    progressEndValue = progressEndValue <= 100 ? progressEndValue : 100
    let progressBar = habitElement.querySelector(".circular-progress");
    let valueContainer = habitElement.querySelector(".value-container");
    let progressValue = 0;
    let speed = 0.2;

    if (isRunning) {
        let singleProgress = setInterval(() => {
            progressValue++;
            valueContainer.textContent = `${progressValue}%`;
            progressBar.style.background = `
                conic-gradient(
                    #FC5DBE ${progressValue * 3.6}deg,
                    #E3EEF2 ${progressValue * 3.6}deg
                )
            `;
            if (progressValue >= progressEndValue) {
                clearInterval(singleProgress);
            }
        }, speed);
    }
    else {
        valueContainer.textContent = `${progressEndValue}%`;
            progressBar.style.background = `
                conic-gradient(
                    #FC5DBE ${progressEndValue * 3.6}deg,
                    #E3EEF2 ${progressEndValue * 3.6}deg
                )
                `
    }
}
