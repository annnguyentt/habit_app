/* USER DEFINED FUNCTIONS */
// insert a new node before a centain node
function insertBeforeANode(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

// retrieve data from localStorage
function retrieveDataFromLocal(dataName) {
    let storedData = localStorage.getItem(dataName);
    if (!storedData) {
        storedData = {
            habits: {},
            records: {},
        };
    } else {
        storedData = JSON.parse(storedData);
    }
    return storedData;
}

// get length of an object
function getLenOfObject(Obj) {
    return Object.keys(Obj).length;
}

// calculate number of checked habits
function calNumDoneHabits(chosenDate) {
    let count = 0;
    for (let [habitId, habitIdProp] of Object.entries(allHabits)) {
        if (
            !habitIdProp["deleteAt"] &&
            allRecords[habitId].hasOwnProperty(chosenDate)
        ) {
            if (allRecords[habitId][chosenDate]) {
                count += 1;
            }
        }
    }
    return count;
}

// calculate num of active habits
function calNumActiveHabits(chosenDate) {
    let count = 0;
    for (let habitIdProp of Object.values(allHabits)) {
        if (formatDate(habitIdProp["createAt"], false) <= chosenDate) {
            if (!habitIdProp["deleteAt"]) {
                count += 1;
            } else if (formatDate(habitIdProp["deleteAt"], false) > chosenDate) {
                count += 1;
            }
        }
    }
    return count;
}

function updateProgressBar(chosenDate) {
    const numDoneHabits = calNumDoneHabits(chosenDate),
        numActiveHabits = calNumActiveHabits(chosenDate),
        progressPCT = Math.round(numDoneHabits / numActiveHabits * 100),
        habitProgress = document.querySelector('#all-habits-progress'),
        progressTitle = document.querySelector('.daily-progress-title'),
        quote = progressTitle.querySelector('#quote'),
        percentage = progressTitle.querySelector('#percentage');

    habitProgress.value = progressPCT;
    percentage.innerHTML = `${progressPCT}%`;
    if (progressPCT === 0) {
        quote.innerText = "Let's start a new day to shine!"
        habitProgress.classList.remove('completed');
    } else if (progressPCT < 50) {
        quote.innerText = "You're almost halfway, keep it up!"
        habitProgress.classList.remove('completed');
    } else if (progressPCT === 50) {
        quote.innerText = "You're close to being finished, hold on!"
        habitProgress.classList.remove('completed');
    } else if (progressPCT < 100) {
        quote.innerText = "Your're almost done, go ahead!"
        habitProgress.classList.remove('completed');
    } else {
        quote.innerText = "All habits are completed. Stay ahead!"
        habitProgress.classList.add('completed');
    }
}

// sort an array
function sortArray(arr) {
    return arr.sort((a, b) => a - b);
}

// get sorted keys of an Object
function getSortedKeys(obj) {
    let keyArray = Object.keys(obj).map((i) => parseInt(i));
    return sortArray(keyArray);
}

// store an object to localStorage
function storeToLocalStorage(targetObj, nameOfObject) {
    localStorage.setItem(nameOfObject, JSON.stringify(targetObj));
}

// get unixtime of today
function getUnixTimeToday() {
    const today = new Date();
    return today.getTime();
}

// get a range of dates
function getDateArr(dayInterval, startDate) {
    const endDate = startDate + dayInterval * 86400 * 1000;
    const dateArr = [];
    for (let i = startDate; i <= endDate; i += 86400 * 1000) {
        dateArr.push(i);
    }
    return dateArr;
}

// customize date format
function formatDate(unixTime, toDisplay = true) {
    const newDate = new Date(unixTime);
    const weekDay = newDate.getDay();
    const dd = String(newDate.getDate()).padStart(2, "0");
    const mm = ("0" + (newDate.getMonth() + 1)).slice(-2);
    const yyyy = newDate.getFullYear();
    const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];
    if (toDisplay) {
        return [
            dayNames[weekDay],
            monthNames[parseInt(mm - 1)] + " " + dd + ", " + yyyy,
        ];
    } else {
        return `${yyyy}-${mm}-${dd}`;
    }
}

// open main page
function openMainPage() {
    addNewButton.classList.add("clicked");
    habitField.classList.add("opened");
}

