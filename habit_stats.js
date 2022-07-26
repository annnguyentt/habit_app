/* DECLARE GLOBAL VARS */
const today = formatDate(getUnixTimeToday(), false);
const HABIT_TRACKING = retrieveDataFromLocal("habitTracking");
const ALL_HABITS = HABIT_TRACKING["habits"];
const ALL_RECORDS = HABIT_TRACKING["records"];
let SELECTED_PERIOD = "This Week";

displayPeriod(getStartEndDatesOfPeriod(SELECTED_PERIOD));
displayAllMetrics(getStartEndDatesOfPeriod(SELECTED_PERIOD));

/* UDF */
// return selected period
function changeSelectedPeriod(element) {
    const periodItems = periodBar.querySelectorAll(".period");
    if (element.tagName === "LI") {
        periodItems.forEach((item) => item.classList.remove("selected"));
        element.classList.add("selected");
        SELECTED_PERIOD = element.innerText;
    }
}

// display start date and end date of selected period
function displayPeriod([startDate, endDate]) {
    let periodDisplay = document.querySelector("#period-display");
    periodDisplay.innerText = `From ${startDate} To ${endDate}`;
}

// get start date and end date when choosing Custom
let START_END_DATES_CUSTOM = [today, today];

function getStartEndDatesOfCustom() {
    const applyButton = document.querySelector(".applyBtn");
    let dateRange = document.querySelector(".drp-selected");
    applyButton.addEventListener("click", function () {
        START_END_DATES_CUSTOM = dateRange.innerText.split(" - ");
        displayPeriod(START_END_DATES_CUSTOM);
        displayAllMetrics(START_END_DATES_CUSTOM);
    });
}
// get start date and end date when choosing other options
function getStartEndDatesOfPeriod(selectedPeriod) {
    let selectedDateArr = [];
    if (selectedPeriod === "This Week") {
        selectedDateArr = getFirstLastDateOfWeek(today);
    } else if (selectedPeriod === "This Month") {
        selectedDateArr = getFirstLastDateOfMonth(today);
    } else if (selectedPeriod === "Last Month") {
        selectedDateArr = getFirstLastDateOfMonth(
            formatDate(new Date(today).setDate(0), false)
        );
    } else if (selectedPeriod === "Last 30 Days") {
        let dateArr = getDateArr(30, new Date(today).getTime() - 86400 * 1000 * 30);
        selectedDateArr = [
            formatDate(dateArr[0], false),
            formatDate(dateArr[dateArr.length - 1], false),
        ];
    } else if (selectedPeriod === "Last 60 Days") {
        let dateArr = getDateArr(60, new Date(today).getTime() - 86400 * 1000 * 60);
        selectedDateArr = [
            formatDate(dateArr[0], false),
            formatDate(dateArr[dateArr.length - 1], false),
        ];
    } else if (selectedPeriod === "Custom") {
        getStartEndDatesOfCustom();
        return START_END_DATES_CUSTOM;
    }
    return selectedDateArr;
}

// get date array from start and end
function getDatesArrFromStartEnd(s, e) {
    for (
        var a = [], d = new Date(s);
        d <= new Date(e);
        d.setDate(d.getDate() + 1)
    ) {
        a.push(formatDate(new Date(d), false));
    }
    return a;
}

// get valid records
function getValidHabits(dateRange) {
    allHabitIds = Object.keys(ALL_HABITS);
    return allHabitIds.filter(
        (item) =>
            ALL_HABITS[item]["startedAt"] <= dateRange[1] &&
            (!ALL_HABITS[item]["deletedAt"] ||
                formatDate(ALL_HABITS[item]["deletedAt"], false) >= dateRange[0])
    );
}

