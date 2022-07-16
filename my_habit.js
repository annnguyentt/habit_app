/* SHOW CHOSEN DATE ON MAIN PAGE */
let today = formatDate(getUnixTimeToday(), false),
    selectedDate = today;

const showableDateArray = getDateArr(6, (new Date(selectedDate).getTime() - 86400 * 1000 * 3)).map((item) =>
    formatDate(item)
);
const showableDates = document.querySelector(".showable-dates");
showableDateArray.forEach(function (item) {
    let dateElement = document.createElement('li');
    dateElement.classList.add('date');
    dateElement.setAttribute("data-selected-date", item[2]);
    dateElement.innerHTML = `<h3>${item[0]}</h3>
                            <p>${item[1]}</p>`;
    if (item[2] === selectedDate) {
        dateElement.classList.add('selected');
        dateElement.classList.add('today');
    }
    showableDates.appendChild(
        dateElement
    );
});

const dateItems = showableDates.querySelectorAll('.date');

showableDates.addEventListener('click', function (event) {
    if (['LI', 'H3', 'P'].includes(event.target.tagName)) {
        dateItems.forEach(date => date.classList.remove('selected'));
        if (event.target.tagName === 'LI') {
            event.target.classList.add('selected');
            selectedDate = event.target.getAttribute('data-selected-date');
        }
        else {
            event.target.parentNode.classList.add('selected')
            selectedDate = event.target.parentNode.getAttribute('data-selected-date');
        }
    }
    displayItemsOfSelectedDate(selectedDate);
})

/* MAIN PAGE LAYOUT WHEN USER VISIT APP:
    If there is no habits stored in localStorage, the app will display "add-new-habit" layout.
    Otherwise, "habit-input" will be shown
*/
const audio = new Audio("sound_effect/8SUM472-click-casual-digital.mp3");
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

const addNewButton = document.querySelector(".add-new-habit");
const blankHabit = document.querySelector(".habit-input");

function displayItemsOfSelectedDate(selectedDate) {
    let numActiveHabits = getActiveHabitIds(selectedDate).length;
    displayActiveHabits(numActiveHabits);
    document.querySelectorAll('.habit-display').forEach(e => e.remove());
    if (numActiveHabits >= 1) {
        openMainPage();

        let idx = 0;
        let allActiveHabitIds = getSortedHabitArray(getActiveHabitIds(selectedDate));
        for (let habitId of allActiveHabitIds) {
            let habitStatus = allRecords[habitId][selectedDate] ? allRecords[habitId][selectedDate] : false;
            const newHabit = createNewHabitItemDiv(
                habitId,
                allHabits[habitId]["name"],
                habitStatus,
                idx,
                selectedDate
            );
            insertBeforeANode(blankHabit, newHabit);
            idx += 1;
        }
    }

    addNewButton.addEventListener("click", function () {
        openMainPage();
    });
}

displayItemsOfSelectedDate(selectedDate);


// /* HABIT IS SAVED */
// const saveButton = document.querySelector(".save-button");
// saveButton.addEventListener("click", function () {
//     const habitName = blankHabit.querySelector("input").value;
//     const habitId = getUnixTimeToday();
//     // add the new habit to local storage first
//     addNewHabit(habitId, habitName);
//     updateRecord(habitId, false, selectedDate);
//     storeToLocalStorage(habitTracking, "habitTracking");
//     // create new habit div
//     const newHabitDiv = createNewHabitItemDiv(
//         habitId,
//         habitName,
//         false,
//         getLenOfObject(allHabits),
//         selectedDate
//     );
//     // inseart into layout before the blank habit
//     insertBeforeANode(blankHabit, newHabitDiv);
//     // re-count number of active habits to display on banner
//     let numActiveHabits = getActiveHabitIds(selectedDate).length;
//     displayActiveHabits(numActiveHabits);
//     // clear the input value after saving
//     blankHabit.querySelector("input").value = "";
//     updateProgressBar(selectedDate);
// });

/* CLOSE REMOVE BUTTON IF USERS CLICK ESLEWHERE NOT HABIT ITEMS */
document.addEventListener("click", function (event) {
    if (
        event.target.classList.contains("habit-display") ||
        event.target.parentNode.classList.contains("habit-display") ||
        event.target.parentNode.parentNode.classList.contains("habit-display") ||
        event.target.parentNode.parentNode.parentNode.classList.contains(
            "habit-display"
        )
    ) {
    } else {
        closeAllRemoveButtons();
    }
});

