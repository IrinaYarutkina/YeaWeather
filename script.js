//главной страницы логика
import ".//ScrollSlider/ScrollSlider.js";
import "./ScrollSlider/ScrollSliderTrack.js";

//глоб переменные
const apiKey = "b013d70d956c0980b40ce06839a8ea38";
const clock = document.getElementById("clock");
const searchForm = document.querySelector("form");
const inputCity = document.getElementById("search__input");
const nameCity = document.getElementById("weather-city-name");
const temperature = document.getElementById("weather__card__temperature");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const icon = document.getElementById("weather__card__weather-icon");
const date = document.getElementById("weather__card__date");
function getNow() {
  return new Date();
}
let currentTempC = null; // температура в цельсиях
let isFahrenheit = false; // текущее состояние переключателя
let forecastData = null; //для погоды
const scrollSlider = document.querySelector("scroll-slider"); //слайдер
const sliderTrack = document.querySelector(".weather-hour__list");
const tomorrowBtn = document.getElementById("tomorrow");
const weekLink = document.getElementById("weekLink");

function getUsersCoords() {
  const MoscowCoord = { lat: 55.75583, lon: 37.6173 }; //по умолчанию
  if (!navigator.geolocation) {
    console.log(
      "Геолокация не поддерживается, используем координаты по умолчанию"
    );
    return Promise.resolve(MoscowCoord);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => {
        console.log("Ошибка получения геолокации:", err);
        resolve(MoscowCoord);
      }
    );
  });
}
getUsersCoords().then(({ lat, lon }) => {
  console.log("Используемые координаты:", lat, lon);
  fetch(
    `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`
  )
    .then((res) => res.json())
    .then((data) => {
      const nameRu = data[0].local_names.ru;
      localStorage.setItem("weatherCity", nameRu);
      getWeather(nameRu);
    })
    .catch((err) => {
      console.error("Ошибка при получении данных:", err);
    });
});
//____________________________________
//функция для обновл с цельсия на фаренгейт
function updateTemperature() {
  if (currentTempC === null) return;

  if (isFahrenheit) {
    const tempF = Math.round((currentTempC * 9) / 5 + 32);
    temperature.textContent = `${tempF}°F`;
  } else {
    temperature.textContent = `${currentTempC}°C`;
  }
}
//переключение с Цельсия на фаренгейт: изменяет цифровые значения
const toggle = document.querySelector(".header__switch-toggle");
const switchWrap = document.querySelector(".header__switch");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("header__switch-toggle-on");
  switchWrap.classList.toggle("is-f");

  isFahrenheit = !isFahrenheit; // меняем состояние
  updateTemperature(); // обновляем значение
  showWeatherNextHours(forecastData);
});

//функция для загрузки погоды для города
function getWeather(city) {
  fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=ru`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
      }
      return response.json();
    })
    .then((data) => {
      currentTempC = Math.round(data.main.temp);
      nameCity.textContent = data.name;
      updateTemperature(); //вызов для фаренгейта

      icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      humidity.textContent = `${data.main.humidity}%`;
      const pressureMm = Math.round(data.main.pressure * 0.750062);
      pressure.textContent = `${pressureMm} мм рт. ст.`;
      wind.textContent = `${Math.round(data.wind.speed)} м/сек`;

      scrollSlider?.handleScroll();

      const lat = data.coord.lat;
      const lon = data.coord.lon;
      return fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ru`
      );
    })
    .then((response) => response.json())
    .then((data) => {
      forecastData = data;
      showWeatherNextHours(data);
    })
    .catch((error) => {
      console.error("Ошибка:", error);
      showError();
    });
}

//функция для ошибки, если не удалось найти/загрузить город
function showError() {
  nameCity.textContent = "Упс, не удалось найти город...";
  temperature.textContent = "--";
  icon.src = "";
  icon.alt = "пусто😭";
  humidity.textContent = "--";
  pressure.textContent = "--";
  wind.textContent = "--";
  sliderTrack.innerHTML = "";
}
//___________________________
//текущее время
function updateTime() {
  const hours = String(getNow().getHours()).padStart(2, "0");
  const minutes = String(getNow().getMinutes()).padStart(2, "0");
  clock.textContent = `${hours}:${minutes}`;
}
function startClock() {
  updateTime();
  const delay = (60 - getNow().getSeconds()) * 1000;
  setTimeout(() => {
    updateTime();
    setInterval(updateTime, 60000);
  }, delay);
}
//текущая дата
function updateDate() {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();

  date.textContent = `${day}.${month}.${year}`;
}
updateDate(); //обн даты
startClock(); // для врем
//функция которая показывает погоду через каждые 3 часа
function showWeatherNextHours(data) {
  if (!data) return;
  sliderTrack.innerHTML = "";
  const nowDay = getNow();
  const nextHours = data.list
    .filter((item) => new Date(item.dt * 1000) > nowDay)
    .slice(0, 8);
  nextHours.forEach((item) => {
    const itemDate = new Date(item.dt * 1000);
    const hour = itemDate.getHours().toString().padStart(2, "0");
    const tempС = Math.round(item.main.temp);
    const displayTemp = isFahrenheit ? Math.round((tempС * 9) / 5 + 32) : tempС;
    const unit = isFahrenheit ? "°F" : "°C";
    const iconCode = item.weather[0].icon;
    const iconSrc = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const card = document.createElement("div");
    card.classList.add("weather-hour__list-card");
    card.innerHTML = `
      <div class="weather-hour__info">
        <span id="info-time">${hour.toString().padStart(2, "0")}:00</span>
        <img class="weather-hour__info-icon"
              src="${iconSrc}"
              alt="погода" />
        <span id="info-temp">${displayTemp}${unit}</span>
      </div>
      <div class="weather-hour__dark-bottom"></div>
    `;
    sliderTrack.appendChild(card);
  });
}
//погода на "завтра"
function getForecastTomorrow(data) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];
  console.log(data.list);
  const tomorrowForecast = data.list.find(
    (item) =>
      item.dt_txt.includes(tomorrowStr) && item.dt_txt.includes("12:00:00")
  );
  if (!tomorrowForecast) return;
  console.log(tomorrowForecast);
  currentTempC = Math.round(tomorrowForecast.main.temp);
  updateTemperature();
  nameCity.textContent = nameCity.textContent;
  icon.src = `https://openweathermap.org/img/wn/${tomorrowForecast.weather[0].icon}@2x.png`;
  humidity.textContent = `${Math.round(tomorrowForecast.main.humidity)}%`;
  const pressureMm = Math.round(tomorrowForecast.main.pressure * 0.750062);
  pressure.textContent = `${pressureMm} мм рт. ст.`;
  wind.textContent = `${Math.round(tomorrowForecast.wind.speed)} м/сек`;
  const day = tomorrow.getDate().toString().padStart(2, "0");
  const month = (tomorrow.getMonth() + 1).toString().padStart(2, "0");
  date.textContent = `${day}.${month}.${tomorrow.getFullYear()}`;
}

tomorrowBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!forecastData) return;

  getForecastTomorrow(forecastData);
});

weekLink.addEventListener("click", (e) => {
  e.preventDefault();
  const city = nameCity.textContent;
  window.location.href = `/week.html?city=${encodeURIComponent(city)}`;
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = inputCity.value.trim();
  if (city) {
    localStorage.setItem("weatherCity", city);
    getWeather(city);
  }
});