// get value of the metric
function getValueOfEachMetric(dateRange, metric) {
    // get all valid habitIds which is within the date range
    const validHabitIds = getValidHabits(dateRange);
    // generate all dates of the date range
    const dateArr = getDatesArrFromStartEnd(dateRange[0], dateRange[1]);

    let resultObj = { records: [], value: 0 };
    // total-habit
    if (metric === "total-habit") {
        resultObj["records"] = validHabitIds;
        resultObj["value"] = validHabitIds.length;
        return resultObj;
    }
    // fully-done
    else if (metric === "fully-done") {
        for (let habitId of validHabitIds) {
            for (let date of dateArr) {
                // if there is any date at which the habit is done, it counts
                if (checkIfHabitIsDone(habitId, date)["isHabitDone"]) {
                    resultObj["records"].push(habitId);
                    break;
                }
            }
        }
        resultObj["value"] = resultObj["records"].length;
        return resultObj;
    }
    // longest streak
    else if (metric === "longest-streak") {
        // record max days of streak of each habit
        let maxStreakOfEachHabit = {};
        for (let habitId of validHabitIds) {
            let allRecordDates = Object.keys(ALL_RECORDS[habitId]);
            let idx = 1,
                streakRecords = [];
            while (idx <= allRecordDates.length) {
                streakRecords.push(countNumDaysStreak(allRecordDates.slice(0, idx)));
                idx += 1;
            }
            maxStreakOfEachHabit[habitId] = Math.max.apply(Math, streakRecords);
        }
        // get max days of streak of all habits
        let maxDaysOfStreak = Math.max.apply(
            Math,
            Object.values(maxStreakOfEachHabit)
        );
        maxDaysOfStreak = maxDaysOfStreak > 0 ? maxDaysOfStreak : 0;
        // filter all habitIds that have num days of streak equal to the overall max point
        for (let [habitId, value] of Object.entries(maxStreakOfEachHabit)) {
            if (value === maxDaysOfStreak) {
                resultObj["records"].push(habitId);
            }
        }
        resultObj["value"] = maxDaysOfStreak;
        return resultObj;
    }
}

// display value of metric
function displayValueOfMetric(dateRange, metric) {
    if (metric === "total-habit") {
        const totalHabits = document
            .querySelector(`#${metric}`)
            .querySelector(".item-value");
        totalHabits.innerText = getValueOfEachMetric(dateRange, metric)["value"];
    } else if (metric === "fully-done") {
        const fullyDoneHabits = document
            .querySelector(`#${metric}`)
            .querySelector(".item-value");
        fullyDoneHabits.innerText = getValueOfEachMetric(dateRange, metric)[
            "value"
        ];
    } else if (metric === "longest-streak") {
        const longestStreak = document
            .querySelector(`#${metric}`)
            .querySelector(".item-value");
        longestStreak.innerText = `${getValueOfEachMetric(dateRange, metric)["value"]
            } Days `;
    } else if (metric === "completion-rate") {
        const completionRate = document
            .querySelector(`#${metric}`)
            .querySelector(".item-value");
        let value =
            (getValueOfEachMetric(dateRange, "fully-done")["value"] /
                getValueOfEachMetric(dateRange, "total-habit")["value"]) *
            100;
        value = value ? value : 0;
        completionRate.innerText = `${value.toFixed(0)} %`;
    }
}

// display all metrics
function displayAllMetrics(dateRange) {
    let metricArr = [
        "total-habit",
        "fully-done",
        "longest-streak",
        "completion-rate",
    ];
    for (let i of metricArr) {
        displayValueOfMetric(dateRange, i);
    }
}

/* addEventListener TO periodBar */
const periodBar = document.querySelector("#period-bar");
periodBar.addEventListener("click", function (event) {
    // change selected period
    changeSelectedPeriod(event.target);
    // get start date and end date of the selected period
    let selectedDateArr = getStartEndDatesOfPeriod(SELECTED_PERIOD);
    displayPeriod(selectedDateArr);
    // update total habits
    displayAllMetrics(selectedDateArr);
});

/* BAR CHART */
// Bar Chart
let high_prices_appl = [];

const dates = getDatesArrFromStartEnd('2022-07-01', '2022-07-25');
for (let i of dates) {
    high_prices_appl.push(getValueOfEachMetric([i, i], 'total-habit')['value'])
}


let high_prices_spot = [ 
    // 138.72, 137.26, 139.81, 135.37, 
    // 135.38, 125.91, 125.93, 134.59, 
    // 139.86, 147.5 
];

for (let i of dates) {
    high_prices_spot.push(getValueOfEachMetric([i, i], 'fully-done')['value'])
}

const data = {
    labels: dates,
    datasets: [
        {
            label: 'Total habits',
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 99, 132)',
            data: high_prices_appl
        },
        {
            label: 'Completed habits',
            backgroundColor: 'rgb(0, 0, 255)',
            borderColor: 'rgb(0, 0, 255)',
            data: high_prices_spot
        }
    ]
};
const config_bar = {
    type: 'bar',
    data: data,
    options: {
        responsive: false
    },
};
const myBarChart = new Chart(document.getElementById('barChart'), config_bar);
