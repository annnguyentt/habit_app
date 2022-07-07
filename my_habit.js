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

// create a habit item div
function createNewHabitItemDiv(habitId, habitName, isDone, habitIndex) {
    let newHabit = document.createElement("div");
    newHabit.classList.add("habit-display");
    let checkStatus = "";
    if (isDone) {
        checkStatus = "checked";
    }

    newHabit.innerHTML = `
            <div class="display-container">
                <label class="habit-done" for="checkbox-habit-${habitIndex}">
                    <input type="checkbox" id="checkbox-habit-${habitIndex}" placeholder="Done" ${checkStatus}>
                </label>
                <h3 class='habit-id'>${habitId}</h3>
                <h3 class='habit-name'>${habitName}</h3>
            </div>
            <button class="move-to-trash"><i class="fa fa-trash" aria-hidden="true"></i></button>
    `;
    return newHabit;
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
const todayDate = formatDate(getUnixTimeToday(), toDisplay=false);
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

const addNewButton = document.querySelector(".add-new-habit");
const habitField = document.querySelector(".habit-field");
const blankHabit = document.querySelector(".habit-input");

if (getLenOfObject(allHabits) >= 1) {
    openMainPage();
    let idx = 0;
    for (let [habitId, value] of Object.entries(allHabits)) {
        if (!value["deleteAt"]) {
            const newHabit = createNewHabitItemDiv(
                habitId,
                value["name"],
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

/* HABIT IS SAVED */
function addNewHabit(habitId, habitName, deleteAt) {
    allHabits[habitId] = {
        createAt: habitId,
        name: habitName,
        deleteAt: deleteAt,
    };
}
function updateHabit(habitId, property, propertyValue) {
    allHabits[habitId][property] = propertyValue
}
function updateRecord(habitId, status, updateDate) {
    if (!allRecords[habitId]) {
        allRecords[habitId] = {};
    }
    allRecords[habitId][updateDate] = status;
}

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

/* HABIT IS DONE 
    check if habit is done, then store result of the checkbox into the localStorage
*/
const habitDone = document.querySelectorAll(".habit-done");
habitDone.forEach((item) =>
    item.addEventListener("click", function () {
        const habitContainer = item.parentNode;
        const isHabitDone = item.querySelector("input").checked;
        const habitId = habitContainer.querySelector(".habit-id").textContent;

        updateRecord(habitId, isHabitDone, todayDate);
        storeToLocalStorage(habitTracking, "habitTracking");
    })
);

/* MOVE HABIT TO TRASH */
trashCan = document.querySelectorAll(".move-to-trash");
trashCan.forEach((item) =>
    item.addEventListener("click", function () {
        const parentNodeOfTrash = item.parentNode;
        const habitId = parentNodeOfTrash.querySelector(".habit-id").textContent;
        updateHabit(habitId, 'deleteAt', getUnixTimeToday())
        storeToLocalStorage(habitTracking, "habitTracking");
        parentNodeOfTrash.remove();
    })
);