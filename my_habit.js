/* UDF FOR MAIN PAGE ONLY */
// display number of items of selected date
function displayItemsOfSelectedDate(selectedDate) {
    let habitField = document.querySelector(".habit-field"),
        numActiveHabits = getActiveHabitIds(selectedDate).length;

    displayActiveHabits(numActiveHabits);
    document.querySelectorAll(".habit-display").forEach((e) => e.remove());
    if (numActiveHabits >= 1) {
        displayMainPage();
        let idx = 0;
        let allActiveHabitIds = getSortedHabitArray(
            getActiveHabitIds(selectedDate)
        );
        for (let habitId of allActiveHabitIds) {
            const newHabit = createNewHabitItemDiv(
                habitId,
                ALL_HABITS[habitId]["name"],
                selectedDate
            );
            habitField.appendChild(newHabit);
            idx += 1;
        }
    }
    else {
        displayMainPage(type='initial');
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
        habitNameInput.blur();
    } else {
        addNewHabitField.classList.add("opened");
        body.classList.add("stop-scrolling");
    }
}

/* DECLARE GLOBAL VARS */
const HABIT_TRACKING = retrieveDataFromLocal("habitTracking");
const ALL_HABITS = HABIT_TRACKING["habits"];
const ALL_RECORDS = HABIT_TRACKING["records"];
let TODAY_ = formatDate(getUnixTimeToday(), false),
    selectedDate = TODAY_;

/* SHOW SELECTED DATE ON MAIN PAGE */
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
displayItemsOfSelectedDate(selectedDate);

/* CLICK ADD NEW HABIT BUTTON */
const addNewHabitButton = document.querySelector("#add-new-habit-button");
const addNewHabitField = document.querySelector(".add-new-habit-field");
const habitNameInput = document.querySelector("#habit-name");

addNewHabitButton.addEventListener("click", function () {
    // focus to the input field first
    habitNameInput.focus();
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 0.35 * 1000);
    // remove main screen
    returnToMainScreen(false);
    // default status of all checkboxes is true
    const allScheduleOptions = document.querySelectorAll(".checkbox-input");
    allScheduleOptions.forEach((item) => (item.checked = true));
    // show everyday on selected items field
    replaceContentSelectedItems();
    // defaultly display start date is today
    document.querySelector("#startdate").value = TODAY_;
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
    storeToLocalStorage(HABIT_TRACKING, "habitTracking");

    // clear the input value after saving
    document.querySelector("#habit-name").value = "";
    // return to the main screen
    returnToMainScreen(true);
    // display
    displayItemsOfSelectedDate(selectedDate);
});

// finger swipe detection
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return (
        evt.touches || // browser API
        evt.originalEvent.touches
    ); // jQuery
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
}

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        /*most significant*/
        if (xDiff > 0) {
            /* right swipe */
        } else {
            /* left swipe */
        }
    } else {
        if (yDiff > 0) {
            /* down swipe */
        } else {
            returnToMainScreen(true);
            /* up swipe */
        }
    }
    /* reset values */
    xDown = null;
    yDown = null;
}
