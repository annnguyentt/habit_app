const selectedDate = formatDate(getUnixTimeToday(), false);
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

const periodItems = document.querySelector('#period-items');
periodItems.addEventListener('click', function(event) {
    console.log(event.target.innerText)
});