// add event listener to checkbox and update results to local storage
function addEventListenerToCheckbox(element, chosenDate) {
    const habitCheckbox = element.querySelector(".habit-checkbox");
    habitCheckbox.addEventListener("click", function () {
        // insert data of the new habit to local storage
        const ishabitDone = habitCheckbox.checked;
        const habitId = element.getAttribute("data-habit-id");
        updateRecord(habitId, ishabitDone, chosenDate);
        storeToLocalStorage(habitTracking, "habitTracking");
        // audio play when the checkbox is checked
        if (ishabitDone) {
            audio.play();
        }
        // update the habit result
        const habitDisplay = habitCheckbox.parentNode;
        const habitResult = habitDisplay.querySelector(".habit-result");
        const habitResultNewContent = getHabitResult(
            habitId,
            chosenDate,
            allRecords
        );
        habitResult.innerText = habitResultNewContent;
        // update progress bar
        updateProgressBar(chosenDate);
    });
}

// add event listener to remove button, and get the habit out of the list if clicking
function addEventListenerToRemoveButton(element) {
    removeButton = element.querySelector(".remove-button");
    removeButton.addEventListener("click", function () {
        const habitId = element.getAttribute("data-habit-id");
        updateHabit(habitId, "deleteAt", getUnixTimeToday());
        storeToLocalStorage(habitTracking, "habitTracking");
        element.remove();
        updateProgressBar(chosenDate);
    });
}

// close all remove buttons
function closeAllRemoveButtons() {
    const allRemoveButtons = document.querySelectorAll(".remove-button");
    allRemoveButtons.forEach((item) => item.classList.remove("clicked"));
}

// get habit result to insert to habit-result class
function getHabitResult(habitId, chosenDate, allRecords) {
    /* get all records of the habitID */
    const recordsOfHabit = allRecords[habitId];
    /* select records smaller than the chosen date and checkbox value is true */
    const filteredRecords = Object.keys(recordsOfHabit)
        .filter((key) => key <= chosenDate && recordsOfHabit[key] === true)
        .reduce((obj, key) => {
            obj[key] = recordsOfHabit[key];
            return obj;
        }, {});
    const dateArr = Object.keys(filteredRecords).sort().reverse();
    let habitResult = "";

    if (getLenOfObject(filteredRecords) < 1) {
        habitResult = "Complete today to have the first streak";
    } else if (calTwoStringDates(dateArr[0], chosenDate) <= 86400 * 1000) {
        const numDaysStreak = countNumDaysStreak(dateArr);
        habitResult = `${numDaysStreak}-day${numDaysStreak > 1 ? "s" : ""} streak`;
    } else {
        const dateDiff = Math.floor(
            calTwoStringDates(dateArr[0], chosenDate) / (86400 * 1000)
        );
        habitResult = `Completed ${dateDiff} day${dateDiff > 1 ? "s" : ""
            } ago. Let's Get It Done!!`;
    }
    return habitResult;
}

// count num of days of streak
function countNumDaysStreak(arr) {
    let numDaysStreak = 1;
    for (let day = 1; day < arr.length; day++) {
        if (calTwoStringDates(arr[day], arr[day - 1]) === 86400 * 1000) {
            numDaysStreak += 1;
        } else {
            break;
        }
    }
    return numDaysStreak;
}

// calculate the difference in millisecond between 2 dates
function calTwoStringDates(startDate, endDate) {
    return new Date(endDate) - new Date(startDate);
}

