//глоб переменные

const apiKey = "ad4bd249c67941033714a1851c8bd49e";
const clock = document.getElementById("clock");
const inputCity = document.getElementById("search__input");
const btnSearch = document.getElementById("search__button");
const blockWithActiveWeather = document.querySelector(".weather-card"); // нужно ли это?
const nameCity = document.getElementById("weather-city-name");
const temperature = document.getElementById("weather-card__temperature");
const humidity = document.getElementById("humidity");
const pressure = document.getElementById("pressure");
const wind = document.getElementById("wind");
const icon = document.getElementById("weather-card__weather-icon");
const now = new Date();
const date = document.getElementById("weather-card__date");

//____________________________________
//функция для загрузки погоды для города по поиску
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
      nameCity.textContent = data.name;
      temperature.textContent = `${Math.round(data.main.temp)}°C`;
      icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      humidity.textContent = `${data.main.humidity}%`;
      const pressureMm = Math.round(data.main.pressure * 0.750062);
      pressure.textContent = `${pressureMm} мм рт. ст.`;
      wind.textContent = `${Math.round(data.wind.speed)} м/сек`;
    })
    .catch((error) => {
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
}
//вызов функции при нажатии на кнопку
btnSearch.addEventListener("click", () => {
  const city = inputCity.value.trim();
  getWeather(city);
});

//___________________________
//реальное время
function updateTime() {
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  clock.textContent = `${hours}:${minutes}`;
}
function startClock() {
  updateTime();

  const delay = (60 - now.getSeconds()) * 1000;

  setTimeout(() => {
    updateTime();
    setInterval(updateTime, 60000);
  }, delay);
}

startClock();

//переключатель с Цельсия на фаренгейт: изменяет цифровые значения
const toggle = document.querySelector(".header__switch-toggle");
const switchWrap = document.querySelector(".header__switch");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("header__switch-toggle-on");
  switchWrap.classList.toggle("is-f");
});

//выбор дня для погоды: сегодня, завтра

//текущая дата
function updateDate() {
  const today = new Date();

  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear();

  date.textContent = `${day}.${month}.${year}`;
}

updateDate();
//массив погоды на 12 часов, через каждые 2 часа
