/* SHOW CHOSEN DATE ON MAIN PAGE */
const selectedDate = formatDate(getUnixTimeToday(), false);

const showableDateArray = getDateArr(0, (new Date(selectedDate).getTime())).map((item) =>
    formatDate(item)
);
const showableDates = document.querySelector(".showable-dates");
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
const audio = new Audio("sound_effect/8SUM472-click-casual-digital.mp3");
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

let numActiveHabits = getActiveHabitIds(selectedDate).length;
displayActiveHabits(numActiveHabits);

const addNewButton = document.querySelector(".add-new-habit");
const blankHabit = document.querySelector(".habit-input");

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

/* ADD TO HOMESCREEN */
// Initialize deferredPrompt for use later to show browser install prompt.
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later.
    deferredPrompt = e;
    // Update UI notify the user they can install the PWA
    showInstallPromotion();
    // Optionally, send analytics event that PWA install promo was shown.
    console.log(`'beforeinstallprompt' event was fired.`);
});

buttonInstall.addEventListener('click', async () => {
    // Hide the app provided install promotion
    hideInstallPromotion();
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    // Optionally, send analytics event with outcome of user choice
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, throw it away
    deferredPrompt = null;
});


window.addEventListener('appinstalled', () => {
    // Hide the app-provided install promotion
    hideInstallPromotion();
    // Clear the deferredPrompt so it can be garbage collected
    deferredPrompt = null;
    // Optionally, send analytics event to indicate successful install
    console.log('PWA was installed');
});

function getPWADisplayMode() {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (document.referrer.startsWith('android-app://')) {
        return 'twa';
    } else if (navigator.standalone || isStandalone) {
        return 'standalone';
    }
    return 'browser';
}

