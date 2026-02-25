// ================================
// BASIC DOM SELECTORS
// ================================
const inputBox = document.querySelector(".searchInput");
const searchBtn = document.querySelector(".searchBtn");
const locationBtn = document.querySelector(".locationBtn");
const errorBox = document.querySelector(".errorBox");

const currentWeatherBox = document.querySelector(".currentWeatherBox");
const cityNameEl = document.querySelector(".cityName");
const tempEl = document.querySelector(".temperature");
const descEl = document.querySelector(".description");
const humidityEl = document.querySelector(".humidity");
const windEl = document.querySelector(".wind");
const feelsEl = document.querySelector(".feels");

const forecastContainer = document.querySelector(".forecastContainer");
const toggleTempBtn = document.querySelector(".toggleTemp");

const recentBtn = document.querySelector(".recentBtn");
const recentDropdown = document.querySelector(".recentDropdown");

// ================================
// YOUR API KEY
// ================================
const API_KEY = "fd4231a8a7977d18b9e6e2ae19084103";

// ================================
// STATE VARIABLES
// ================================
let isCelsius = true;
let recentCities = [];
let originalTemp = 0;

// Load cities from storage at start
if (localStorage.getItem("recentCities")) {
    recentCities = JSON.parse(localStorage.getItem("recentCities"));
}

// ================================
// SHOW ERROR MESSAGE
// ================================
function showError(msg) {
    errorBox.style.display = "block";
    errorBox.innerHTML = msg;

    setTimeout(() => {
        errorBox.style.display = "none";
    }, 3000);
}

// ================================
// FETCH WEATHER BY CITY
// ================================
function getWeatherByCity(city) {

    if (city.trim() === "") {
        showError("Please enter a valid city name.");
        return;
    }
    const url =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (data.cod !== 200) {
                showError("Unable to fetch weather data. Please check the city name.");
                return;
            }

            // Update UI
            updateCurrentWeather(data);

            // Save city in history
            saveCity(city);

            // Fetch forecast
            getForecast(data.coord.lat, data.coord.lon);
        })
        .catch(() => showError("Network issue. Try again."));
}

// ================================
// FETCH WEATHER BY LOCATION
// ================================
function getWeatherByLocation() {

    if (!navigator.geolocation) {
        showError("Geolocation not supported.");
        return;
    }

    navigator.geolocation.getCurrentPosition(
        position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            const url =
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

            fetch(url)
                .then(res => res.json())
                .then(data => {
                    updateCurrentWeather(data);
                    getForecast(lat, lon);
                });
        },
        () => showError("Please allow location access.")
    );
}

// ================================
// UPDATE CURRENT WEATHER UI
// ================================
function updateCurrentWeather(data) {

    currentWeatherBox.style.display = "block";

    cityNameEl.innerHTML = data.name;
    originalTemp = data.main.temp;
    tempEl.innerHTML = originalTemp + "°C";
    descEl.innerHTML = data.weather[0].description;
    humidityEl.innerHTML = "Humidity: " + data.main.humidity + "%";
    windEl.innerHTML = "Wind: " + data.wind.speed + " m/s";
    feelsEl.innerHTML = "Feels Like: " + data.main.feels_like + "°C";

    // Change background
    changeBackground(data.weather[0].main);

    // Extreme temperature alert
    if (data.main.temp > 40) {
        showError("⚠️ Extreme Heat Alert! Stay Hydrated!");
    }
}

// ================================
// WEATHER BACKGROUND CHANGE
// ================================
function changeBackground(condition) {
    const body = document.body;

    body.className = "";

    if (condition.includes("Rain")) body.classList.add("rainy-bg");
    else if (condition.includes("Cloud")) body.classList.add("cloudy-bg");
    else if (condition.includes("Clear")) body.classList.add("sunny-bg");
    else body.classList.add("default-bg");
}

// ================================
// FETCH 5-DAY FORECAST
// ================================
function getForecast(lat, lon) {

    const url =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            displayForecast(data.list);
        });
}

// ================================
// DISPLAY FORECAST CARDS
// ================================
function displayForecast(list) {

    forecastContainer.innerHTML = "";

    for (let i = 0; i < list.length; i += 8) {

        const item = list[i];

        // Creating card (same style you use)
        const card = document.createElement("div");
        card.classList.add("abhiCard");

        const date = new Date(item.dt_txt).toDateString();

        card.innerHTML = `
            <h3>${date}</h3>
            <img src="http://openweathermap.org/img/wn/${item.weather[0].icon}.png" />
            <p>Temp: ${item.main.temp}°C</p>
            <p>Wind: ${item.wind.speed} m/s</p>
            <p>Humidity: ${item.main.humidity}%</p>
        `;

        forecastContainer.appendChild(card);
    }
}

// ================================
// SAVE RECENT CITIES
// ================================
function saveCity(city) {

    if (recentCities.includes(city)) return;

    recentCities.push(city);

    if (recentCities.length > 5) recentCities.shift();

    localStorage.setItem("recentCities", JSON.stringify(recentCities));
}

// ================================
// SHOW DROPDOWN
// ================================
recentBtn.addEventListener("click", () => {

    recentDropdown.innerHTML = "";

    if (recentCities.length === 0) {
        recentDropdown.innerHTML = "<p>No recent searches</p>";
    } else {

        recentCities.forEach(city => {
            const p = document.createElement("p");
            p.classList.add("abhiCityItem");
            p.innerHTML = city;

            p.addEventListener("click", () => {
                inputBox.value = city;
                getWeatherByCity(city);
                recentDropdown.classList.add("hidden");
            });

            recentDropdown.appendChild(p);
        });
    }

    recentDropdown.classList.toggle("hidden");
});

// ================================
// TEMPERATURE TOGGLE
// ================================
toggleTempBtn.addEventListener("click", () => {

    if (isCelsius) {
        let fahrenheit = (originalTemp * 9 / 5) + 32;
        tempEl.innerHTML = fahrenheit.toFixed(1) + "°F";
        toggleTempBtn.innerHTML = "Show in °C";
    } else {
        tempEl.innerHTML = originalTemp.toFixed(1) + "°C";
        toggleTempBtn.innerHTML = "Show in °F";
    }

    isCelsius = !isCelsius;
});

// ================================
// EVENT LISTENERS
// ================================
searchBtn.addEventListener("click", () => {
    getWeatherByCity(inputBox.value);
});

locationBtn.addEventListener("click", getWeatherByLocation);


// Adding Enter Key for improving city search user experience

inputBox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        getWeatherByCity(inputBox.value);
    }
});