const searchButton = document.getElementsByClassName('search-bar-toggle')[0];
const searchBar = document.getElementsByClassName('search-bar')[0];

searchButton.addEventListener('click', function () {
    searchBar.classList.add('clicked');
    const inputArea = searchBar.querySelector('input');
    inputArea.focus()
})

document.addEventListener('click', function (event) {
    if ((!searchBar.contains(event.target)) && (searchBar.classList.contains('clicked')) ) {
        searchBar.classList.remove('clicked');
    }
})

searchBar.addEventListener('click', function (event) {
    const inputArea = searchBar.querySelector('input');
    const num_text = encodeURIComponent(inputArea.value).length
    if ((num_text >= 1) && (searchButton.contains(event.target))) {
        const userInputValue = encodeURIComponent(inputArea.value);
        window.location.href = `search_result.html?keyword=${userInputValue}`
    }
})

searchBar.addEventListener('keydown', function (e) {
    if (e.keyCode === 27) {
        searchBar.classList.remove("clicked");
    }
    else if (e.keyCode === 13) {
        const userInputValue = encodeURIComponent(searchBar.querySelector('input').value);
        window.location.href = `search_result.html?keyword=${userInputValue}`
    }
});