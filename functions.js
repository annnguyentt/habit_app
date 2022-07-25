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

// update properties of habits to localStorage
function updateHabitProps(habitId, property, propertyValue) {
    ALLHABITS_[habitId][property] = propertyValue;
}

// update properties of records to localStorage
function updateRecord(habitId, checkingResult, updateDate) {
    if (!ALLRECORDS_[habitId]) {
        ALLRECORDS_[habitId] = {};
    }
    ALLRECORDS_[habitId][updateDate] = checkingResult;
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
    for (let [habitId, habitIdProp] of Object.entries(ALLHABITS_)) {
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

// display num of active habits on the chosen date
function displayActiveHabits(numActiveHabits) {
    const header = document.querySelector(".header");
    header.querySelector("p").innerText = `
            You have ${numActiveHabits} to-do ${numActiveHabits > 1 ? "items" : "item"
        } ${selectedDate === TODAY_ ? "today" : ""}
        `;
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
function displayMainPage(type='normal') {
    let addNewButton = document.querySelector(".add-new-habit"),
        habitField = document.querySelector(".habit-field");
    if (type === 'normal') {
        addNewButton.classList.add("clicked");
        habitField.classList.add("opened");
    } else if (type === 'initial') {
        addNewButton.classList.remove("clicked");
        habitField.classList.remove("opened");
    }
}

// get first and last date of a date
function getFirstLastDateOfWeek(date, firstDayOfWeek = "mon") {
    let newDate = new Date(date),
        wkStart,
        wkEnd;

    if (firstDayOfWeek === "mon") {
        const currentWeekDay = newDate.getDay();
        const lessDays = currentWeekDay === 0 ? 6 : currentWeekDay - 1;
        wkStart = new Date(new Date(newDate).setDate(newDate.getDate() - lessDays));
        wkEnd = new Date(new Date(wkStart).setDate(wkStart.getDate() + 6));
    } else if (firstDayOfWeek === "sun") {
        const first = newDate.getDate() - newDate.getDay();
        const last = first + 6;
        wkStart = new Date(newDate.setDate(first));
        wkEnd = new Date(newDate.setDate(last));
    }
    wkStart = formatDate(wkStart.getTime(), false);
    wkEnd = formatDate(wkEnd.getTime(), false);

    return [wkStart, wkEnd];
}

// display full background color when habit is done
function displayCircularProgressOfDoneHabit(element) {
    element.style.background = `rgba(65, 173, 133, 1)`;
    element.classList.add("done");
}

// circular progress bar
function displayCircularProgress(
    habitElement,
    progressStartValue = 0,
    progressEndValue,
    isRunning = false
) {
    let progressBar = habitElement.querySelector(".circular-progress");
    progressEndValue = progressEndValue <= 100 ? progressEndValue : 100;

    let fillProgress = (progressValue) => {
        if (progressValue >= 100) {
            displayCircularProgressOfDoneHabit(progressBar);
        } else {
            progressBar.style.background = `
                conic-gradient(
                    rgba(65, 173, 133, 1) ${progressValue * 3.6}deg,
                    rgba(65, 173, 133, 0.3) ${progressValue * 3.6}deg
                )
            `;
        }
    };
    if (isRunning) {
        let speed = 0.1;
        let singleProgress = setInterval(() => {
            progressStartValue++;
            fillProgress(progressStartValue);
            if (progressStartValue >= progressEndValue) {
                clearInterval(singleProgress);
            }
        }, speed);
    } else {
        fillProgress(progressStartValue);
    }
}

// get goal result of each habit
function getHabitResult(habitId, selectedDate) {
    const cheerfulWords = ["go ahead", "hold on"];
    /* habits that have goal of everyday */
    if (
        ALLHABITS_[habitId]["goal"][1] === "day" &&
        ALLHABITS_[habitId]["schedule"].length === 7
    ) {
        let doneDateArr = Object.keys(ALLRECORDS_[habitId])
            .filter(
                (date) => checkIfHabitIsDone(habitId, date)["isHabitDone"] === true
            )
            .sort()
            .reverse();
        /* if users have just checked in yesterday or today then return number of days of streak */ 
        if (calTwoStringDates(doneDateArr[0], selectedDate) <= 86400 * 1000) {
            let numDaysStreak = countNumDaysStreak(doneDateArr);
            if (numDaysStreak >= 1) {
                return `${numDaysStreak}-day${numDaysStreak > 1 ? "s" : ""} streak`;
            }
        }
    }
    let habitProgress = checkIfHabitIsDone(habitId, selectedDate);
    if (habitProgress["isHabitDone"]) {
        return `Finished all ${habitProgress["numOfTimes"]} times per ${habitProgress["goalPeriod"]}`;
    } else {
        return `Finished ${habitProgress["numOfDoneTimes"]}/${habitProgress["numOfTimes"]
            } times per ${habitProgress["goalPeriod"]}, ${cheerfulWords[Math.floor(Math.random() * cheerfulWords.length)]
            }`;
    }
}

// calculate the difference in millisecond between 2 dates
function calTwoStringDates(startDate, endDate) {
    return new Date(endDate) - new Date(startDate);
}

// count num of days of streak
function countNumDaysStreak(dateArr) {
    newDateArr = dateArr.sort().reverse();
    let numDaysStreak = 1;
    for (let day = 1; day < newDateArr.length; day++) {
        if (
            calTwoStringDates(newDateArr[day], newDateArr[day - 1]) ===
            86400 * 1000
        ) {
            numDaysStreak += 1;
        } else {
            break;
        }
    }
    return numDaysStreak;
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
        updateHabitProps(habitId, "deleteAt", deletedTime);
        storeToLocalStorage(HABITTRACKING_, "habitTracking");
        /* remove the element on html */
        element.remove();
        /* update number of active habits */
        let numActiveHabits = getActiveHabitIds(selectedDate).length;
        if (numActiveHabits <= 0) {displayMainPage('initial')};
        displayActiveHabits(numActiveHabits);
        /* return to initial page if there is no active habit */
    });
}

// close all remove buttons
function closeAllRemoveButtons() {
    const allRemoveButtons = document.querySelectorAll(".remove-button");
    allRemoveButtons.forEach((item) => item.classList.remove("clicked"));
}

// create a habit item div
function createNewHabitItemDiv(habitId, habitName, selectedDate) {
    let newHabit = document.createElement("div");
    newHabit.classList.add("habit-display");
    newHabit.setAttribute("data-habit-id", habitId);
    habitName = habitName.length < 1 ? "Your habit" : habitName;

    newHabit.innerHTML = `
                <div class="progress-and-name">
                    <div class="circle-container">
                        <div class="circular-progress">
                            <div class="value-container"></div>
                        </div>
                    </div>
                    <div class='habit-name'>
                        <h3>${habitName}</h3>
                        <p class='habit-result'></p>
                    </div>
                </div>
                <div class="habit-checkbox">
                <i class="fa fa-check" aria-hidden="true"></i>
                <span>+</span>
                <p>1</p>
                </div>
            </div>
            <button class="remove-button"><i class="fa fa-minus-circle" aria-hidden="true"></i></button>
    `;
    // update habit result after changing checkbox click
    habitResult = getHabitResult(habitId, selectedDate);
    newHabit.querySelector(".habit-result").innerText = habitResult;
    // get progress percentage
    let progressPCT =
        (checkIfHabitIsDone(habitId, selectedDate)["numOfDoneTimes"] /
            checkIfHabitIsDone(habitId, selectedDate)["numOfTimes"]) *
        100;
    // fixed dislay of circular progress
    displayCircularProgress(newHabit, 0, progressPCT);
    // remove checkbox when habit is completed
    if (progressPCT >= 100) {
        displayCheckboxOfDoneHabit(newHabit.querySelector(".habit-checkbox"));
        displayCircularProgressOfDoneHabit(
            newHabit.querySelector(".circular-progress")
        );
    }
    // add eventlistener to checkbox
    addEventListenerToCheckbox(newHabit, habitId, selectedDate);
    // add click event to remove button
    addEventListenerToRemoveButton(newHabit, selectedDate);
    newHabit.addEventListener("click", function () {
        closeAllRemoveButtons();
        const removeButton = newHabit.querySelector(".remove-button");
        removeButton.classList.add("clicked");
    });
    return newHabit;
}

// check the habit is done
function checkIfHabitIsDone(habitId, selectedDate) {
    const goalSetting = ALLHABITS_[habitId]["goal"];
    let recordsOfHabit = [];
    (goalPeriod = goalSetting[1]),
        (numOfGoalTimes = goalSetting[0]),
        (allRecordsDate = ALLRECORDS_[habitId]);
    allRecordsDate =
        getLenOfObject(allRecordsDate) >= 1 ? allRecordsDate : { selectedDate: [] };

    if (goalPeriod === "day") {
        recordsOfHabit = ALLRECORDS_[habitId][selectedDate];
        recordsOfHabit = recordsOfHabit ? recordsOfHabit : [];
    } else if (goalPeriod === "week") {
        let firstLastDateOfWeek = getFirstLastDateOfWeek(selectedDate);
        for (let date of Object.keys(allRecordsDate)) {
            if (date >= firstLastDateOfWeek[0] && date <= firstLastDateOfWeek[1]) {
                recordsOfHabit = recordsOfHabit.concat(allRecordsDate[date]);
            }
        }
    } else if (goalPeriod === "month") {
        for (let date of Object.keys(allRecordsDate)) {
            if (
                new Date(selectedDate).getMonth() === new Date(date).getMonth() &&
                new Date(selectedDate).getFullYear() === new Date(date).getFullYear()
            ) {
                recordsOfHabit = recordsOfHabit.concat(allRecordsDate[date]);
            }
        }
    }
    return {
        numOfTimes: numOfGoalTimes,
        numOfDoneTimes: recordsOfHabit.length,
        goalPeriod: goalPeriod,
        isHabitDone: recordsOfHabit.length >= numOfGoalTimes,
    };
}

// habit checkbox when clicking
function addEventListenerToCheckbox(habitElement, habitId, selectedDate) {
    let audio = new Audio(
        "sound_effect/mixkit2-fast-small-sweep-transition-166.wav"
    );
    let habitCheckbox = habitElement.querySelector(".habit-checkbox"),
        recordsOfHabit = ALLRECORDS_[habitId][selectedDate];
    recordsOfHabit = recordsOfHabit ? recordsOfHabit : [];

    habitCheckbox.addEventListener("click", function () {
        audio.play();
        const oldValueOfProgress =
            (checkIfHabitIsDone(habitId, selectedDate)["numOfDoneTimes"] /
                checkIfHabitIsDone(habitId, selectedDate)["numOfTimes"]) *
            100;
        recordsOfHabit.push(getUnixTimeToday());
        ALLRECORDS_[habitId][selectedDate] = recordsOfHabit;
        storeToLocalStorage(HABITTRACKING_, "habitTracking");
        if (!checkIfHabitIsDone(habitId, selectedDate)["isHabitDone"]) {
            // change color when click to checkbox
            habitCheckbox.classList.add("clicked");
            // back to normal state after 0.5s
            let delayInMilliseconds = 500;
            setTimeout(function () {
                habitCheckbox.classList.remove("clicked");
            }, delayInMilliseconds);
        } else {
            displayCheckboxOfDoneHabit(habitCheckbox);
        }
        // change the progress circle
        displayCircularProgress(
            habitElement,
            oldValueOfProgress,
            (checkIfHabitIsDone(habitId, selectedDate)["numOfDoneTimes"] /
                checkIfHabitIsDone(habitId, selectedDate)["numOfTimes"]) *
            100,
            true
        );
        // update the habit result
        const habitResult = habitCheckbox.parentNode.querySelector(".habit-result");
        habitResult.innerText = getHabitResult(habitId, selectedDate);
    });
}

// display checkbox of done habits
function displayCheckboxOfDoneHabit(habitCheckboxElement) {
    habitCheckboxElement.classList.remove("clicked");
    habitCheckboxElement.classList.add("done");
}

// add new habit to localStorage
function addNewHabit(habitId, habitName, startDate, schedule, goal) {
    habitName = habitName.length === 0 ? "Your habit" : habitName;
    createdTime = getUnixTimeToday();
    ALLHABITS_[habitId] = {
        createdAt: createdTime,
        startedAt: startDate,
        name: habitName,
        deletedAt: null,
        schedule: schedule,
        goal: goal,
    };
}
