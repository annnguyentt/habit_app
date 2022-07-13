const selectedDate = formatDate(getUnixTimeToday(), false);
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

const periodBar = document.querySelector('#period-bar');
const periodItems = periodBar.querySelectorAll('.period');

periodBar.addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
        periodItems.forEach(item => item.classList.remove('selected'));
        event.target.classList.add('selected')

        let selectedPeriod = event.target.innerText;
        console.log(selectedPeriod);
        getTotalHabits(selectedPeriod)
    }
})

function getTotalHabits(selectedPeriod) {
    for (let habitIdProp of Object.values(allHabits)) {
        if (formatDate(habitIdProp['createAt'], false) <= ) {
    }
}

