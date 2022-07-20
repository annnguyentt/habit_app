/* USER DEFINED FUNCTIONS */

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

// insert a new node before a centain node
function insertBeforeANode(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

// get length of an object
function getLenOfObject(Obj) {
    return Object.keys(Obj).length;
}

// get the array of active habits
function getActiveHabitIds(selectedDate) {
    let activeHabits = [];
    for (let [habitId, habitIdProp] of Object.entries(allHabits)) {
        if (
            habitIdProp["startedAt"] === selectedDate &&
            habitIdProp["schedule"].length === 0
        ) {
            activeHabits.push(habitId);
        } else if (
            habitIdProp["startedAt"] <= selectedDate &&
            habitIdProp["schedule"].includes(
                getDayName(new Date(selectedDate).getDay())
            )
        ) {
            if (
                !habitIdProp["deleteAt"] ||
                formatDate(habitIdProp["deleteAt"], false) > selectedDate
            ) {
                activeHabits.push(habitId);
            }
        }
    }
    return activeHabits;
}

// calculate number of completed habits
function getDoneHabitIds(selectedDate) {
    let doneHabits = [];
    const activeHabits = getActiveHabitIds(selectedDate);

    for (let habitId of activeHabits) {
        if (allRecords[habitId]) {
            if (allRecords[habitId][selectedDate]) {
                doneHabits.push(habitId);
            }
        }
    }
    return doneHabits;
}

// display num of active habits on the chosen date
function displayActiveHabits(numActiveHabits) {
    const header = document.querySelector(".header");
    header.querySelector("p").innerText = `You have ${numActiveHabits} to-do ${numActiveHabits > 1 ? "items" : "item"
        } ${selectedDate === today ? "today" : ""}`;
}

// calculate the pct of done habits
function calDoneHabitsPCT(selectedDate) {
    const progressPCT = Math.round(
        (getDoneHabitIds(selectedDate).length /
            getActiveHabitIds(selectedDate).length) *
        100
    );
    return progressPCT;
}

// update progress bar
function updateProgressBar(selectedDate) {
    let progressPCT = calDoneHabitsPCT(selectedDate),
        habitProgress = document.querySelector("#all-habits-progress"),
        progressTitle = document.querySelector(".daily-progress-title"),
        quote = progressTitle.querySelector("#quote"),
        percentage = progressTitle.querySelector("#percentage");

    if (isNaN(progressPCT)) {
        progressPCT = 0;
    }
    habitProgress.value = progressPCT;
    percentage.innerHTML = `${progressPCT}%`;
    habitProgress.classList.remove("completed");
    if (progressPCT === 0) {
        quote.innerText = "Let's start a new day to shine!";
    } else if (progressPCT < 50) {
        quote.innerText = "You're almost halfway, keep it up!";
    } else if (progressPCT === 50) {
        quote.innerText = "You're close to being finished, hold on!";
    } else if (progressPCT < 100) {
        quote.innerText = "Your're almost done, go ahead!";
    } else if (progressPCT === 100) {
        quote.innerText = "All habits are completed. Stay ahead!";
        habitProgress.classList.add("completed");
    }
}

// sort an array
function sortArray(arr) {
    return arr.sort((a, b) => a - b);
}

// get sorted keys of an Object
function getSortedHabitArray(arr) {
    let sortedArr = arr.map((i) => parseInt(i));
    return sortArray(sortedArr);
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

// get name of the month
const getMonthName = (month) => {
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
    return monthNames[parseInt(month) - 1];
};

// get name of the day
const getDayName = (weekDay) => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return dayNames[weekDay];
};

// customize date format
function formatDate(unixTime, toDisplay = true) {
    const newDate = new Date(unixTime);
    const weekDay = newDate.getDay();
    const dd = String(newDate.getDate()).padStart(2, "0");
    const mm = ("0" + (newDate.getMonth() + 1)).slice(-2);
    const yyyy = newDate.getFullYear();

    if (toDisplay) {
        return [getDayName(weekDay), dd, `${yyyy}-${mm}-${dd}`];
    } else {
        return `${yyyy}-${mm}-${dd}`;
    }
}

// open main page
function openMainPage() {
    let addNewButton = document.querySelector(".add-new-habit"),
        habitField = document.querySelector(".habit-field"),
        dailyProgress = document.querySelector(".daily-progress");
    addNewButton.classList.add("clicked");
    habitField.classList.add("opened");
    dailyProgress.classList.add("opened");
    updateProgressBar(selectedDate);
}

// get first and last date of a date
function getFirstLastDateOfWeek(date, firstDayOfWeek = 'mon') {
    let newDate = new Date(date),
        wkStart, wkEnd;

    if (firstDayOfWeek === 'mon') {
        const currentWeekDay = newDate.getDay();
        const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
        wkStart = new Date(new Date(newDate).setDate(newDate.getDate() - lessDays));
        wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));
    } else if (firstDayOfWeek === 'sun') {
        const first = newDate.getDate() - newDate.getDay();
        const last = first + 6;
        wkStart = new Date(newDate.setDate(first));
        wkEnd = new Date(newDate.setDate(last));
    }
    wkStart = formatDate(wkStart.getTime(), false);
    wkEnd = formatDate(wkEnd.getTime(), false);

    return [wkStart, wkEnd];
}

