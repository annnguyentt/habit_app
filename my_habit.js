/* SHOW CHOSEN DATE ON MAIN PAGE */
let today = formatDate(getUnixTimeToday(), false),
    selectedDate = today;

const showableDateArray = getDateArr(6, (new Date(selectedDate).getTime() - 86400*1000*3)).map((item) =>
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

showableDates.addEventListener('click', function(event) {
    if ( ['LI', 'H3', 'P'].includes(event.target.tagName)) {
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


/* HABIT IS SAVED */
const saveButton = document.querySelector(".save-button");
saveButton.addEventListener("click", function () {
    const habitName = blankHabit.querySelector("input").value;
    const habitId = getUnixTimeToday();
    // add the new habit to local storage first
    addNewHabit(habitId, habitName);
    updateRecord(habitId, false, selectedDate);
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
});

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