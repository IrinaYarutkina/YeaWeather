const apiKey = "b013d70d956c0980b40ce06839a8ea38";
const inputCity = document.getElementById("search__input");
const searchForm = document.querySelector("form");
const clock = document.getElementById("clock");
let currentTempC = null;
let forecastData = [];
let isFahrenheit = false;
function getNow() {
  return new Date();
}
const forecastWeek = document.querySelector(".forecast__week");

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
startClock();

//функция для обновл с цельсия на фаренгейт
function updateTemperature(temp) {
  if (isFahrenheit) {
    return Math.round((temp * 9) / 5 + 32) + "°F";
  }
  return Math.round(temp) + "°C";
}
//работа переключател
const toggle = document.querySelector(".header__switch-toggle");
const switchWrap = document.querySelector(".header__switch");

toggle.addEventListener("click", () => {
  toggle.classList.toggle("header__switch-toggle-on");
  switchWrap.classList.toggle("is-f");

  isFahrenheit = !isFahrenheit;
  renderCards(forecastData);
});

//поиск города в форме
searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const city = inputCity.value.trim();
  if (city) {
    getDataForWeek(city);
  }
});
//получаем данные из АПИ
function getDataForWeek(city) {
  if (!city) return;
  fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=ru`
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Город "${city}" не найден`);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);

      const filteredDays = getFilteredObj(data);
      forecastData = filteredDays;
      renderCards(filteredDays);
    })
    .catch((error) => {
      console.error(error);
      showError();
    });
}
//для показа ошибки
function showError() {
  forecastWeek.innerHTML = "";
  const text = document.createElement("p");
  text.textContent = "Кажется, такого города не существует!";
  text.classList.add("forecast__week-text");
  forecastWeek.append(text);
}
//получаем только нужные значения
function getFilteredObj(data) {
  const days = {};
  data.list.forEach(({ dt_txt, main, weather }) => {
    const [date, time] = dt_txt.split(" ");
    if (!days[date]) {
      days[date] = {
        date,
        dayTemp: null,
        nightTemp: null,
        dayIcon: null,
        nightIcon: null,
      };
    }
    const iconCode = weather[0].icon;
    const iconSrc = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    const hour = Number(time.split(":")[0]);
    if (hour === 6 || hour === 9 || hour === 12) {
      if (days[date].dayTemp === null) {
        days[date].dayTemp = main.temp;
        days[date].dayIcon = iconSrc;
      }
    }

    if (hour === 0 || hour === 3 || hour === 21) {
      if (days[date].nightTemp === null) {
        days[date].nightTemp = main.temp;
        days[date].nightIcon = iconSrc;
      }
    }
  });
  const result = Object.values(days).filter(
    (day) => day.dayTemp !== null || day.nightTemp !== null
  );
  console.log(result);
  return result.slice(1, 6);
}

//для карточек с погодой
function createForecastCard(day, isFirst = false) {
  const dateObj = new Date(day.date);
  const weekDay = dateObj
    .toLocaleDateString("ru-RU", { weekday: "short" })
    .toUpperCase();
  const dayDate = dateObj.getDate().toString().padStart(2, "0");
  const monthDate = (dateObj.getMonth() + 1).toString().padStart(2, "0");

  const card = document.createElement("div");
  card.className = "forecast__day";

  card.innerHTML = `
    <div class="forecast__day-info">
    <span class="forecast__day-weekday">${weekDay}</span>
    <span class="forecast__day-date">${dayDate}.${monthDate}</span>
  </div>

    <div class="forecast__day-temp forecast__day-temp--day">
      <p class="forecast__day-tempValue">${updateTemperature(day.dayTemp)}</p>
      <img class="forecast__day-tempIcon"
        src="${day.dayIcon}"
        alt="Температура днём" />
    </div>

    <div class="forecast__day-temp forecast__day-temp--night">
      <p class="forecast__day-tempValue">${updateTemperature(day.nightTemp)}</p>
      <img class="forecast__day-tempIcon"
        src="${day.nightIcon}"
        alt="Температура ночью" />
    </div>
  `;
  return card;
}
//ренде карточек на страничке
function renderCards(days) {
  forecastWeek.innerHTML = "";
  days.forEach((day) => {
    const card = createForecastCard(day);
    forecastWeek.appendChild(card);
  });
}