// get habit result to insert to habit-result class
function getNumCompletionOfHabitId(habitId, selectedDate) {
    let recordsOfHabit = retrieveDataFromLocal("habitTracking")["records"][habitId];
    recordsOfHabit = recordsOfHabit ? recordsOfHabit : {};

    let habitSchedule = retrieveDataFromLocal("habitTracking")["habits"][habitId]['schedule'];
    numOfTimesPerWeek = habitSchedule.length;

    const completedDates = Object.keys(recordsOfHabit)
        .filter(key =>
            (recordsOfHabit[key] === true)
            && (getFirstLastDateOfWeek(selectedDate)[0] === getFirstLastDateOfWeek(key)[0])
        );
    numOfDoneTimesPerWeek = completedDates.length;

    return {
        'numOfDoneTimesPerWeek': numOfDoneTimesPerWeek
        , 'numOfTimesPerWeek': numOfTimesPerWeek
        , 'completedDateArr': completedDates
    };
}


// function getHabitResult(habitId, selectedDate) {
//     /* get all records of the habitID */
//     const resultPerWeek = getNumCompletionOfHabitId(habitId, selectedDate);
//     numOfDoneTimesPerWeek = resultPerWeek['numOfDoneTimesPerWeek']
//     completedDateArr = resultPerWeek['completedDateArr']
//     numOfTimesPerWeek = resultPerWeek['numOfTimesPerWeek']

//     let habitResult = "", 
//         firstDateOfWeek = getFirstLastDateOfWeek(selectedDate)
//         , dateDiff = calTwoStringDates(firstDateOfWeek, selectedDate)
//         , numDaysStreak = countNumDaysStreak(completedDateArr);

//     if (numOfTimesPerWeek === 7) {
//         if (numOfDoneTimesPerWeek === 0) {
//             habitResult = "Complete today to have the first streak";
//             return habitResult
//         } else if ((dateDiff >= numDaysStreak) && (dateDiff <= numDaysStreak + 1)) {
//             habitResult = `${numDaysStreak}-day${numDaysStreak > 1 ? "s" : ""} streak`;
//             return habitResult
//         } else {
//             habitResult = `Finished ${numOfDoneTimesPerWeek}/${numOfTimesPerWeek} times per week`;
//             return habitResult
//         }
//     }
//     else if (numOfTimesPerWeek === 0) {

//     }



//     if (getLenOfObject(completedDates) < 1) {
//         habitResult = "Complete today to have the first streak";
//     } else if (
//         calTwoStringDates(completedDates[0], selectedDate) <=
//         86400 * 1000
//     ) {
//         const numDaysStreak = countNumDaysStreak(completedDates);
//         habitResult = `${numDaysStreak}-day${numDaysStreak > 1 ? "s" : ""} streak`;
//     } else {
//         const dateDiff = Math.floor(
//             calTwoStringDates(completedDates[0], selectedDate) / (86400 * 1000)
//         );
//         habitResult = `Completed ${dateDiff} day${dateDiff > 1 ? "s" : ""
//             } ago. Let get it done!!`;
//     }
//     return habitResult;
// }

// calculate the difference in millisecond between 2 dates
function calTwoStringDates(startDate, endDate) {
    return new Date(endDate) - new Date(startDate);
}

// count num of days of streak
function countNumDaysStreak(dateArr) {
    newDateArr = dateArr.sort().reverse();
    let numDaysStreak = 1;
    for (let day = 1; day < newDateArr.length; day++) {
        if (calTwoStringDates(newDateArr[day], newDateArr[day - 1]) === 86400 * 1000) {
            numDaysStreak += 1;
        } else {
            break;
        }
    }
    return numDaysStreak;
}