// get num of days in the month
const getDays = (year, month) => {
    return {
        "numOfDays": new Date(year, month, 0).getDate(),
        "month": month,
        "year": year
    }
};

function generateBlankDayElement(dayOfWeek) {
    let calendar = document.querySelector('.day-option');
    if (dayOfWeek > 0) {
        for (let i = 1; i <= dayOfWeek; i++) {
            let blankDayElement = document.createElement('p');
            blankDayElement.innerHTML = `<span></span>`;
            calendar.appendChild(blankDayElement);
        }
    }
}

// highlight selected day
function selectDayInCalendar(dayElement) {
    let allDayElements = document.querySelectorAll('.day-in-calendar');
    allDayElements.forEach(item => item.classList.remove('selected'));
    dayElement.classList.add('selected');
}

// generate a calendar of the month of today when clicking "add new habit" button
function generateCalendarOfTheMonth(date) {
    let daysOfMonth = getDays((new Date(date)).getFullYear(), (new Date(date)).getMonth() + 1);
    /* update the month and year of the calendar */
    let monthAndYear = document.querySelector('#month-year');
    monthAndYear.innerText = getMonthName(daysOfMonth['month']) + ' ' + daysOfMonth['year'];
    /* calendar to display */ 
    let calendar = document.querySelector('.day-option');
    for (let i = 1; i <= daysOfMonth['numOfDays']; i++) {
        let fullDate = formatDate(new Date(daysOfMonth['year'] + "-" + daysOfMonth['month'] + "-" + i), false);
        if (i===1) {
            generateBlankDayElement((new Date(fullDate).getDay()))
        }
        let dayElement = document.createElement('p');
        dayElement.classList.add('day-in-calendar');
        dayElement.innerHTML = `<span>${i}</span>`;
        dayElement.setAttribute('data-calendar-date', fullDate);
        /* default selection is today */ 
        if (fullDate === today) {
            dayElement.classList.add('today', 'selected');
        }
        dayElement.addEventListener('click', function () {
            selectDayInCalendar(dayElement);
        })
        calendar.appendChild(dayElement)
    }
}

// select schedule
const selecteSchedule = document.querySelector('.selected-schedule');
function getSelectedSchedule() {

}

// click add new habit button
const addNewHabitButton = document.querySelector('#add-new-habit-button');
const addNewHabitField = document.querySelector('.add-new-habit-field');
const habitNameInput = document.querySelector('#habit-name');
const header = document.querySelector('.header');

addNewHabitButton.addEventListener('click', function () {
    habitNameInput.focus();
    addNewHabitField.classList.add('opened');
    header.classList.add('.stop-scrolling');
    generateCalendarOfTheMonth(today);
})


// click cancel button
const cancelButton = addNewHabitField.querySelector('#cancel-button');
cancelButton.addEventListener('click', function () {
    addNewHabitField.classList.remove('opened');
    header.classList.remove('.stop-scrolling');
});

// click save button
const saveButton = addNewHabitField.querySelector('#save-button');
saveButton.addEventListener('click', function () {
    const habitName = document.querySelector("#habit-name").value;
    const habitId = getUnixTimeToday();
    const allDaysInCalendar = document.querySelectorAll('.day-in-calendar');
    let startDate = today;
    allDaysInCalendar.forEach(item => item.classList.contains('selected')
        ? startDate = item.getAttribute('data-calendar-date') : startDate);

    const allScheduleOptions = document.querySelectorAll('.checkbox-input');
    let selectedSchedule = [];
    for (let item of allScheduleOptions) {
        if (item.checked) {
            selectedSchedule.push(item.id.toUpperCase())
        }
    }

    // add the new habit to local storage first
    addNewHabit(habitId, habitName, startDate, selectedSchedule);
    updateRecord(habitId, false, startDate);
    storeToLocalStorage(habitTracking, "habitTracking");
    // create new habit div
    const newHabitDiv = createNewHabitItemDiv(
        habitId,
        habitName,
        false,
        getLenOfObject(allHabits),
        selectedDate
    );
    // inseart into layout before the blank habit
    insertBeforeANode(blankHabit, newHabitDiv);
    // re-count number of active habits to display on banner
    let numActiveHabits = getActiveHabitIds(selectedDate).length;
    displayActiveHabits(numActiveHabits);
    // clear the input value after saving
    blankHabit.querySelector("input").value = "";
    updateProgressBar(selectedDate);
})