// create a habit item div
function createNewHabitItemDiv(habitId, habitName, isDone, habitIndex, chosenDate) {
    let newHabit = document.createElement("div");
    newHabit.classList.add("habit-display");
    newHabit.setAttribute("data-habit-id", habitId);
    let checkStatus = "";
    if (isDone) {
        checkStatus = "checked";
    }
    if (habitName.length < 1) {
        habitName = "Your habit";
    }
    newHabit.innerHTML = `
            <div class="display-container">
                <label class="habit-done" for="checkbox-habit-${habitIndex}"></label>
                <input class="habit-checkbox" type="checkbox" id="checkbox-habit-${habitIndex} onchange="myfunction()" placeholder="Done" ${checkStatus}>
                <div class='habit-name'>
                    <h3>${habitName}</h3>
                    <p class='habit-result'></p>
                </div>
            </div>
            <button class="remove-button"><i class="fa fa-minus-circle" aria-hidden="true"></i></button>
    `;
    // update habit result after changing checkbox click
    habitResult = getHabitResult(habitId, chosenDate, allRecords);
    newHabit.querySelector(".habit-result").innerText = habitResult;
    // add click event to checkbox
    addEventListenerToCheckbox(newHabit, chosenDate);
    // add click event to remove button
    addEventListenerToRemoveButton(newHabit);
    newHabit.addEventListener("click", function () {
        closeAllRemoveButtons();
        const removeButton = newHabit.querySelector(".remove-button");
        removeButton.classList.add("clicked");
    });
    return newHabit;
}

// add new habit to localStorage
function addNewHabit(habitId, habitName, deleteAt) {
    allHabits[habitId] = {
        createAt: habitId,
        name: habitName,
        deleteAt: deleteAt,
    };
}

// update properties of habits to localStorage
function updateHabit(habitId, property, propertyValue) {
    allHabits[habitId][property] = propertyValue;
}

// update properties of records to localStorage
function updateRecord(habitId, status, updateDate) {
    if (!allRecords[habitId]) {
        allRecords[habitId] = {};
    }
    allRecords[habitId][updateDate] = status;
}

/* SHOW CURRENT DATE ON MAIN PAGE */
const showableDateArray = getDateArr(0, getUnixTimeToday()).map((item) =>
    formatDate(item)
);
let showableDates = document.querySelector(".showable-dates");
showableDateArray.forEach(function (item) {
    showableDates.insertAdjacentHTML(
        "beforeend",
        `<a href="#"><h3>${item[0]}</h3><p>${item[1]}</p></a>`
    );
});

/* MAIN PAGE LAYOUT WHEN USER VISIT APP:
    If there is no habits stored in localStorage, the app will display "add-new-habit" layout.
    Otherwise, "habit-input" will be shown
*/
const chosenDate = formatDate(getUnixTimeToday(), (toDisplay = false));
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

const addNewButton = document.querySelector(".add-new-habit");
const habitField = document.querySelector(".habit-field");
const blankHabit = document.querySelector(".habit-input");
const numActiveHabits = calNumActiveHabits(chosenDate);

if (numActiveHabits >= 1) {
    openMainPage();
    let idx = 0;
    const allHabitIds = getSortedKeys(allHabits);
    for (let habitId of allHabitIds) {
        if (!allHabits[habitId]["deleteAt"]) {
            const newHabit = createNewHabitItemDiv(
                habitId,
                allHabits[habitId]["name"],
                allRecords[habitId][chosenDate],
                idx,
                chosenDate
            );
            insertBeforeANode(blankHabit, newHabit);
            idx += 1;
        }
    }
    updateProgressBar(chosenDate);
}

addNewButton.addEventListener("click", function () {
    openMainPage(addNewButton, habitField);
});

/* DISPLAY NUMBER OF ACTIVE HABITS TODAY */
const header = document.querySelector(".header");
header.insertAdjacentHTML(
    "beforeend",
    `<p>You have ${numActiveHabits} Journals today</p>`
);

/* HABIT IS SAVED */
const saveButton = document.querySelector(".save-button");
saveButton.addEventListener("click", function () {
    const habitName = blankHabit.querySelector("input").value;
    const habitId = getUnixTimeToday();
    // add the new habit to local storage first
    addNewHabit(habitId, habitName, null);
    updateRecord(habitId, false, chosenDate);
    storeToLocalStorage(habitTracking, "habitTracking");
    // create new habit div
    const newHabitDiv = createNewHabitItemDiv(
        habitId,
        habitName,
        false,
        getLenOfObject(allHabits),
        chosenDate
    );
    // inseart into layout before the blank habit
    insertBeforeANode(blankHabit, newHabitDiv);
    // clear the input value after saving
    blankHabit.querySelector("input").value = "";
    updateProgressBar(chosenDate);
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

/* sound effect when ticking checkbox */
const audio = new Audio("sound_effect/8SUM472-click-casual-digital.mp3");
