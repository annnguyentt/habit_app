// add clicked to weekly button
const weeklyButton = document.querySelector('#weekly');
const weeklyCheckbox = document.querySelector('.weekly-checkbox');
const allweeklyItems = weeklyCheckbox.querySelectorAll('input[type="checkbox"]');
const monthlyButton = document.querySelector('#monthly');
// const monthlyCheckbox = document.querySelector('.monthly-checkbox');
// const allMonthlyItems = monthlyCheckbox.querySelectorAll('input[type="checkbox"]');

const repeatSchedule = {};
let selectedWeekdays = [];

function calSelectedWeekdays(allItems) {
    selectedWeekdays = [];
    for (let i = 0; i < allItems.length; i++) {
        if (allItems[i].checked) {
            selectedWeekdays.push(allItems[i].value)
        }
    }
}

weeklyButton.addEventListener('click', function () {
    weeklyCheckbox.classList.add('clicked');
    
});

// remove clicked to weekly button
document.addEventListener('click', function (event) {
    if (weeklyCheckbox.classList.contains('clicked')) {
        if (monthlyButton.contains(event.target)) {
            weeklyCheckbox.classList.remove('clicked');
            allweeklyItems.forEach(element => element.checked = true);
        }
        else if ((!weeklyButton.contains(event.target))
            && (!weeklyCheckbox.contains(event.target))) {
            weeklyCheckbox.classList.remove('clicked');
        }
    }
});

// // add clicked to monthly button
// const monthlyButton = document.querySelector('#monthly');
// const monthlyCheckbox = document.querySelector('.monthly-checkbox');
// const allMonthlyItems = monthlyCheckbox.querySelectorAll('input[type="checkbox"]');
// monthlyButton.addEventListener('click', function () {
//     monthlyCheckbox.classList.add('clicked');
// });
// // remove clicked to monthly button
// document.addEventListener('click', function (event) {
//     if ((monthlyCheckbox.classList.contains('clicked'))
//         && (!monthlyButton.contains(event.target))
//         && (!monthlyCheckbox.contains(event.target))
//     ) {
//         monthlyCheckbox.classList.remove('clicked');
//         allMonthlyItems.forEach(element => element.checked = false);
//     }
// });