// add event listener to checkbox and update results to local storage
const audio = new Audio("sound_effect/8SUM472-click-casual-digital.mp3");
function addEventListenerToCheckbox(element, selectedDate) {
    const habitCheckbox = element.querySelector(".habit-checkbox");
    habitCheckbox.addEventListener("click", function () {
        // insert data of the new habit to local storage
        const ishabitDone = habitCheckbox.checked;
        const habitId = element.getAttribute("data-habit-id");
        updateRecord(habitId, ishabitDone, selectedDate);
        storeToLocalStorage(habitTracking, "habitTracking");
        // audio play when the checkbox is checked
        if (ishabitDone) {
            audio.play();
        }
        // update the habit result
        const habitResult = habitCheckbox.parentNode.querySelector(".habit-result");
        // const habitResultNewContent = getHabitResult(habitId, selectedDate);
        // habitResult.innerText = habitResultNewContent;
        // update progress bar
        updateProgressBar(selectedDate);
        // trigger confetti if done habits pct is equal to 100%
        let progressPCT = calDoneHabitsPCT(selectedDate);
        if (progressPCT === 100) {
            confetti({
                angle: 140,
                spread: 55,
                origin: { x: 0.95, y: 0.4 },
            });
        }
    });
}

// add event listener to remove button, and get the habit out of the list if clicking
function addEventListenerToRemoveButton(element, selectedDate) {
    const removeButton = element.querySelector(".remove-button"),
        deletedTime =
            selectedDate === formatDate(getUnixTimeToday(), false)
                ? getUnixTimeToday()
                : new Date(selectedDate).getTime();
    removeButton.addEventListener("click", function () {
        const habitId = element.getAttribute("data-habit-id");
        /* update deleteAt property in local storage */
        updateHabit(habitId, "deleteAt", deletedTime);
        storeToLocalStorage(habitTracking, "habitTracking");
        /* remove the element on html */
        element.remove();
        /* update progress bar */
        updateProgressBar(selectedDate);

        let numActiveHabits = getActiveHabitIds(selectedDate).length;
        displayActiveHabits(numActiveHabits);
    });
}

// close all remove buttons
function closeAllRemoveButtons() {
    const allRemoveButtons = document.querySelectorAll(".remove-button");
    allRemoveButtons.forEach((item) => item.classList.remove("clicked"));
}

// create a habit item div
function createNewHabitItemDiv(
    habitId,
    habitName,
    isDone,
    habitIndex,
    selectedDate
) {
    let newHabit = document.createElement("div");
    newHabit.classList.add("habit-display");
    newHabit.setAttribute("data-habit-id", habitId);
    let checkStatus = isDone ? "checked" : "";
    habitName = habitName.length < 1 ? "Your habit" : habitName;

    newHabit.innerHTML = `
            <div class="display-container">
                <div class='habit-name'>
                    <h3>${habitName}</h3>
                    <p class='habit-result'></p>
                </div>
                <label class="habit-done" for="checkbox-habit-${habitIndex}"></label>
                <input class="habit-checkbox" type="checkbox" id="checkbox-habit-${habitIndex} onchange="myfunction()" placeholder="Done" ${checkStatus}>
            </div>
            <button class="remove-button"><i class="fa fa-minus-circle" aria-hidden="true"></i></button>
    `;
    // update habit result after changing checkbox click
    // habitResult = getHabitResult(habitId, selectedDate);
    // newHabit.querySelector(".habit-result").innerText = habitResult;
    // add click event to checkbox
    addEventListenerToCheckbox(newHabit, selectedDate);
    // add click event to remove button
    addEventListenerToRemoveButton(newHabit, selectedDate);
    newHabit.addEventListener("click", function () {
        closeAllRemoveButtons();
        const removeButton = newHabit.querySelector(".remove-button");
        removeButton.classList.add("clicked");
    });
    return newHabit;
}

// add new habit to localStorage
function addNewHabit(habitId, habitName, startDate, schedule) {
    habitName = habitName.length === 0 ? "Your habit" : habitName;
    createdTime = getUnixTimeToday();
    allHabits[habitId] = {
        createdAt: createdTime,
        startedAt: startDate,
        name: habitName,
        deletedAt: null,
        schedule: schedule,
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
