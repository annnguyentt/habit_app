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

// get num of active habits
function getNumOfActiveHabits(Obj) {
    let count = 0;
    for (let [k, v] of Object.entries(Obj)) {
        if (!v["deleteAt"]) {
            count += 1;
        }
    }
    return count;
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
function addEventListenerToCheckbox(element) {
    const habitCheckbox = element.querySelector(".habit-checkbox");
    habitCheckbox.addEventListener("click", function () {
        const ishabitDone = habitCheckbox.checked;
        const habitId = element.getAttribute("data-habit-id");
        updateRecord(habitId, ishabitDone, todayDate);
        storeToLocalStorage(habitTracking, "habitTracking");
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
    });
}

// create a habit item div
function createNewHabitItemDiv(habitId, habitName, isDone, habitIndex) {
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
                <input class="habit-checkbox" type="checkbox" id="checkbox-habit-${habitIndex}" placeholder="Done" ${checkStatus}>
                <h3 class='habit-name'>${habitName}</h3>
            </div>
            <button class="remove-button"><i class="fa fa-minus-circle" aria-hidden="true"></i></button>
    `;
    addEventListenerToCheckbox(newHabit);
    addEventListenerToRemoveButton(newHabit);
    newHabit.addEventListener('click', function () {
        const allRemoveButtons = document.querySelectorAll('.remove-button');
        allRemoveButtons.forEach(item => item.classList.remove('clicked'));
        const removeButton = newHabit.querySelector('.remove-button');
        removeButton.classList.add('clicked');
    })
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

const todayDate = formatDate(getUnixTimeToday(), (toDisplay = false));
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

const addNewButton = document.querySelector(".add-new-habit");
const habitField = document.querySelector(".habit-field");
const blankHabit = document.querySelector(".habit-input");
const numActiveHabits = getNumOfActiveHabits(allHabits);

if (numActiveHabits >= 1) {
    openMainPage();
    let idx = 0;
    const allHabitIds = getSortedKeys(allHabits);
    for (let habitId of allHabitIds) {
        if (!allHabits[habitId]["deleteAt"]) {
            const newHabit = createNewHabitItemDiv(
                habitId,
                allHabits[habitId]["name"],
                allRecords[habitId][todayDate],
                idx
            );
            insertBeforeANode(blankHabit, newHabit);
            idx += 1;
        }
    }
}

addNewButton.addEventListener("click", function () {
    openMainPage(addNewButton, habitField);
});

/* Display number of active habits today */
const header = document.querySelector('.header');
header.insertAdjacentHTML('beforeend', `<p>You have ${numActiveHabits} Journals today</p>`)

/* HABIT IS SAVED */
const saveButton = document.querySelector(".save-button");
saveButton.addEventListener("click", function () {
    const habitName = blankHabit.querySelector("input").value;
    const habitId = getUnixTimeToday();
    const newHabitDiv = createNewHabitItemDiv(
        habitId,
        habitName,
        false,
        getLenOfObject(allHabits)
    );
    insertBeforeANode(blankHabit, newHabitDiv);
    addNewHabit(habitId, habitName, null);
    updateRecord(habitId, false, todayDate);
    storeToLocalStorage(habitTracking, "habitTracking");
    blankHabit.querySelector("input").value = "";
});