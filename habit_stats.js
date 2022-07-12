const selectedDate = formatDate(getUnixTimeToday(), false);
const habitTracking = retrieveDataFromLocal("habitTracking");
const allHabits = habitTracking["habits"];
const allRecords = habitTracking["records"];

